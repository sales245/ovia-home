// Cloudflare Pages Function - Categories API
// Endpoint: /api/categories

export async function onRequest(context) {
  const { request } = context;
  
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
    const categories = [
      {
        id: "1",
        name: {
          en: "Bathrobes",
          tr: "Bornozlar"
        },
        slug: "bathrobes",
        description: {
          en: "Luxury bathrobes made from premium Turkish cotton",
          tr: "Premium Türk pamuğundan yapılmış lüks bornozlar"
        },
        sort_order: 1,
        is_active: true
      },
      {
        id: "2",
        name: {
          en: "Towels",
          tr: "Havlular"
        },
        slug: "towels",
        description: {
          en: "High-quality towels for every need",
          tr: "Her ihtiyaca uygun yüksek kaliteli havlular"
        },
        sort_order: 2,
        is_active: true
      },
      {
        id: "3",
        name: {
          en: "Bedding",
          tr: "Yatak Takımları"
        },
        slug: "bedding",
        description: {
          en: "Comfortable and elegant bedding sets",
          tr: "Konforlu ve zarif yatak takımları"
        },
        sort_order: 3,
        is_active: true
      }
    ];

    if (request.method === 'GET') {
      return new Response(JSON.stringify(categories), {
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
