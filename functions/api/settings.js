// Cloudflare Pages Function - Settings Endpoint
// Endpoint: /api/settings
// Satış modu ve ödeme yöntemleri ayarlarını yönetir

import { corsHeaders } from '../_middlewares.js';

// Default settings
const defaultSettings = {
  salesMode: 'hybrid', // 'retail', 'wholesale', 'hybrid'
  paymentMethods: {
    creditCard: {
      enabled: false
    },
    bankTransfer: {
      enabled: true,
      instructions: 'Banka havalesi bilgileri:\n\nBanka: İş Bankası\nIBAN: TR00 0000 0000 0000 0000 0000 00\nAlıcı: Ovia Home Tekstil A.Ş.\n\nLütfen havale açıklamasına sipariş numaranızı yazınız.'
    },
    letterOfCredit: {
      enabled: true,
      instructions: 'LC (Letter of Credit) ile ödeme için:\n\n1. LC\'yi şu bankaya açınız: İş Bankası, Kadıköy Şubesi\n2. Beneficiary: Ovia Home Tekstil A.Ş.\n3. LC bir kopyasını info@oviahome.com adresine gönderin\n\nDetaylı bilgi için lütfen bizimle iletişime geçin.'
    },
    paypal: {
      enabled: false,
      environment: 'sandbox', // 'sandbox' or 'live'
      clientId: '',
      clientSecret: '',
      webhookId: ''
    }
  }
};

// In-memory storage for demo (in production, use D1 database or KV storage)
let currentSettings = { ...defaultSettings };

export async function onRequest(context) {
  const { request } = context;
  const method = request.method;

  // Handle CORS preflight
  if (method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // GET: Ayarları getir
    if (method === 'GET') {
      return new Response(JSON.stringify(currentSettings), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // PUT: Ayarları güncelle
    if (method === 'PUT') {
      const data = await request.json();
      
      // Update settings
      if (data.salesMode) {
        if (!['retail', 'wholesale', 'hybrid'].includes(data.salesMode)) {
          return new Response(JSON.stringify({
            error: 'Validation error',
            message: 'salesMode must be retail, wholesale, or hybrid'
          }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
        currentSettings.salesMode = data.salesMode;
      }

      if (data.paymentMethods) {
        currentSettings.paymentMethods = {
          ...currentSettings.paymentMethods,
          ...data.paymentMethods
        };
      }

      return new Response(JSON.stringify(currentSettings), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // POST: Reset to defaults
    if (method === 'POST' && new URL(request.url).pathname.endsWith('/reset')) {
      currentSettings = { ...defaultSettings };
      return new Response(JSON.stringify(currentSettings), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Settings API error:', error);
    return new Response(JSON.stringify({
      error: 'Internal server error',
      message: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}
