// Cloudflare Pages Function - Statistics API
// Endpoint: /api/stats

export async function onRequest(context) {
  const { request } = context;
  
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
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

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: corsHeaders,
      status: 500
    });
  }
}
