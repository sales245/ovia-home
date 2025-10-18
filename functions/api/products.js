// Cloudflare Pages Function - Products          // Transf          // Transform data to match frontend expectations
        const products = results.map(product => ({
          id: product.id.toString(),
          category: product.category,
          image: product.image || "https://via.placeholder.com/300x200",
          name: {
            en: product.name_en,
            tr: product.name_tr,
            de: product.name_de || product.name_en
          },
          features: {
            en: JSON.parse(product.features_en || '[]'),
            tr: JSON.parse(product.features_tr || '[]')
          },
          badges: product.badges ? product.badges.split(',') : [],
          retail_price: product.retail_price,
          min_wholesale_quantity: product.min_wholesale_quantity,
          in_stock: Boolean(product.in_stock),
          stock_quantity: product.stock_quantity,
          priceTiers: JSON.parse(product.price_tiers || '[]')ontend expectations
        const products = results.map(product => ({
          id: product.id.toString(),
          category: product.category,
          image: product.image || "https://via.placeholder.com/300x200",
          name: {
            en: product.name_en,
            tr: product.name_tr,
            de: product.name_de || product.name_en
          },
          features: {
            en: JSON.parse(product.features_en || '[]'),
            tr: JSON.parse(product.features_tr || '[]')
          },
          badges: product.badges ? product.badges.split(',') : [],
          retail_price: product.retail_price,
          min_wholesale_quantity: product.min_wholesale_quantity,
          in_stock: Boolean(product.in_stock),
          stock_quantity: product.stock_quantity,
          priceTiers: JSON.parse(product.price_tiers || '[]')e
// This file automatically creates /api/products endpoint

export async function onRequest(context) {
  const { request, env } = context;
  
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  // OPTIONS request for preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { DB } = env;
    
    if (!DB) {
      return new Response(JSON.stringify({
        error: 'Database not configured',
        message: 'D1 database binding not found'
      }), {
        status: 500,
        headers: corsHeaders
      });
    }

    switch (request.method) {
      case 'GET':
        // Get all products
        const { results } = await DB.prepare(
          'SELECT * FROM products ORDER BY created_at DESC'
        ).all();
        
        // Transform data to match frontend expectations
        const products = results.map(product => ({
          id: product.id.toString(),
          category: product.category,
          image: product.image || "https://via.placeholder.com/300x200",
          name: {
            en: product.name_en,
            tr: product.name_tr,
            de: product.name_de || product.name_en
          },
          features: {
            en: JSON.parse(product.features_en || '[]'),
            tr: JSON.parse(product.features_tr || '[]')
          },
          badges: product.badges ? product.badges.split(',') : [],
          retail_price: product.retail_price,
          min_wholesale_quantity: product.min_wholesale_quantity,
          in_stock: Boolean(product.in_stock),
          stock_quantity: product.stock_quantity,
          priceTiers: JSON.parse(product.price_tiers || '[]')
        }));

        return new Response(JSON.stringify({
          success: true,
          data: products,
          count: products.length
        }), {
          status: 200,
          headers: corsHeaders
        });

      case 'POST':
        // Add new product
        const productData = await request.json();
        
        const insertResult = await DB.prepare(`
          INSERT INTO products 
          (category, name_en, name_tr, name_de, image, features_en, features_tr, badges, retail_price, wholesale_price, min_wholesale_quantity, stock_quantity, in_stock)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          productData.category,
          productData.name.en,
          productData.name.tr,
          productData.name.de || productData.name.en,
          productData.image || "https://via.placeholder.com/300x200",
          JSON.stringify(productData.features.en || []),
          JSON.stringify(productData.features.tr || []),
          Array.isArray(productData.badges) ? productData.badges.join(',') : '',
          productData.retail_price,
          productData.wholesale_price,
          productData.min_wholesale_quantity || 1,
          productData.stock_quantity || 0,
          productData.in_stock ? 1 : 0
        ).run();

        return new Response(JSON.stringify({
          success: true,
          message: 'Product created successfully',
          id: insertResult.meta.last_row_id
        }), {
          status: 201,
          headers: corsHeaders
        });

      default:
        return new Response(JSON.stringify({
          error: 'Method not allowed',
          message: `${request.method} method is not supported`
        }), {
          status: 405,
          headers: corsHeaders
        });
    }

  } catch (error) {
    return new Response(JSON.stringify({
      error: 'Internal server error',
      message: error.message
    }), {
      status: 500,
      headers: corsHeaders
    });
  }
}