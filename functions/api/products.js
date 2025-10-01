// Cloudflare Pages Function - Products API
// Bu dosya otomatik olarak /api/products endpoint'i oluşturur

export async function onRequest(context) {
  const { request, env } = context;
  
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  // OPTIONS request için (preflight)
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Google Sheets'ten veri çekme (mock data şimdilik)
    const products = [
      {
        id: "1",
        category: "bathrobes",
        image: "https://example.com/bathrobe.jpg",
        name: {
          en: "Premium Cotton Bathrobe",
          tr: "Premium Pamuklu Bornoz"
        },
        features: {
          en: ["100% Turkish Cotton", "Ultra Soft", "Quick Dry"],
          tr: ["100% Türk Pamuğu", "Ekstra Yumuşak", "Hızlı Kuruyan"]
        },
        badges: ["premium", "organic"],
        retail_price: 99.99,
        wholesale_price: 79.99,
        min_wholesale_quantity: 50,
        in_stock: true,
        stock_quantity: 150
      },
      {
        id: "2",
        category: "towels",
        image: "https://example.com/towel.jpg",
        name: {
          en: "Turkish Towel Set",
          tr: "Türk Havlu Seti"
        },
        features: {
          en: ["600 GSM", "Highly Absorbent", "Durable"],
          tr: ["600 GSM", "Yüksek Emici", "Dayanıklı"]
        },
        badges: ["bestseller"],
        retail_price: 49.99,
        wholesale_price: 39.99,
        min_wholesale_quantity: 100,
        in_stock: true,
        stock_quantity: 300
      }
    ];

    // GET request - Tüm ürünleri döndür
    if (request.method === 'GET') {
      return new Response(JSON.stringify(products), {
        headers: corsHeaders,
        status: 200
      });
    }

    // POST request - Yeni ürün ekle (şimdilik mock)
    if (request.method === 'POST') {
      const newProduct = await request.json();
      newProduct.id = String(products.length + 1);
      products.push(newProduct);
      
      return new Response(JSON.stringify(newProduct), {
        headers: corsHeaders,
        status: 200
      });
    }

    // Diğer metodlar için 405
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
