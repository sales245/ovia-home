// Cloudflare Pages Function - Quotes Endpoint
// Endpoint: /api/quotes
// Quote (teklif) isteklerini yönetir

export async function onRequest(context) {
  const { request } = context;
  const method = request.method;

  // GET: Tüm teklifleri listele
  if (method === 'GET') {
    // Mock data - ileride Google Sheets'ten çekilecek
    const quotes = [
      {
        id: '1',
        customer_name: 'Ahmet Yılmaz',
        company: 'ABC Otel',
        email: 'ahmet@abcotel.com',
        phone: '+90 532 111 2233',
        product_id: '1',
        product_name: 'Premium Pamuk Bornoz',
        quantity: 100,
        message: '100 adet bornoz için fiyat teklifi istiyorum',
        status: 'pending', // pending, responded, rejected
        created_at: new Date().toISOString(),
        responded_at: null
      }
    ];

    return new Response(JSON.stringify(quotes), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // POST: Yeni teklif oluştur
  if (method === 'POST') {
    try {
      const data = await request.json();
      
      // Validate required fields
      const required = ['customer_name', 'email', 'product_id', 'quantity'];
      for (const field of required) {
        if (!data[field]) {
          return new Response(JSON.stringify({
            error: 'Validation error',
            message: `${field} is required`
          }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }
      }

      // Mock response - ileride Google Sheets'e kaydedilecek
      const newQuote = {
        id: String(Date.now()),
        ...data,
        status: 'pending',
        created_at: new Date().toISOString(),
        responded_at: null
      };

      return new Response(JSON.stringify(newQuote), {
        status: 201,
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      return new Response(JSON.stringify({
        error: 'Internal server error',
        message: error.message
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  return new Response('Method not allowed', { status: 405 });
}
