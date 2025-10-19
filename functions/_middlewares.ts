export type PagesFunction = (context: any) => Promise<Response> | Response;

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
