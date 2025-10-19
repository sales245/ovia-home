export type PagesFunction = (context: any) => Promise<Response> | Response;

// CORS headers for API responses
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json',
};

// Basic auth helper function
export function basicAuth(request: Request, env: any) {
  const auth = request.headers.get('Authorization');
  const user = env.ADMIN_USER || 'admin';
  const pass = env.ADMIN_PASS || 'change-me';

  if (!auth || !auth.startsWith('Basic ')) {
    return {
      ok: false,
      response: new Response('Authentication required', {
        status: 401,
        headers: {
          'WWW-Authenticate': 'Basic realm="Admin Area"',
          ...corsHeaders
        }
      })
    };
  }

  try {
    const [providedUser, providedPass] = atob(auth.slice(6)).split(':');
    
    if (providedUser === user && providedPass === pass) {
      return { ok: true };
    }

    return {
      ok: false,
      response: new Response('Invalid credentials', {
        status: 401,
        headers: {
          'WWW-Authenticate': 'Basic realm="Admin Area"',
          ...corsHeaders
        }
      })
    };
  } catch {
    return {
      ok: false,
      response: new Response('Invalid authorization header', {
        status: 400,
        headers: corsHeaders
      })
    };
  }
}

export const onRequest: PagesFunction = async (context) => {
  const url = new URL(context.request.url);
  
  // Only apply to /admin paths
  if (!url.pathname.startsWith('/admin')) {
    return context.next();
  }

  const auth = context.request.headers.get('Authorization');
  const user = context.env.ADMIN_USER;
  const pass = context.env.ADMIN_PASS;

  // Check if admin credentials are configured
  if (!user || !pass) {
    return new Response('Admin credentials not configured', { status: 500 });
  }

  // Request authentication if no/invalid Authorization header
  if (!auth || !auth.startsWith('Basic ')) {
    return new Response('Authentication required', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Admin Area"'
      }
    });
  }

  try {
    // Decode and verify credentials
    const [providedUser, providedPass] = atob(auth.slice(6)).split(':');
    
    if (providedUser === user && providedPass === pass) {
      return context.next();
    }

    return new Response('Invalid credentials', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Admin Area"'
      }
    });
  } catch {
    return new Response('Invalid authorization header', { status: 400 });
  }
};
