// Cloudflare Pages Function - Categories API with D1 Database
// This file automatically creates /api/categories endpoint

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
        // Get all categories
        const { results } = await DB.prepare(
          'SELECT * FROM categories WHERE is_active = 1 ORDER BY sort_order, name_en'
        ).all();
        
        // Transform data to match frontend expectations
        const categories = results.map(category => ({
          id: category.id.toString(),
          name: {
            en: category.name_en,
            tr: category.name_tr
          },
          slug: category.slug,
          image: category.image || "https://via.placeholder.com/200x150",
          sort_order: category.sort_order,
          is_active: Boolean(category.is_active)
        }));

        return new Response(JSON.stringify({
          success: true,
          data: categories,
          count: categories.length
        }), {
          status: 200,
          headers: corsHeaders
        });

      case 'POST':
        // Add new category
        const categoryData = await request.json();
        
        const insertResult = await DB.prepare(`
          INSERT INTO categories 
          (name_en, name_tr, slug, image, sort_order, is_active)
          VALUES (?, ?, ?, ?, ?, ?)
        `).bind(
          categoryData.name.en,
          categoryData.name.tr,
          categoryData.slug,
          categoryData.image || "https://via.placeholder.com/200x150",
          categoryData.sort_order || 0,
          categoryData.is_active ? 1 : 0
        ).run();

        return new Response(JSON.stringify({
          success: true,
          message: 'Category created successfully',
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