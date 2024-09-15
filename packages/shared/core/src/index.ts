import { Hono } from 'hono';
import { env } from 'hono/adapter';
import { SkyWayAuthToken } from './skyway2023/skyway-auth-token';

interface TokenRequestParam {
  formatVersion: number;
  channelName: string;
  peerId: string;
}

export function routing(app: Hono) {
  // Middleware
  app.use(async (c, next) => {
    const { ACCESS_CONTROL_ALLOW_ORIGIN } = env<{ ACCESS_CONTROL_ALLOW_ORIGIN: string[] | string }>(c);
    const requestOrigin = c.req.header('Origin') ?? '';

    if (!isAllowedOrigin(requestOrigin, ACCESS_CONTROL_ALLOW_ORIGIN)) {
      c.res = new Response('Forbidden', { status: 403, headers: new Headers({ 'Access-Control-Allow-Origin': requestOrigin }) });
      return;
    }

    await next();

    c.res.headers.set('Access-Control-Allow-Origin', requestOrigin);
  });

  // Routing
  app.get('/v1/status', (c) => {
    return c.text('OK');
  });

  // Routing
  app.post('/v1/skyway2023/token', async (c) => {
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
      return c.text('Bad Request', 400);
    }

    let param: TokenRequestParam = {
      formatVersion: 1,
      channelName: '',
      peerId: '',
    };

    try {
      param = await c.req.json<TokenRequestParam>();
    } catch {
      return c.text('Bad Request', 400);
    }

    const token = await SkyWayAuthToken.create(
      `${SKYWAY_APP_ID}`,
      `${SKYWAY_SECRET}`,
      SKYWAY_UDONARIUM_LOBBY_SIZE ?? 3,
      `${param.channelName}`,
      `${param.peerId}`);

    return c.json({ token: token });
  });

  return app;
}

function isAllowedOrigin(requestOrigin: string = '', allowedOrigins: string[] | string = ''): boolean {
  const canonicalOrigin = `${requestOrigin}//`;
  const origins = typeof allowedOrigins === 'string' ? [allowedOrigins] : allowedOrigins;
  // 完全修飾ドメインによる厳格な比較ではないので注意
  return !!origins.find(origin => origin == '*' || canonicalOrigin.startsWith(`${origin}/`));
}
