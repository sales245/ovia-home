// Cloudflare Pages Function - Cart Endpoint
// Endpoint: /api/cart
// Sepet işlemlerini yönetir

import { corsHeaders } from '../_middlewares.js';

// In-memory cart storage (in production, use KV storage or session)
// Format: { sessionId: { items: [...], updatedAt: timestamp } }
const carts = new Map();

// Clean up old carts (older than 24 hours)
function cleanupOldCarts() {
  const now = Date.now();
  const dayInMs = 24 * 60 * 60 * 1000;
  
  for (const [sessionId, cart] of carts.entries()) {
    if (now - cart.updatedAt > dayInMs) {
      carts.delete(sessionId);
    }
  }
}

export async function onRequest(context) {
  const { request } = context;
  const method = request.method;
  const url = new URL(request.url);

  // Handle CORS preflight
  if (method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Clean up old carts periodically
  if (Math.random() < 0.1) { // 10% chance on each request
    cleanupOldCarts();
  }

  try {
    // Get session ID from cookie or query param
    const cookies = request.headers.get('Cookie') || '';
    let sessionId = cookies.split(';').find(c => c.trim().startsWith('cart_session='))?.split('=')[1];
    
    if (!sessionId) {
      sessionId = url.searchParams.get('sessionId');
    }
    
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    // GET: Sepeti getir
    if (method === 'GET') {
      const cart = carts.get(sessionId) || { items: [], updatedAt: Date.now() };
      
      // Calculate totals
      const subtotal = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);
      
      return new Response(JSON.stringify({
        sessionId,
        items: cart.items,
        subtotal,
        itemCount,
        updatedAt: cart.updatedAt
      }), {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'Set-Cookie': `cart_session=${sessionId}; Path=/; Max-Age=${24 * 60 * 60}; SameSite=Lax`
        }
      });
    }

    // POST: Sepete ürün ekle
    if (method === 'POST') {
      const data = await request.json();
      
      // Validate required fields
      if (!data.productId || !data.name || !data.price || !data.quantity) {
        return new Response(JSON.stringify({
          error: 'Validation error',
          message: 'productId, name, price, and quantity are required'
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Get or create cart
      const cart = carts.get(sessionId) || { items: [], updatedAt: Date.now() };
      
      // Check if item already exists
      const existingIndex = cart.items.findIndex(item => item.productId === data.productId);
      
      if (existingIndex >= 0) {
        // Update quantity
        cart.items[existingIndex].quantity += data.quantity;
      } else {
        // Add new item
        cart.items.push({
          productId: data.productId,
          name: data.name,
          image: data.image || '',
          price: data.price,
          quantity: data.quantity,
          category: data.category || '',
          addedAt: Date.now()
        });
      }
      
      cart.updatedAt = Date.now();
      carts.set(sessionId, cart);

      const subtotal = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

      return new Response(JSON.stringify({
        sessionId,
        items: cart.items,
        subtotal,
        itemCount,
        message: 'Item added to cart'
      }), {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'Set-Cookie': `cart_session=${sessionId}; Path=/; Max-Age=${24 * 60 * 60}; SameSite=Lax`
        }
      });
    }

    // PUT: Sepetteki ürün miktarını güncelle
    if (method === 'PUT') {
      const data = await request.json();
      
      if (!data.productId || data.quantity === undefined) {
        return new Response(JSON.stringify({
          error: 'Validation error',
          message: 'productId and quantity are required'
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const cart = carts.get(sessionId);
      
      if (!cart) {
        return new Response(JSON.stringify({
          error: 'Cart not found'
        }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const itemIndex = cart.items.findIndex(item => item.productId === data.productId);
      
      if (itemIndex === -1) {
        return new Response(JSON.stringify({
          error: 'Item not found in cart'
        }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      if (data.quantity <= 0) {
        // Remove item
        cart.items.splice(itemIndex, 1);
      } else {
        // Update quantity
        cart.items[itemIndex].quantity = data.quantity;
      }
      
      cart.updatedAt = Date.now();
      carts.set(sessionId, cart);

      const subtotal = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

      return new Response(JSON.stringify({
        sessionId,
        items: cart.items,
        subtotal,
        itemCount,
        message: 'Cart updated'
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // DELETE: Sepeti temizle veya ürün sil
    if (method === 'DELETE') {
      const productId = url.searchParams.get('productId');
      
      if (productId) {
        // Remove specific item
        const cart = carts.get(sessionId);
        
        if (!cart) {
          return new Response(JSON.stringify({
            error: 'Cart not found'
          }), {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        cart.items = cart.items.filter(item => item.productId !== productId);
        cart.updatedAt = Date.now();
        carts.set(sessionId, cart);

        const subtotal = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

        return new Response(JSON.stringify({
          sessionId,
          items: cart.items,
          subtotal,
          itemCount,
          message: 'Item removed from cart'
        }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } else {
        // Clear entire cart
        carts.delete(sessionId);
        
        return new Response(JSON.stringify({
          sessionId,
          items: [],
          subtotal: 0,
          itemCount: 0,
          message: 'Cart cleared'
        }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Cart API error:', error);
    return new Response(JSON.stringify({
      error: 'Internal server error',
      message: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}
