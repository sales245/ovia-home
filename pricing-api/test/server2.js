const express = require('express');
const app = express();

// Allow all origins for testing
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// Test endpoint
app.get('/test', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Listen on all network interfaces
const server = app.listen(3000, '0.0.0.0', () => {
  const host = server.address().address;
  const port = server.address().port;
  console.log(`Server running at http://${host}:${port}`);
  console.log('Try accessing:');
  console.log('- http://localhost:3000/test');
  console.log('- http://127.0.0.1:3000/test');
});