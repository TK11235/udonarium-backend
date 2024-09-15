import { routing } from '@udonarium-backend/core';
import { serve } from '@hono/node-server';
import { Hono } from 'hono';

const app = routing(new Hono());
const port = (process.env.PORT || 3000) as number;

serve({
  fetch: app.fetch,
  port
});

console.log(`Server is running on port ${port}`);
