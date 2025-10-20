const express = require('express');
const router = express.Router();

const carts = new Map();

function cleanupOldCarts() {
  const now = Date.now();
  const dayInMs = 24 * 60 * 60 * 1000;
  
  for (const [sessionId, cart] of carts.entries()) {
    if (now - cart.updatedAt > dayInMs) {
      carts.delete(sessionId);
    }
  }
}

setInterval(cleanupOldCarts, 60 * 60 * 1000);

function getSessionId(req) {
  let sessionId = req.cookies.cart_session;
  if (!sessionId) {
    sessionId = req.query.sessionId;
  }
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  return sessionId;
}

// GET /api/cart
router.get('/', (req, res) => {
  const sessionId = getSessionId(req);
  const cart = carts.get(sessionId) || { items: [], updatedAt: Date.now() };
  
  const subtotal = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);
  
  res.cookie('cart_session', sessionId, { maxAge: 24 * 60 * 60 * 1000, httpOnly: false, sameSite: 'lax' });
  res.json({
    sessionId,
    items: cart.items,
    subtotal,
    itemCount,
    updatedAt: cart.updatedAt
  });
});

// Helper function to calculate price based on quantity and price tiers
function calculatePrice(quantity, priceTiers, basePrice) {
  if (!priceTiers || priceTiers.length === 0) {
    return basePrice;
  }
  
  // Sort tiers by quantity descending to get the best matching tier
  const sortedTiers = [...priceTiers].sort((a, b) => b.quantity - a.quantity);
  
  // Find the applicable tier
  for (const tier of sortedTiers) {
    if (quantity >= tier.quantity) {
      return tier.price;
    }
  }
  
  // If no tier matches, use the lowest tier or base price
  return priceTiers[0]?.price || basePrice;
}

// POST /api/cart
router.post('/', (req, res) => {
  try {
    const { productId, name, image, price, quantity, category, priceTiers } = req.body;
    
    if (!productId || !name || price === undefined || !quantity) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'productId, name, price, and quantity are required'
      });
    }

    const sessionId = getSessionId(req);
    const cart = carts.get(sessionId) || { items: [], updatedAt: Date.now() };
    
    const existingIndex = cart.items.findIndex(item => item.productId === productId);
    
    if (existingIndex >= 0) {
      cart.items[existingIndex].quantity += quantity;
      // Recalculate price based on new quantity
      if (cart.items[existingIndex].priceTiers) {
        cart.items[existingIndex].price = calculatePrice(
          cart.items[existingIndex].quantity,
          cart.items[existingIndex].priceTiers,
          price
        );
      }
    } else {
      const actualPrice = calculatePrice(quantity, priceTiers, price);
      cart.items.push({
        productId,
        name,
        image: image || '',
        price: actualPrice,
        basePrice: price,
        quantity,
        category: category || '',
        priceTiers: priceTiers || [],
        addedAt: Date.now()
      });
    }
    
    cart.updatedAt = Date.now();
    carts.set(sessionId, cart);

    const subtotal = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

    res.cookie('cart_session', sessionId, { maxAge: 24 * 60 * 60 * 1000, httpOnly: false, sameSite: 'lax' });
    res.json({
      sessionId,
      items: cart.items,
      subtotal,
      itemCount,
      message: 'Item added to cart'
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// PUT /api/cart
router.put('/', (req, res) => {
  try {
    const { productId, quantity } = req.body;
    
    if (!productId || quantity === undefined) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'productId and quantity are required'
      });
    }

    const sessionId = getSessionId(req);
    const cart = carts.get(sessionId);
    
    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    const itemIndex = cart.items.findIndex(item => item.productId === productId);
    
    if (itemIndex === -1) {
      return res.status(404).json({ error: 'Item not found in cart' });
    }

    if (quantity <= 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      cart.items[itemIndex].quantity = quantity;
      
      // Recalculate price based on new quantity if price tiers exist
      if (cart.items[itemIndex].priceTiers && cart.items[itemIndex].priceTiers.length > 0) {
        cart.items[itemIndex].price = calculatePrice(
          quantity,
          cart.items[itemIndex].priceTiers,
          cart.items[itemIndex].basePrice || cart.items[itemIndex].price
        );
      }
    }
    
    cart.updatedAt = Date.now();
    carts.set(sessionId, cart);

    const subtotal = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

    res.json({
      sessionId,
      items: cart.items,
      subtotal,
      itemCount,
      message: 'Cart updated'
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// DELETE /api/cart
router.delete('/', (req, res) => {
  try {
    const sessionId = getSessionId(req);
    const productId = req.query.productId;
    
    if (productId) {
      const cart = carts.get(sessionId);
      
      if (!cart) {
        return res.status(404).json({ error: 'Cart not found' });
      }

      cart.items = cart.items.filter(item => item.productId !== productId);
      cart.updatedAt = Date.now();
      carts.set(sessionId, cart);

      const subtotal = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

      res.json({
        sessionId,
        items: cart.items,
        subtotal,
        itemCount,
        message: 'Item removed from cart'
      });
    } else {
      carts.delete(sessionId);
      
      res.json({
        sessionId,
        items: [],
        subtotal: 0,
        itemCount: 0,
        message: 'Cart cleared'
      });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

module.exports = router;
