const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8001;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGINS || '*',
  credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// Import routes
const settingsRoutes = require('./routes/settings');
const cartRoutes = require('./routes/cart');
const authRoutes = require('./routes/auth');
const addressesRoutes = require('./routes/addresses');
const paypalRoutes = require('./routes/paypal');
const ordersRoutes = require('./routes/orders');

// Routes
app.use('/api/settings', settingsRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/addresses', addressesRoutes);
app.use('/api/paypal', paypalRoutes);
app.use('/api/orders', ordersRoutes);

// Health check
app.get('/api', (req, res) => {
  res.json({ message: 'Ovia Home Backend API', version: '1.0.0' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend server running on port ${PORT}`);
});
