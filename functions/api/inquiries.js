// Cloudflare Pages Function - Inquiries API
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

  try {
    // POST - Yeni talep oluştur
    if (request.method === 'POST') {
      const inquiry = await request.json();
      
      // Validasyon
      if (!inquiry.name || !inquiry.email || !inquiry.message) {
        return new Response(JSON.stringify({ 
          error: 'Missing required fields: name, email, message' 
        }), {
          headers: corsHeaders,
          status: 422
        });
      }

      // Burada Google Sheets'e yazılabilir veya KV'ye kaydedilebilir
      // Şimdilik sadece başarılı response dönelim
      const savedInquiry = {
        id: Date.now().toString(),
        ...inquiry,
        created_at: new Date().toISOString(),
        status: 'pending'
      };

      // TODO: Gerçek uygulamada buraya email gönderimi eklenebilir
      // await sendEmailNotification(inquiry);

      return new Response(JSON.stringify(savedInquiry), {
        headers: corsHeaders,
        status: 200
      });
    }

    // GET - Tüm talepleri listele
    if (request.method === 'GET') {
      // Mock data - gerçek uygulamada KV veya D1'den çekilir
      const inquiries = [
        {
          id: "1",
          name: "John Doe",
          email: "john@example.com",
          company: "ABC Corp",
          phone: "+1 555 1234",
          product_category: "Bathrobes",
          message: "Interested in wholesale pricing",
          created_at: "2025-01-15T10:30:00Z",
          status: "pending"
        }
      ];

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
    return new Response(JSON.stringify({ error: error.message }), {
      headers: corsHeaders,
      status: 500
    });
  }
}
