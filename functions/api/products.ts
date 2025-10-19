/// <reference types="@cloudflare/workers-types" />
// functions/api/products.ts
import { corsHeaders } from '../_middlewares.js';

export type ProductData = {
  id?: string;
  category: string;
  image?: string;
  name: { en: string; tr: string; de?: string };
  features?: { en?: string[]; tr?: string[] };
  badges?: string[];
  retail_price: number;
  min_wholesale_quantity: number;
  stock_quantity?: number;
  in_stock: boolean;
  priceTiers?: Array<{ quantity: number; price: number }>;
};

interface Env {
  DB: D1Database;
}

export async function onRequest(context: any) {
  const { request, env } = context as any;

  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const DB = env.DB;
  if (!DB) {
    return new Response(JSON.stringify({ error: 'D1 binding not found' }), { status: 500, headers: { ...corsHeaders, 'Content-Type':'application/json' } });
  }

  try {
    if (request.method === 'GET') {
      const res = await DB.prepare('SELECT * FROM products ORDER BY created_at DESC').all();
      const rows = res.results || [];
      const data = rows.map((r: any) => ({
        id: String(r.id),
        category: r.category,
        image: r.image,
        name: { en: r.name_en, tr: r.name_tr, de: r.name_de },
        features: { en: JSON.parse(r.features_en || '[]'), tr: JSON.parse(r.features_tr || '[]') },
        badges: r.badges ? r.badges.split(',') : [],
        retail_price: r.retail_price,
        min_wholesale_quantity: r.min_wholesale_quantity,
        stock_quantity: r.stock_quantity,
        in_stock: Boolean(r.in_stock),
        priceTiers: JSON.parse(r.price_tiers || '[]')
      }));

      // Return array directly for frontend compatibility
      return new Response(JSON.stringify(data), { status: 200, headers: { ...corsHeaders, 'Content-Type':'application/json' } });
    }

    if (request.method === 'POST') {
      const body = await request.json() as ProductData;
      const insert = await DB.prepare(`INSERT INTO products (
        category, name_en, name_tr, name_de, image, features_en, features_tr, badges, retail_price, min_wholesale_quantity, stock_quantity, in_stock, price_tiers, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`).bind(
        body.category,
        body.name.en,
        body.name.tr,
        body.name.de || body.name.en,
        body.image || '',
        JSON.stringify(body.features?.en || []),
        JSON.stringify(body.features?.tr || []),
        (body.badges || []).join(','),
        body.retail_price,
        body.min_wholesale_quantity,
        body.stock_quantity || 0,
        Number(body.in_stock),
        JSON.stringify(body.priceTiers || [])
      ).run();

      return new Response(JSON.stringify({ success: true, id: insert.meta?.last_row_id }), { status: 201, headers: { ...corsHeaders, 'Content-Type':'application/json' } });
    }

    if (request.method === 'PUT') {
      const body = await request.json() as ProductData & { id: string };
      if (!body.id) return new Response(JSON.stringify({ error: 'ID required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type':'application/json' } });

      const res = await DB.prepare(`UPDATE products SET
        category = ?, name_en = ?, name_tr = ?, name_de = ?, image = ?, features_en = ?, features_tr = ?, badges = ?, retail_price = ?, min_wholesale_quantity = ?, stock_quantity = ?, in_stock = ?, price_tiers = ?
        WHERE id = ?
      `).bind(
        body.category,
        body.name.en,
        body.name.tr,
        body.name.de || body.name.en,
        body.image || '',
        JSON.stringify(body.features?.en || []),
        JSON.stringify(body.features?.tr || []),
        (body.badges || []).join(','),
        body.retail_price,
        body.min_wholesale_quantity,
        body.stock_quantity || 0,
        Number(body.in_stock),
        JSON.stringify(body.priceTiers || []),
        body.id
      ).run();

      if (res.meta?.changes === 0) return new Response(JSON.stringify({ error: 'Not found' }), { status: 404, headers: { ...corsHeaders, 'Content-Type':'application/json' } });

      return new Response(JSON.stringify({ success: true }), { status: 200, headers: { ...corsHeaders, 'Content-Type':'application/json' } });
    }

    if (request.method === 'DELETE') {
      const body = await request.json() as { id?: string };
      if (!body?.id) return new Response(JSON.stringify({ error: 'ID required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type':'application/json' } });

      const res = await DB.prepare('DELETE FROM products WHERE id = ?').bind(body.id).run();
      if (res.meta?.changes === 0) return new Response(JSON.stringify({ error: 'Not found' }), { status: 404, headers: { ...corsHeaders, 'Content-Type':'application/json' } });

      return new Response(JSON.stringify({ success: true }), { status: 200, headers: { ...corsHeaders, 'Content-Type':'application/json' } });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { ...corsHeaders, 'Content-Type':'application/json' } });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: 'Server error', message: e instanceof Error ? e.message : String(e) }), { status: 500, headers: { ...corsHeaders, 'Content-Type':'application/json' } });
  }
}
