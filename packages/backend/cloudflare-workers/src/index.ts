import { routing } from '@udonarium-backend/core';
import { Hono } from 'hono';

const app = routing(new Hono());

export default app
