import { Hono } from "hono";
import { cors } from "hono/cors";
import { env } from "hono/adapter";
import { HTTPException } from "hono/http-exception";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { SkyWayAuthToken } from "./skyway2023/skyway-auth-token";

const schema = z.object({
  formatVersion: z.number().int().min(1).max(1), // Fixed to 1
  channelName: z.string(),
  peerId: z.string(),
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
    });

    return corsMiddlewareHandler(c, next);
  });

  // Routing
  app.get('/v1/status', (c) => {
    return c.text('OK');
  });

  // Routing
  app.post(
    '/v1/skyway2023/token',
    zValidator("json", schema, (result, c) => {
      if (!result.success) {
        throw new HTTPException(400, { message: "Bad Request." });
      }
    }),
    async (c) => {
      const {
        SKYWAY_APP_ID,
        SKYWAY_SECRET,
        SKYWAY_UDONARIUM_LOBBY_SIZE
      } = env<{
        ENVIRONMENT: string,
        SKYWAY_APP_ID: string,
        SKYWAY_SECRET: string,
        SKYWAY_UDONARIUM_LOBBY_SIZE: number
      }>(c);

      if (!SKYWAY_APP_ID || !SKYWAY_SECRET) {
        throw new HTTPException(500, { message: "Internal Server Error." });
      }

      const data = c.req.valid("json");

      const token = await SkyWayAuthToken.create(
        `${SKYWAY_APP_ID}`,
        `${SKYWAY_SECRET}`,
        SKYWAY_UDONARIUM_LOBBY_SIZE ?? 3,
        `${data.channelName}`,
        `${data.peerId}`
      );

      return c.json({ token }, 200);
    }
  );

  return app;
}

function isAllowedOrigin(requestOrigin: string = '', allowedOrigins: string[] | string = ''): boolean {
  const canonicalOrigin = `${requestOrigin}//`;
  const origins = typeof allowedOrigins === 'string' ? [allowedOrigins] : allowedOrigins;
  // 完全修飾ドメインによる厳格な比較ではないので注意
  return !!origins.find(origin => origin == '*' || canonicalOrigin.startsWith(`${origin}/`));
}
