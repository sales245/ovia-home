// Cloudflare Pages Function - Customers Endpoint
// Endpoint: /api/customers
// Müşteri bilgilerini yönetir

export async function onRequest(context) {
  const { request } = context;
  const method = request.method;

  // GET: Tüm müşterileri listele
  if (method === 'GET') {
    // Mock data - ileride Google Sheets'ten çekilecek
    const customers = [
      {
        id: '1',
        name: 'Mehmet Demir',
        company: 'Lüks Otel Zinciri',
        email: 'mehmet@luksotel.com',
        phone: '+90 532 444 5566',
        country: 'Turkey',
        total_orders: 5,
        total_spent: 45000,
        last_order_date: '2025-09-15',
        created_at: '2025-01-10',
        status: 'active' // active, inactive, vip
      },
      {
        id: '2',
        name: 'Hotel Manager',
        company: 'Grand Hotel',
        email: 'info@grandhotel.com',
        phone: '+49 176 123 4567',
        country: 'Germany',
        total_orders: 3,
        total_spent: 28000,
        last_order_date: '2025-09-20',
        created_at: '2025-03-22',
        status: 'active'
      }
    ];

    return new Response(JSON.stringify(customers), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // POST: Yeni müşteri oluştur
  if (method === 'POST') {
    try {
      const data = await request.json();
      
      // Validate required fields
      const required = ['name', 'email'];
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
      const newCustomer = {
        id: String(Date.now()),
        ...data,
        total_orders: 0,
        total_spent: 0,
        created_at: new Date().toISOString(),
        status: 'active'
      };

      return new Response(JSON.stringify(newCustomer), {
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
