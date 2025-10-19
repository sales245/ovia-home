// Cloudflare Pages Function - Statistics API with D1 Database
// Endpoint: /api/stats

export async function onRequest(context) {
  const { request, env } = context;
  
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const { DB } = env;
  
  if (!DB) {
    // Fallback to static data if DB not available
    const stats = {
      inquiries: 1250,
      quotes: 450,
      customers: 320,
      orders: 180,
      countries_served: 45,
      years_experience: 15
    };

    return new Response(JSON.stringify(stats), {
      headers: corsHeaders,
      status: 200
    });
  }

  try {
    // Get real counts from database
    const [inquiriesCount, quotesCount, customersCount, ordersCount] = await Promise.all([
      DB.prepare('SELECT COUNT(*) as count FROM inquiries').first(),
      DB.prepare('SELECT COUNT(*) as count FROM quotes').first(),
      DB.prepare('SELECT COUNT(*) as count FROM customers').first(),
      DB.prepare('SELECT COUNT(*) as count FROM orders').first()
    ]);

    const stats = {
      inquiries: inquiriesCount?.count || 0,
      quotes: quotesCount?.count || 0,
      customers: customersCount?.count || 0,
      orders: ordersCount?.count || 0,
      countries_served: 45,
      years_experience: 15
    };

    return new Response(JSON.stringify(stats), {
      headers: corsHeaders,
      status: 200
    });

  } catch (error) {
    // Fallback to static data on error
    const stats = {
      inquiries: 1250,
      quotes: 450,
      customers: 320,
      orders: 180,
      countries_served: 45,
      years_experience: 15
    };

    return new Response(JSON.stringify(stats), {
      headers: corsHeaders,
      status: 200
    });
  }
}
