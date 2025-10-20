const express = require('express');
const router = express.Router();

const addresses = new Map();

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
      message: 'Please log in to manage addresses'
    });
  }
  
  req.userId = userId;
  next();
}

// GET /api/addresses
router.get('/', requireAuth, (req, res) => {
  const userAddresses = addresses.get(req.userId) || [];
  res.json(userAddresses);
});

// POST /api/addresses
router.post('/', requireAuth, (req, res) => {
  try {
    const { title, fullName, phone, address, city, state, postalCode, country, isDefault } = req.body;
    
    const required = ['title', 'fullName', 'phone', 'address', 'city', 'country'];
    for (const field of required) {
      if (!req.body[field]) {
        return res.status(400).json({
          error: 'Validation error',
          message: `${field} is required`
        });
      }
    }

    const userAddresses = addresses.get(req.userId) || [];
    
    const newAddress = {
      id: `addr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title,
      fullName,
      phone,
      address,
      city,
      state: state || '',
      postalCode: postalCode || '',
      country,
      isDefault: userAddresses.length === 0 ? true : (isDefault || false),
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    if (newAddress.isDefault) {
      userAddresses.forEach(addr => addr.isDefault = false);
    }

    userAddresses.push(newAddress);
    addresses.set(req.userId, userAddresses);

    res.status(201).json(newAddress);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// PUT /api/addresses
router.put('/', requireAuth, (req, res) => {
  try {
    const { id, ...updates } = req.body;
    
    if (!id) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Address ID is required'
      });
    }

    const userAddresses = addresses.get(req.userId) || [];
    const addressIndex = userAddresses.findIndex(addr => addr.id === id);
    
    if (addressIndex === -1) {
      return res.status(404).json({ error: 'Address not found' });
    }

    const updatedAddress = {
      ...userAddresses[addressIndex],
      ...updates,
      id: userAddresses[addressIndex].id,
      createdAt: userAddresses[addressIndex].createdAt,
      updatedAt: Date.now()
    };

    if (updatedAddress.isDefault) {
      userAddresses.forEach(addr => {
        if (addr.id !== updatedAddress.id) {
          addr.isDefault = false;
        }
      });
    }

    userAddresses[addressIndex] = updatedAddress;
    addresses.set(req.userId, userAddresses);

    res.json(updatedAddress);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// DELETE /api/addresses
router.delete('/', requireAuth, (req, res) => {
  try {
    const addressId = req.query.id;
    
    if (!addressId) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Address ID is required'
      });
    }

    const userAddresses = addresses.get(req.userId) || [];
    const addressIndex = userAddresses.findIndex(addr => addr.id === addressId);
    
    if (addressIndex === -1) {
      return res.status(404).json({ error: 'Address not found' });
    }

    const wasDefault = userAddresses[addressIndex].isDefault;
    userAddresses.splice(addressIndex, 1);
    
    if (wasDefault && userAddresses.length > 0) {
      userAddresses[0].isDefault = true;
    }

    addresses.set(req.userId, userAddresses);

    res.json({ message: 'Address deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

module.exports = router;
