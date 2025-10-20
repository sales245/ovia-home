const express = require('express');
const router = express.Router();

const PAYPAL_API = {
  sandbox: 'https://api-m.sandbox.paypal.com',
  live: 'https://api-m.paypal.com'
};

function getPayPalConfig() {
  return {
    clientId: process.env.PAYPAL_CLIENT_ID || 'demo-client-id',
    clientSecret: process.env.PAYPAL_CLIENT_SECRET || 'demo-client-secret',
    environment: 'sandbox'
  };
}

// GET /api/paypal/config
router.get('/config', (req, res) => {
  const config = getPayPalConfig();
  res.json({
    clientId: config.clientId,
    environment: config.environment
  });
});

// POST /api/paypal/create-order
router.post('/create-order', async (req, res) => {
  try {
    const { amount, currency, description, returnUrl, cancelUrl } = req.body;
    
    if (!amount || !currency) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Amount and currency are required'
      });
    }

    // Mock response for demo
    const mockOrderId = `ORDER_${Date.now()}`;
    
    res.json({
      orderId: mockOrderId,
      approvalUrl: `https://www.sandbox.paypal.com/checkoutnow?token=${mockOrderId}`
    });
  } catch (error) {
    res.status(500).json({ error: 'PayPal error', message: error.message });
  }
});

// POST /api/paypal/capture-order
router.post('/capture-order', async (req, res) => {
  try {
    const { orderId } = req.body;
    
    if (!orderId) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Order ID is required'
      });
    }

    // Mock response for demo
    res.json({
      status: 'COMPLETED',
      captureId: `CAPTURE_${Date.now()}`,
      details: {
        id: orderId,
        status: 'COMPLETED'
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'PayPal error', message: error.message });
  }
});

// POST /api/paypal/webhook
router.post('/webhook', (req, res) => {
  try {
    const data = req.body;
    console.log('PayPal webhook received:', data.event_type);
    res.json({ received: true });
  } catch (error) {
    res.status(500).json({ error: 'PayPal webhook error', message: error.message });
  }
});

module.exports = router;
