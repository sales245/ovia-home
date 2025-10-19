/// <reference types="@cloudflare/workers-types" />
import { basicAuth } from '../_middlewares.js';

export async function onRequestGet(context: any) {
  const { request, env } = context as any;
  const auth = basicAuth(request, env as any);
  if (!auth.ok) return auth.response;

  const DB: D1Database = env.DB;
  if (!DB) return new Response('DB not configured', { status: 500 });

  const res = await DB.prepare('SELECT * FROM products ORDER BY created_at DESC').all();
  const rows = res.results || [];

  const itemsHtml = rows.map((r: any) => `
    <div class="product">
      <h3>${escapeHtml(r.name_en)}</h3>
      <div>Category: ${escapeHtml(r.category)}</div>
      <div>Price: ${r.retail_price}</div>
    </div>
  `).join('\n');

  return new Response(`<div id="products-list">${itemsHtml}</div>`, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}

function escapeHtml(s: any) {
  if (s == null) return '';
  return String(s).replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"} as any)[c]);
}
