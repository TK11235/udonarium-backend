import { routing } from '@udonarium-backend/core';
import { Hono } from 'hono';
import { handle } from 'hono/aws-lambda';

const app = routing(new Hono());

export const handler = handle(app);
