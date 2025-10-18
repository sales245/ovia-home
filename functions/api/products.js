export async function onRequestGet(context) {// Cloudflare Pages API endpoint for products// Cloudflare Pages Function - Products API Endpoint

  const { env } = context;

export async function onRequest(context) {export async function onRequest(context) {

  try {

    // Check if database is configured  // Always return JSON and handle CORS  const {// Cloudflare Pages Function - Products API Endpoint

    if (!env.DB) {

      throw new Error('Database not configured - D1 binding missing');  const corsHeaders = {export async fun/**

    }

    'Access-Control-Allow-Origin': '*', * GET /api/products

    // Get all products from database

    const { results } = await env.DB.prepare(    'Access-Control-Allow-Methods': 'GET, OPTIONS', * Returns a list of all products with their details

      'SELECT * FROM products ORDER BY created_at DESC'

    ).all();    'Access-Control-Allow-Headers': 'Content-Type', // Cloudflare Pages Function - Products API Endpoint



    // Transform database results to API format    'Content-Type': 'application/json',export async function onRequestGet({ env }) {

    const transformedProducts = results.map(product => ({

      id: product.id.toString(),    'Access-Control-Max-Age': '86400'  const corsHeaders = {

      category: product.category,

      image: product.image || "https://via.placeholder.com/300x200",  };    'Access-Control-Allow-Origin': '*',

      name: {

        en: product.name_en,    'Access-Control-Allow-Methods': 'GET',

        tr: product.name_tr,

        de: product.name_de || product.name_en  // Handle preflight requests    'Access-Control-Allow-Headers': 'Content-Type',

      },

      features: {  if (context.request.method === 'OPTIONS') {    'Content-Type': 'application/json'

        en: JSON.parse(product.features_en || '[]'),

        tr: JSON.parse(product.features_tr || '[]')    return new Response(null, { headers: corsHeaders });  };

      },

      badges: product.badges ? product.badges.split(',') : [],  }

      min_wholesale_quantity: product.min_wholesale_quantity,

      in_stock: Boolean(product.in_stock),  try {

      stock_quantity: product.stock_quantity,

      priceTiers: JSON.parse(product.price_tiers || '[]')  try {    if (!env.DB) {

    }));

    const { env } = context;      return new Response(

    // Return successful response

    return Response.json(transformedProducts);        JSON.stringify({



  } catch (error) {    // Check if database is configured          error: 'Database not configured',

    console.error('API Error:', error);

        if (!env.DB) {          message: 'D1 database binding not found'

    // Return error response

    return Response.json({      throw new Error('Database not configured - D1 binding missing');        }),

      error: 'Internal Server Error',

      message: error instanceof Error ? error.message : 'Unknown error'    }        {

    }, { status: 500 });

  }          status: 500,

}
    // Get all products from database          headers: corsHeaders

    const { results } = await env.DB.prepare(        }

      'SELECT * FROM products ORDER BY created_at DESC'      );

    ).all();    }



    // Transform database results to API format    const { results } = await env.DB.prepare(

    const transformedProducts = results.map(product => ({      'SELECT * FROM products ORDER BY created_at DESC'

      id: product.id.toString(),    ).all();

      category: product.category,

      image: product.image || "https://via.placeholder.com/300x200",    const transformedProducts = results.map(product => ({

      name: {      id: product.id.toString(),

        en: product.name_en,      category: product.category,

        tr: product.name_tr,      image: product.image || "https://via.placeholder.com/300x200",

        de: product.name_de || product.name_en      name: {

      },        en: product.name_en,

      features: {        tr: product.name_tr,

        en: JSON.parse(product.features_en || '[]'),        de: product.name_de || product.name_en

        tr: JSON.parse(product.features_tr || '[]')      },

      },      features: {

      badges: product.badges ? product.badges.split(',') : [],        en: JSON.parse(product.features_en || '[]'),

      min_wholesale_quantity: product.min_wholesale_quantity,        tr: JSON.parse(product.features_tr || '[]')

      in_stock: Boolean(product.in_stock),      },

      stock_quantity: product.stock_quantity,      badges: product.badges ? product.badges.split(',') : [],

      priceTiers: JSON.parse(product.price_tiers || '[]')      min_wholesale_quantity: product.min_wholesale_quantity,

    }));      in_stock: Boolean(product.in_stock),

      stock_quantity: product.stock_quantity,

    // Return successful response      priceTiers: JSON.parse(product.price_tiers || '[]')

    return new Response(    }));

      JSON.stringify(transformedProducts),

      { headers: corsHeaders }    return new Response(

    );      JSON.stringify(transformedProducts),

      { headers: corsHeaders }

  } catch (error) {    );

    console.error('API Error:', error);

      } catch (error) {

    // Return error response    console.error('Error:', error);

    return new Response(    return new Response(

      JSON.stringify({      JSON.stringify({

        error: 'Internal Server Error',        error: 'Internal Server Error',

        message: error instanceof Error ? error.message : 'Unknown error'        message: error.message

      }),      }),

      {      {

        status: 500,        status: 500,

        headers: corsHeaders        headers: corsHeaders

      }      }

    );    );

  }  }

}}

export function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}unction onRequestGet(context) {
  // CORS headers for all responses
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  try {
    const { env } = context;
    
    // Check if database is configured
    if (!env.DB) {
      return new Response(JSON.stringify({
        error: 'Database not configured',
        message: 'D1 database binding not found'
      }), {
        status: 500,
        headers: corsHeaders
      });
    }

    // Get all products
    const { results } = await env.DB.prepare(
      'SELECT * FROM products ORDER BY created_at DESC'
    ).all();

    // Transform database results to API response format
    const transformedProducts = results.map(product => ({
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
      min_wholesale_quantity: product.min_wholesale_quantity,
      in_stock: Boolean(product.in_stock),
      stock_quantity: product.stock_quantity,
      priceTiers: JSON.parse(product.price_tiers || '[]')
    }));

    return new Response(JSON.stringify(transformedProducts), {
      headers: corsHeaders
    });

  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({
      error: 'Internal Server Error',
      message: error.message
    }), {
      status: 500,
      headers: corsHeaders
    });
  }
}

/**
 * OPTIONS /api/products
 * Handle CORS preflight requests
 */
export function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}ext) {
  const { request, env } = context;
  
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  // Handle OPTIONS request
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

    // Get all products
    const { results } = await DB.prepare(
      'SELECT * FROM products ORDER BY created_at DESC'
    ).all();
    
    // Transform data for frontend
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
      min_wholesale_quantity: product.min_wholesale_quantity,
      in_stock: Boolean(product.in_stock),
      stock_quantity: product.stock_quantity,
      priceTiers: JSON.parse(product.price_tiers || '[]')
    }));

    return new Response(JSON.stringify(products), {
      headers: corsHeaders
    });

  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({
      error: 'Internal Server Error',
      message: error.message
    }), {
      status: 500,
      headers: corsHeaders
    });
  }
}ntext;
  
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  // Handle OPTIONS request
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { DB } = env;
    
    if (!DB) {
      throw new Error('Database not configured');
    }

    switch (request.method) {
      case 'GET':
        const { results } = await DB.prepare(
          'SELECT * FROM products ORDER BY created_at DESC'
        ).all();
        
        // Transform data for frontend
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
          min_wholesale_quantity: product.min_wholesale_quantity,
          in_stock: Boolean(product.in_stock),
          stock_quantity: product.stock_quantity,
          priceTiers: JSON.parse(product.price_tiers || '[]')
        }));
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