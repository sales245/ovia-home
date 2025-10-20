// Cloudflare Pages Function - Addresses Endpoint
// Endpoint: /api/addresses
// Müşteri adreslerini yönetir

import { corsHeaders } from '../_middlewares.js';

// In-memory address storage (in production, use D1 database)
// Format: { userId: [addresses] }
const addresses = new Map();

// Helper: Get user ID from token
function getUserIdFromRequest(request) {
  const cookies = request.headers.get('Cookie') || '';
  let token = cookies.split(';').find(c => c.trim().startsWith('auth_token='))?.split('=')[1];
  
  if (!token) {
    const authHeader = request.headers.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
  }

  if (!token) {
    return null;
  }

  try {
    const payload = JSON.parse(atob(token));
    if (payload.exp < Date.now()) {
      return null;
    }
    return payload.userId;
  } catch {
    return null;
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

  // Get authenticated user
  const userId = getUserIdFromRequest(request);
  
  if (!userId) {
    return new Response(JSON.stringify({
      error: 'Not authenticated',
      message: 'Please log in to manage addresses'
    }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  try {
    // GET: Kullanıcının adreslerini getir
    if (method === 'GET') {
      const userAddresses = addresses.get(userId) || [];
      
      return new Response(JSON.stringify(userAddresses), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // POST: Yeni adres ekle
    if (method === 'POST') {
      const data = await request.json();
      
      // Validate required fields
      const required = ['title', 'fullName', 'phone', 'address', 'city', 'country'];
      for (const field of required) {
        if (!data[field]) {
          return new Response(JSON.stringify({
            error: 'Validation error',
            message: `${field} is required`
          }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
      }

      // Get or create user addresses array
      const userAddresses = addresses.get(userId) || [];
      
      // Create new address
      const newAddress = {
        id: `addr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title: data.title,
        fullName: data.fullName,
        phone: data.phone,
        address: data.address,
        city: data.city,
        state: data.state || '',
        postalCode: data.postalCode || '',
        country: data.country,
        isDefault: userAddresses.length === 0 ? true : (data.isDefault || false),
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      // If this is set as default, remove default from others
      if (newAddress.isDefault) {
        userAddresses.forEach(addr => addr.isDefault = false);
      }

      userAddresses.push(newAddress);
      addresses.set(userId, userAddresses);

      return new Response(JSON.stringify(newAddress), {
        status: 201,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // PUT: Adresi güncelle
    if (method === 'PUT') {
      const data = await request.json();
      
      if (!data.id) {
        return new Response(JSON.stringify({
          error: 'Validation error',
          message: 'Address ID is required'
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const userAddresses = addresses.get(userId) || [];
      const addressIndex = userAddresses.findIndex(addr => addr.id === data.id);
      
      if (addressIndex === -1) {
        return new Response(JSON.stringify({
          error: 'Address not found'
        }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Update address
      const updatedAddress = {
        ...userAddresses[addressIndex],
        ...data,
        id: userAddresses[addressIndex].id, // Preserve ID
        createdAt: userAddresses[addressIndex].createdAt, // Preserve creation date
        updatedAt: Date.now()
      };

      // If this is set as default, remove default from others
      if (updatedAddress.isDefault) {
        userAddresses.forEach(addr => {
          if (addr.id !== updatedAddress.id) {
            addr.isDefault = false;
          }
        });
      }

      userAddresses[addressIndex] = updatedAddress;
      addresses.set(userId, userAddresses);

      return new Response(JSON.stringify(updatedAddress), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // DELETE: Adresi sil
    if (method === 'DELETE') {
      const addressId = url.searchParams.get('id');
      
      if (!addressId) {
        return new Response(JSON.stringify({
          error: 'Validation error',
          message: 'Address ID is required'
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const userAddresses = addresses.get(userId) || [];
      const addressIndex = userAddresses.findIndex(addr => addr.id === addressId);
      
      if (addressIndex === -1) {
        return new Response(JSON.stringify({
          error: 'Address not found'
        }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const wasDefault = userAddresses[addressIndex].isDefault;
      userAddresses.splice(addressIndex, 1);
      
      // If deleted address was default, make first address default
      if (wasDefault && userAddresses.length > 0) {
        userAddresses[0].isDefault = true;
      }

      addresses.set(userId, userAddresses);

      return new Response(JSON.stringify({
        message: 'Address deleted successfully'
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Addresses API error:', error);
    return new Response(JSON.stringify({
      error: 'Internal server error',
      message: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}
