import { Hono } from "hono";
import type { Context } from "hono";
import { cors } from "hono/cors";
import { env } from "hono/adapter";
import { HTTPException } from "hono/http-exception";
import { object, pipe, number, value, string, safeParse } from "valibot";
import { SkyWayAuthToken } from "./skyway2023/skyway-auth-token";

const schema = object({
  formatVersion: pipe(number(), value(1)),
  channelName: string(),
  peerId: string(),
});

export function routing(app: Hono) {
  // CORS Middleware
  app.use(async (c, next) => {
    const REQUEST_ORIGIN = c.req.header("Origin");

    const { ACCESS_CONTROL_ALLOW_ORIGIN } = env<{
      ACCESS_CONTROL_ALLOW_ORIGIN: string[] | string;
    }>(c);

    if (REQUEST_ORIGIN == undefined || REQUEST_ORIGIN === "") {
      throw new HTTPException(400, { message: "Origin is required." });
    }

    if (!isAllowedOrigin(REQUEST_ORIGIN, ACCESS_CONTROL_ALLOW_ORIGIN)) {
      throw new HTTPException(403, { message: "Forbidden." });
    }

    const corsMiddlewareHandler = cors({
      origin: [REQUEST_ORIGIN],
      allowHeaders: ["Content-Type", "Accept"],
      allowMethods: ["POST", "GET", "OPTIONS"],
      maxAge: 86400,
    });

    return corsMiddlewareHandler(c, next);
  });

  // Routing
  app.get("/v1/status", (c) => {
    return c.text("OK");
  });

  // Routing
  app.post("/v1/skyway2023/token", async (c) => {
    const { SKYWAY_APP_ID, SKYWAY_SECRET, SKYWAY_UDONARIUM_LOBBY_SIZE } = env<{
      ENVIRONMENT: string;
      SKYWAY_APP_ID: string;
      SKYWAY_SECRET: string;
      SKYWAY_UDONARIUM_LOBBY_SIZE: number;
    }>(c);

    if (!SKYWAY_APP_ID || !SKYWAY_SECRET) {
      throw new HTTPException(500, { message: "Internal Server Error." });
    }

    const data = await parseRequestBody(c);

    const validationResult = safeParse(schema, data);
    if (!validationResult.success) {
      throw new HTTPException(400, { message: "Bad Request." });
    }

    const token = await SkyWayAuthToken.create(
      `${SKYWAY_APP_ID}`,
      `${SKYWAY_SECRET}`,
      SKYWAY_UDONARIUM_LOBBY_SIZE ?? 3,
      `${data.channelName}`,
      `${data.peerId}`
    );

    return c.json({ token }, 200);
  });

  return app;
}

/**
 * 複数のContent-Typeに対応したリクエストボディのパース
 *
 * @param c Context
 * @returns 複数のContent-Typeに対応したリクエストボディ
 * @throws HTTPException
 */
async function parseRequestBody(c: Context): Promise<any> {
  const contentType = c.req.header("Content-Type") || "";

  const DATA_MAP: { [key: string]: () => Promise<any> } = {
    "application/json": async () => await c.req.json(),
    "application/x-www-form-urlencoded": async () => await c.req.parseBody(),
    "text/plain": async () => JSON.parse(await c.req.text()),
  };
  const dataParser = Object.keys(DATA_MAP).find((key) =>
    contentType.includes(key)
  );

  if (dataParser) {
    return await DATA_MAP[dataParser]();
  }

  throw new HTTPException(415, { message: "Unsupported Media Type." });
}

/**
 * Originの許可判定: 完全修飾ドメインによる厳格な比較ではないので注意
 * @example "https://example.com" と "https://example.com:8080" は同一Originとして扱われる
 *
 * @param requestOrigin リクエスト元のOrigin
 * @param allowedOrigins 許可するOrigin
 * @returns 許可されている場合はtrue
 */
function isAllowedOrigin(
  requestOrigin: string = "",
  allowedOrigins: string[] | string = ""
): boolean {
  const origins = Array.isArray(allowedOrigins)
    ? allowedOrigins
    : [allowedOrigins];
  return origins.some(
    (origin) => origin === "*" || requestOrigin.startsWith(`${origin}/`)
  );
}
