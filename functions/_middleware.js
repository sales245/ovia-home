// Global middleware for all Functions
// Bu dosya tüm API endpoint'lerinde çalışır

export async function onRequest(context) {
  const { request, next, env } = context;

  // CORS headers (tüm endpoint'ler için)
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  // OPTIONS request (preflight)
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders,
      status: 204
    });
  }

  // Rate limiting (basit)
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  const rateKey = `rate:${ip}`;
  
  // TODO: KV ile rate limiting yapılabilir
  // const count = await env.MY_KV.get(rateKey);
  // if (count > 100) return new Response('Rate limit exceeded', { status: 429 });

  // Request'i devam ettir
  const response = await next();

  // Response'a CORS headers ekle
  const newHeaders = new Headers(response.headers);
  Object.entries(corsHeaders).forEach(([key, value]) => {
    newHeaders.set(key, value);
  });

  // Yeni response döndür
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders
  });
}
