// Cloudflare Pages Function - Auth Endpoint
// Endpoint: /api/auth/*
// Müşteri kimlik doğrulama (Email+Password ve Google OAuth)

import { corsHeaders } from '../_middlewares.js';

// In-memory user storage (in production, use D1 database)
const users = new Map();

// Helper: Hash password (simple for demo - use bcrypt in production)
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Helper: Verify password
async function verifyPassword(password, hash) {
  const inputHash = await hashPassword(password);
  return inputHash === hash;
}

// Helper: Generate JWT-like token (simple for demo)
function generateToken(userId) {
  const payload = {
    userId,
    exp: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days
  };
  return btoa(JSON.stringify(payload));
}

// Helper: Verify token
function verifyToken(token) {
  try {
    const payload = JSON.parse(atob(token));
    if (payload.exp < Date.now()) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

export async function onRequest(context) {
  const { request } = context;
  const method = request.method;
  const url = new URL(request.url);
  const path = url.pathname;

  // Handle CORS preflight
  if (method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // POST /api/auth/register - Email+Password kayıt
    if (method === 'POST' && path.includes('/register')) {
      const data = await request.json();
      
      // Validate
      if (!data.email || !data.password || !data.name) {
        return new Response(JSON.stringify({
          error: 'Validation error',
          message: 'Email, password, and name are required'
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Check if user exists
      for (const [, user] of users) {
        if (user.email === data.email) {
          return new Response(JSON.stringify({
            error: 'User already exists',
            message: 'An account with this email already exists'
          }), {
            status: 409,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
      }

      // Create user
      const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const passwordHash = await hashPassword(data.password);
      
      const newUser = {
        id: userId,
        email: data.email,
        name: data.name,
        company: data.company || '',
        phone: data.phone || '',
        country: data.country || '',
        taxNumber: data.taxNumber || '',
        authProvider: 'email',
        passwordHash,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      users.set(userId, newUser);

      // Generate token
      const token = generateToken(userId);

      // Return user without password
      const { passwordHash: _, ...userWithoutPassword } = newUser;

      return new Response(JSON.stringify({
        user: userWithoutPassword,
        token
      }), {
        status: 201,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'Set-Cookie': `auth_token=${token}; Path=/; Max-Age=${7 * 24 * 60 * 60}; HttpOnly; SameSite=Lax`
        }
      });
    }

    // POST /api/auth/login - Email+Password giriş
    if (method === 'POST' && path.includes('/login')) {
      const data = await request.json();
      
      if (!data.email || !data.password) {
        return new Response(JSON.stringify({
          error: 'Validation error',
          message: 'Email and password are required'
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Find user
      let foundUser = null;
      for (const [, user] of users) {
        if (user.email === data.email && user.authProvider === 'email') {
          foundUser = user;
          break;
        }
      }

      if (!foundUser) {
        return new Response(JSON.stringify({
          error: 'Invalid credentials',
          message: 'Email or password is incorrect'
        }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Verify password
      const isValid = await verifyPassword(data.password, foundUser.passwordHash);
      
      if (!isValid) {
        return new Response(JSON.stringify({
          error: 'Invalid credentials',
          message: 'Email or password is incorrect'
        }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Generate token
      const token = generateToken(foundUser.id);

      // Return user without password
      const { passwordHash: _, ...userWithoutPassword } = foundUser;

      return new Response(JSON.stringify({
        user: userWithoutPassword,
        token
      }), {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'Set-Cookie': `auth_token=${token}; Path=/; Max-Age=${7 * 24 * 60 * 60}; HttpOnly; SameSite=Lax`
        }
      });
    }

    // POST /api/auth/google - Google OAuth
    if (method === 'POST' && path.includes('/google')) {
      const data = await request.json();
      
      if (!data.credential) {
        return new Response(JSON.stringify({
          error: 'Validation error',
          message: 'Google credential is required'
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Decode Google JWT (in production, verify signature)
      try {
        const parts = data.credential.split('.');
        const payload = JSON.parse(atob(parts[1]));
        
        const googleEmail = payload.email;
        const googleName = payload.name;
        const googlePicture = payload.picture;
        const googleId = payload.sub;

        // Check if user exists
        let foundUser = null;
        for (const [, user] of users) {
          if (user.email === googleEmail && user.authProvider === 'google') {
            foundUser = user;
            break;
          }
        }

        if (!foundUser) {
          // Create new user
          const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          
          foundUser = {
            id: userId,
            email: googleEmail,
            name: googleName,
            picture: googlePicture,
            googleId,
            authProvider: 'google',
            company: '',
            phone: '',
            country: '',
            createdAt: Date.now(),
            updatedAt: Date.now()
          };

          users.set(userId, foundUser);
        }

        // Generate token
        const token = generateToken(foundUser.id);

        return new Response(JSON.stringify({
          user: foundUser,
          token
        }), {
          status: 200,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
            'Set-Cookie': `auth_token=${token}; Path=/; Max-Age=${7 * 24 * 60 * 60}; HttpOnly; SameSite=Lax`
          }
        });

      } catch (error) {
        return new Response(JSON.stringify({
          error: 'Invalid Google credential',
          message: error.message
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    // GET /api/auth/me - Get current user
    if (method === 'GET' && path.includes('/me')) {
      // Get token from cookie or Authorization header
      const cookies = request.headers.get('Cookie') || '';
      let token = cookies.split(';').find(c => c.trim().startsWith('auth_token='))?.split('=')[1];
      
      if (!token) {
        const authHeader = request.headers.get('Authorization');
        if (authHeader && authHeader.startsWith('Bearer ')) {
          token = authHeader.substring(7);
        }
      }

      if (!token) {
        return new Response(JSON.stringify({
          error: 'Not authenticated',
          message: 'No authentication token provided'
        }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const payload = verifyToken(token);
      
      if (!payload) {
        return new Response(JSON.stringify({
          error: 'Invalid token',
          message: 'Token is invalid or expired'
        }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const user = users.get(payload.userId);
      
      if (!user) {
        return new Response(JSON.stringify({
          error: 'User not found'
        }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Return user without password
      const { passwordHash: _, ...userWithoutPassword } = user;

      return new Response(JSON.stringify({
        user: userWithoutPassword
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // POST /api/auth/logout
    if (method === 'POST' && path.includes('/logout')) {
      return new Response(JSON.stringify({
        message: 'Logged out successfully'
      }), {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'Set-Cookie': 'auth_token=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax'
        }
      });
    }

    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Auth API error:', error);
    return new Response(JSON.stringify({
      error: 'Internal server error',
      message: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}
