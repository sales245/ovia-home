const express = require('express');
const router = express.Router();
const crypto = require('crypto');

const users = new Map();

async function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

async function verifyPassword(password, hash) {
  const inputHash = await hashPassword(password);
  return inputHash === hash;
}

function generateToken(userId) {
  const payload = {
    userId,
    exp: Date.now() + (7 * 24 * 60 * 60 * 1000)
  };
  return Buffer.from(JSON.stringify(payload)).toString('base64');
}

function verifyToken(token) {
  try {
    const payload = JSON.parse(Buffer.from(token, 'base64').toString());
    if (payload.exp < Date.now()) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, company, phone, country, taxNumber } = req.body;
    
    if (!email || !password || !name) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Email, password, and name are required'
      });
    }

    for (const [, user] of users) {
      if (user.email === email) {
        return res.status(409).json({
          error: 'User already exists',
          message: 'An account with this email already exists'
        });
      }
    }

    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const passwordHash = await hashPassword(password);
    
    const newUser = {
      id: userId,
      email,
      name,
      company: company || '',
      phone: phone || '',
      country: country || '',
      taxNumber: taxNumber || '',
      authProvider: 'email',
      passwordHash,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    users.set(userId, newUser);

    const token = generateToken(userId);
    const { passwordHash: _, ...userWithoutPassword } = newUser;

    res.cookie('auth_token', token, { maxAge: 7 * 24 * 60 * 60 * 1000, httpOnly: true, sameSite: 'lax' });
    res.status(201).json({
      user: userWithoutPassword,
      token
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Email and password are required'
      });
    }

    let foundUser = null;
    for (const [, user] of users) {
      if (user.email === email && user.authProvider === 'email') {
        foundUser = user;
        break;
      }
    }

    if (!foundUser) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Email or password is incorrect'
      });
    }

    const isValid = await verifyPassword(password, foundUser.passwordHash);
    
    if (!isValid) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Email or password is incorrect'
      });
    }

    const token = generateToken(foundUser.id);
    const { passwordHash: _, ...userWithoutPassword } = foundUser;

    res.cookie('auth_token', token, { maxAge: 7 * 24 * 60 * 60 * 1000, httpOnly: true, sameSite: 'lax' });
    res.json({
      user: userWithoutPassword,
      token
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// POST /api/auth/google
router.post('/google', (req, res) => {
  try {
    const { credential, userData } = req.body;
    
    if (!userData || !userData.email) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'User data is required'
      });
    }

    const googleEmail = userData.email;
    const googleName = userData.name;
    const googlePicture = userData.picture;
    const googleId = userData.id;

    let foundUser = null;
    for (const [, user] of users) {
      if (user.email === googleEmail) {
        foundUser = user;
        break;
      }
    }

    if (!foundUser) {
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
    } else {
      // Update picture if it changed
      if (googlePicture && foundUser.picture !== googlePicture) {
        foundUser.picture = googlePicture;
        foundUser.updatedAt = Date.now();
        users.set(foundUser.id, foundUser);
      }
    }

    const token = generateToken(foundUser.id);

    res.cookie('auth_token', token, { maxAge: 7 * 24 * 60 * 60 * 1000, httpOnly: true, sameSite: 'lax' });
    res.json({
      user: foundUser,
      token
    });

  } catch (error) {
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// GET /api/auth/me
router.get('/me', (req, res) => {
  try {
    let token = req.cookies.auth_token;
    
    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

    if (!token) {
      return res.status(401).json({
        error: 'Not authenticated',
        message: 'No authentication token provided'
      });
    }

    const payload = verifyToken(token);
    
    if (!payload) {
      return res.status(401).json({
        error: 'Invalid token',
        message: 'Token is invalid or expired'
      });
    }

    const user = users.get(payload.userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { passwordHash: _, ...userWithoutPassword } = user;

    res.json({ user: userWithoutPassword });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  res.clearCookie('auth_token');
  res.json({ message: 'Logged out successfully' });
});

module.exports = router;
