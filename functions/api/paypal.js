// Cloudflare Pages Function - PayPal Endpoint
// Endpoint: /api/paypal/*
// PayPal ödeme entegrasyonu

import { corsHeaders } from '../_middlewares.js';

// PayPal API endpoints
const PAYPAL_API = {
  sandbox: 'https://api-m.sandbox.paypal.com',
  live: 'https://api-m.paypal.com'
};

// Get PayPal config from settings (in production, fetch from database)
async function getPayPalConfig() {
  // This should fetch from your settings API
  // For now, return default config
  return {
    clientId: process.env.PAYPAL_CLIENT_ID || 'demo-client-id',
    clientSecret: process.env.PAYPAL_CLIENT_SECRET || 'demo-client-secret',
    environment: 'sandbox'
  };
}

// Get PayPal access token
async function getAccessToken(clientId, clientSecret, environment) {
  const auth = btoa(`${clientId}:${clientSecret}`);
  const apiUrl = PAYPAL_API[environment];
  
  const response = await fetch(`${apiUrl}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: 'grant_type=client_credentials'
  });

  if (!response.ok) {
    throw new Error('Failed to get PayPal access token');
  }

  const data = await response.json();
  return data.access_token;
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
    // POST /api/paypal/create-order - Create PayPal order
    if (method === 'POST' && path.includes('/create-order')) {
      const data = await request.json();
      
      if (!data.amount || !data.currency) {
        return new Response(JSON.stringify({
          error: 'Validation error',
          message: 'Amount and currency are required'
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const config = await getPayPalConfig();
      const accessToken = await getAccessToken(config.clientId, config.clientSecret, config.environment);
      const apiUrl = PAYPAL_API[config.environment];

      // Create PayPal order
      const orderResponse = await fetch(`${apiUrl}/v2/checkout/orders`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          intent: 'CAPTURE',
          purchase_units: [{
            amount: {
              currency_code: data.currency || 'USD',
              value: data.amount.toFixed(2)
            },
            description: data.description || 'Ovia Home Tekstil Order'
          }],
          application_context: {
            return_url: data.returnUrl || `${url.origin}/checkout/success`,
            cancel_url: data.cancelUrl || `${url.origin}/checkout/cancel`,
            brand_name: 'Ovia Home',
            shipping_preference: 'NO_SHIPPING'
          }
        })
      });

      if (!orderResponse.ok) {
        const error = await orderResponse.json();
        throw new Error(error.message || 'Failed to create PayPal order');
      }

      const order = await orderResponse.json();

      return new Response(JSON.stringify({
        orderId: order.id,
        approvalUrl: order.links.find(link => link.rel === 'approve')?.href
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // POST /api/paypal/capture-order - Capture PayPal payment
    if (method === 'POST' && path.includes('/capture-order')) {
      const data = await request.json();
      
      if (!data.orderId) {
        return new Response(JSON.stringify({
          error: 'Validation error',
          message: 'Order ID is required'
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const config = await getPayPalConfig();
      const accessToken = await getAccessToken(config.clientId, config.clientSecret, config.environment);
      const apiUrl = PAYPAL_API[config.environment];

      // Capture PayPal order
      const captureResponse = await fetch(`${apiUrl}/v2/checkout/orders/${data.orderId}/capture`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!captureResponse.ok) {
        const error = await captureResponse.json();
        throw new Error(error.message || 'Failed to capture PayPal payment');
      }

      const capture = await captureResponse.json();

      return new Response(JSON.stringify({
        status: capture.status,
        captureId: capture.purchase_units[0]?.payments?.captures[0]?.id,
        details: capture
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // POST /api/paypal/webhook - Handle PayPal webhooks
    if (method === 'POST' && path.includes('/webhook')) {
      const data = await request.json();
      
      // Verify webhook signature (in production)
      // For now, just log the event
      console.log('PayPal webhook received:', data.event_type);

      // Handle different event types
      switch (data.event_type) {
        case 'PAYMENT.CAPTURE.COMPLETED':
          // Payment completed successfully
          console.log('Payment captured:', data.resource.id);
          break;
        
        case 'PAYMENT.CAPTURE.DENIED':
          // Payment denied
          console.log('Payment denied:', data.resource.id);
          break;
        
        case 'PAYMENT.CAPTURE.REFUNDED':
          // Payment refunded
          console.log('Payment refunded:', data.resource.id);
          break;
        
        default:
          console.log('Unhandled event type:', data.event_type);
      }

      return new Response(JSON.stringify({ received: true }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // GET /api/paypal/config - Get PayPal client config for frontend
    if (method === 'GET' && path.includes('/config')) {
      const config = await getPayPalConfig();
      
      return new Response(JSON.stringify({
        clientId: config.clientId,
        environment: config.environment
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('PayPal API error:', error);
    return new Response(JSON.stringify({
      error: 'PayPal error',
      message: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}
