const express = require('express');
const router = express.Router();

// In-memory orders storage (in production, use database)
const orders = new Map();

// Helper: Get user ID from token
function getUserIdFromRequest(req) {
  let token = req.cookies.auth_token;
  
  if (!token) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
  }

  if (!token) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(token, 'base64').toString());
    if (payload.exp < Date.now()) {
      return null;
    }
    return payload.userId;
  } catch {
    return null;
  }
}

function requireAuth(req, res, next) {
  const userId = getUserIdFromRequest(req);
  
  if (!userId) {
    return res.status(401).json({
      error: 'Not authenticated',
      message: 'Please log in to access orders'
    });
  }
  
  req.userId = userId;
  next();
}

// GET /api/orders - Get all orders (admin) or user orders
router.get('/', (req, res) => {
  try {
    const userId = getUserIdFromRequest(req);
    const allOrders = Array.from(orders.values());
    
    // If authenticated, filter by user
    if (userId) {
      const userOrders = allOrders.filter(order => order.userId === userId);
      return res.json(userOrders);
    }
    
    // Otherwise return all orders (for admin)
    res.json(allOrders);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// GET /api/orders/:id - Get single order
router.get('/:id', (req, res) => {
  try {
    const order = orders.get(req.params.id);
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    // Check if user owns this order
    const userId = getUserIdFromRequest(req);
    if (userId && order.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// POST /api/orders - Create new order
router.post('/', requireAuth, (req, res) => {
  try {
    const {
      items,
      customerInfo,
      shippingAddress,
      paymentMethod,
      subtotal,
      shipping,
      tax,
      total
    } = req.body;

    // Validate required fields
    if (!items || items.length === 0) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Items are required'
      });
    }

    if (!customerInfo || !shippingAddress || !paymentMethod) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Customer info, shipping address, and payment method are required'
      });
    }

    // Generate order number
    const orderNumber = `OV${Date.now().toString().slice(-8)}`;
    const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const newOrder = {
      id: orderId,
      orderNumber,
      userId: req.userId,
      items,
      customerInfo,
      shippingAddress,
      paymentMethod,
      subtotal,
      shipping,
      tax,
      total,
      status: 'pending',
      paymentStatus: 'pending',
      trackingNumber: '',
      payoneerPaymentLink: '',
      notes: '',
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    orders.set(orderId, newOrder);

    res.status(201).json(newOrder);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// PUT /api/orders/:id - Update order (admin)
router.put('/:id', (req, res) => {
  try {
    const order = orders.get(req.params.id);
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Update order
    const updatedOrder = {
      ...order,
      ...req.body,
      id: order.id, // Preserve ID
      orderNumber: order.orderNumber, // Preserve order number
      createdAt: order.createdAt, // Preserve creation date
      updatedAt: Date.now()
    };

    orders.set(req.params.id, updatedOrder);

    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// DELETE /api/orders/:id - Delete order
router.delete('/:id', (req, res) => {
  try {
    const order = orders.get(req.params.id);
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    orders.delete(req.params.id);

    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

module.exports = router;
