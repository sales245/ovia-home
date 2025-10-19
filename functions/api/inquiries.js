// Cloudflare Pages Function - Inquiries API with D1 Database
// Endpoint: /api/inquiries

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
    // POST - Create new inquiry
    if (request.method === 'POST') {
      const inquiry = await request.json();
      
      // Validation
      if (!inquiry.name || !inquiry.email || !inquiry.message) {
        return new Response(JSON.stringify({ 
          error: 'Missing required fields: name, email, message' 
        }), {
          headers: corsHeaders,
          status: 422
        });
      }

      // Insert into D1 database
      const result = await DB.prepare(`
        INSERT INTO inquiries (name, company, email, phone, country, message, created_at)
        VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
      `).bind(
        inquiry.name,
        inquiry.company || null,
        inquiry.email,
        inquiry.phone || null,
        inquiry.country || null,
        inquiry.message
      ).run();

      const savedInquiry = {
        id: result.meta.last_row_id.toString(),
        ...inquiry,
        created_at: new Date().toISOString()
      };

      return new Response(JSON.stringify(savedInquiry), {
        headers: corsHeaders,
        status: 201
      });
    }

    // GET - List all inquiries
    if (request.method === 'GET') {
      const { results } = await DB.prepare(
        'SELECT * FROM inquiries ORDER BY created_at DESC'
      ).all();

      const inquiries = results.map(row => ({
        id: row.id.toString(),
        name: row.name,
        company: row.company,
        email: row.email,
        phone: row.phone,
        country: row.country,
        message: row.message,
        created_at: row.created_at
      }));

      return new Response(JSON.stringify(inquiries), {
        headers: corsHeaders,
        status: 200
      });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      headers: corsHeaders,
      status: 405
    });

  } catch (error) {
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      message: error.message 
    }), {
      headers: corsHeaders,
      status: 500
    });
  }
}
