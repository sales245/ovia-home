/// <reference types="@cloudflare/workers-types" />
// functions/_middlewares.ts
// Global middleware helpers for Cloudflare Pages Functions

export interface Env {
  DB: D1Database;
  DB_PREVIEW?: D1Database;
  ADMIN_USER?: string;
  ADMIN_PASS?: string;
}

export function basicAuth(request: Request, env: Env) {
  const auth = request.headers.get('Authorization');
  const user = env.ADMIN_USER || (typeof process !== 'undefined' ? (process.env as any).ADMIN_USER : undefined);
  const pass = env.ADMIN_PASS || (typeof process !== 'undefined' ? (process.env as any).ADMIN_PASS : undefined);

  if (!user || !pass) return { ok: false, response: new Response('Admin not configured', { status: 500 }) };

  if (!auth || !auth.startsWith('Basic ')) {
    const headers = new Headers({ 'WWW-Authenticate': 'Basic realm="Admin"' });
    return { ok: false, response: new Response('Authentication required', { status: 401, headers }) };
  }

  try {
    const b64 = auth.slice(6);
    // atob exists in Workers runtime
    const [u, p] = (globalThis as any).atob(b64).split(':');
    if (u === user && p === pass) return { ok: true };
    const headers = new Headers({ 'WWW-Authenticate': 'Basic realm="Admin"' });
    return { ok: false, response: new Response('Invalid credentials', { status: 401, headers }) };
  } catch (e) {
    return { ok: false, response: new Response('Invalid auth header', { status: 400 }) };
  }
}

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization'
};
