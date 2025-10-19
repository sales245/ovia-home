/// <reference types="@cloudflare/workers-types" />
import { basicAuth } from '../_middlewares.js';

export async function onRequestGet(context: any) {
  const { request, env } = context as any;
  const auth = basicAuth(request, env as any);
  if (!auth.ok) return auth.response;

  // Simple HTMX-based admin list page
  const html = `<!doctype html>
  <html>
  <head><meta charset="utf-8"><title>Admin - Products</title></head>
  <body>
    <h1>Products Admin</h1>
    <div id="products">
      <button hx-get="/admin/products" hx-trigger="click" hx-target="#products" hx-swap="outerHTML">Reload products</button>
      <div id="products-list">Loading...</div>
    </div>
    <script src="https://unpkg.com/htmx.org@1.9.3"></script>
  </body>
  </html>`;

  return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}

export async function onRequest(context: any) {
  // Fallback to GET behavior
  return onRequestGet(context);
}
