interface Product {
  export async function onRequestGet(context: { env: any }): Promise<Response> {
  // Always return JSON and handle CORS
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
    'Access-Control-Max-Age': '86400'
  };ing;
  category: string;
  image: string;
  name: {
    en: string;
    tr: string;
    de?: string;
  };
  features: {
    en: string[];
    tr: string[];
  };
  badges: string[];
  min_wholesale_quantity: number;
  in_stock: boolean;
  stock_quantity: number;
  priceTiers: Array<{
    quantity: number;
    price: number;
  }>;
}

export async function onRequestGet({ env }: { env: any }): Promise<Response> {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  try {
    if (!env.DB) {
      return new Response(
        JSON.stringify({
          error: 'Database not configured',
          message: 'D1 database binding not found'
        }),
        {
          status: 500,
          headers: corsHeaders
        }
      );
    }

    const { results } = await env.DB.prepare(
      'SELECT * FROM products ORDER BY created_at DESC'
    ).all();

    const transformedProducts = results.map((product: any) => ({
      id: product.id.toString(),
      category: product.category,
      image: product.image || "https://via.placeholder.com/300x200",
      name: {
        en: product.name_en,
        tr: product.name_tr,
        de: product.name_de || product.name_en
      },
      features: {
        en: JSON.parse(product.features_en || '[]'),
        tr: JSON.parse(product.features_tr || '[]')
      },
      badges: product.badges ? product.badges.split(',') : [],
      min_wholesale_quantity: product.min_wholesale_quantity,
      in_stock: Boolean(product.in_stock),
      stock_quantity: product.stock_quantity,
      priceTiers: JSON.parse(product.price_tiers || '[]')
    }));

    return new Response(
      JSON.stringify(transformedProducts),
      { headers: corsHeaders }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: corsHeaders
      }
    );
  }
}

export function onRequestOptions(): Response {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}