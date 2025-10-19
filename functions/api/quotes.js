// Cloudflare Pages Function - Quotes API with D1 Database
// Endpoint: /api/quotes

export async function onRequest(context) {
  const { request, env } = context;
  
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

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

  try {
    // GET - List all quotes
    if (request.method === 'GET') {
      const { results } = await DB.prepare(
        'SELECT * FROM quotes ORDER BY created_at DESC'
      ).all();

      const quotes = results.map(row => ({
        id: row.id.toString(),
        name: row.name,
        company: row.company,
        email: row.email,
        phone: row.phone,
        product_category: row.product_category,
        quantity: row.quantity,
        message: row.message,
        created_at: row.created_at
      }));

      return new Response(JSON.stringify(quotes), {
        headers: corsHeaders,
        status: 200
      });
    }

    // POST - Create new quote
    if (request.method === 'POST') {
      const quote = await request.json();
      
      // Validation
      if (!quote.name || !quote.email) {
        return new Response(JSON.stringify({
          error: 'Validation error',
          message: 'name and email are required'
        }), {
          status: 422,
          headers: corsHeaders
        });
      }

      // Insert into D1 database
      const result = await DB.prepare(`
        INSERT INTO quotes (name, company, email, phone, product_category, quantity, message, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
      `).bind(
        quote.name,
        quote.company || null,
        quote.email,
        quote.phone || null,
        quote.product_category || null,
        quote.quantity || null,
        quote.message || null
      ).run();

      const savedQuote = {
        id: result.meta.last_row_id.toString(),
        ...quote,
        created_at: new Date().toISOString()
      };

      return new Response(JSON.stringify(savedQuote), {
        status: 201,
        headers: corsHeaders
      });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: corsHeaders
    });

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
