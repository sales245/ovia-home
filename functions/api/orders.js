// Cloudflare Pages Function - Orders Endpoint
// Endpoint: /api/orders
// Sipariş bilgilerini yönetir

export async function onRequest(context) {
  const { request } = context;
  const method = request.method;

  // GET: Tüm siparişleri listele
  if (method === 'GET') {
    // Mock data - ileride Google Sheets'ten çekilecek
    const orders = [
      {
        id: '1',
        order_number: 'ORD-2025-001',
        customer_id: '1',
        customer_name: 'Mehmet Demir',
        company: 'Lüks Otel Zinciri',
        items: [
          {
            product_id: '1',
            product_name: 'Premium Pamuk Bornoz',
            quantity: 50,
            unit_price: 450,
            total: 22500
          }
        ],
        subtotal: 22500,
        tax: 4050,
        shipping: 500,
        total: 27050,
        status: 'completed', // pending, processing, shipped, completed, cancelled
        payment_status: 'paid', // pending, paid, refunded
        shipping_address: {
          street: 'Atatürk Caddesi No:123',
          city: 'İstanbul',
          country: 'Turkey',
          postal_code: '34000'
        },
        notes: 'Lütfen hızlı teslimat',
        created_at: '2025-09-15T10:30:00Z',
        updated_at: '2025-09-18T14:20:00Z',
        shipped_at: '2025-09-16T09:00:00Z',
        delivered_at: '2025-09-18T14:20:00Z'
      },
      {
        id: '2',
        order_number: 'ORD-2025-002',
        customer_id: '2',
        customer_name: 'Hotel Manager',
        company: 'Grand Hotel',
        items: [
          {
            product_id: '2',
            product_name: 'Premium Havlu Seti',
            quantity: 100,
            unit_price: 280,
            total: 28000
          }
        ],
        subtotal: 28000,
        tax: 5040,
        shipping: 800,
        total: 33840,
        status: 'processing',
        payment_status: 'paid',
        shipping_address: {
          street: 'Hauptstraße 45',
          city: 'Berlin',
          country: 'Germany',
          postal_code: '10115'
        },
        notes: '',
        created_at: '2025-09-20T15:45:00Z',
        updated_at: '2025-09-21T10:00:00Z',
        shipped_at: null,
        delivered_at: null
      }
    ];

    return new Response(JSON.stringify(orders), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // POST: Yeni sipariş oluştur
  if (method === 'POST') {
    try {
      const data = await request.json();
      
      // Validate required fields
      const required = ['customer_id', 'items'];
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

      // Calculate totals
      const subtotal = data.items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
      const tax = subtotal * 0.18; // 18% KDV
      const shipping = data.shipping_cost || 0;
      const total = subtotal + tax + shipping;

      // Mock response - ileride Google Sheets'e kaydedilecek
      const newOrder = {
        id: String(Date.now()),
        order_number: `ORD-${new Date().getFullYear()}-${String(Date.now()).slice(-3)}`,
        ...data,
        subtotal,
        tax,
        shipping,
        total,
        status: 'pending',
        payment_status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        shipped_at: null,
        delivered_at: null
      };

      return new Response(JSON.stringify(newOrder), {
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
