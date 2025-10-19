// Test endpoint to verify D1 connection
// Access at: /api/test-db

export async function onRequest(context) {
  const { env } = context;
  
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  if (context.request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { DB } = env;
    
    if (!DB) {
      return new Response(JSON.stringify({
        error: 'D1 binding not found',
        message: 'DB binding is not configured'
      }), {
        status: 500,
        headers: corsHeaders
      });
    }

    // Test products count
    const productsCount = await DB.prepare('SELECT COUNT(*) as count FROM products').first();
    
    // Test categories count
    const categoriesCount = await DB.prepare('SELECT COUNT(*) as count FROM categories').first();
    
    // Test getting one product
    const oneProduct = await DB.prepare('SELECT * FROM products LIMIT 1').first();

    return new Response(JSON.stringify({
      success: true,
      message: 'D1 connection working!',
      productsCount: productsCount?.count || 0,
      categoriesCount: categoriesCount?.count || 0,
      sampleProduct: oneProduct,
      dbBinding: 'DB binding found and working'
    }), {
      status: 200,
      headers: corsHeaders
    });

  } catch (error) {
    return new Response(JSON.stringify({
      error: 'Database error',
      message: error.message,
      stack: error.stack
    }), {
      status: 500,
      headers: corsHeaders
    });
  }
}
