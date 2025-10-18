const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('Test server running...');
});

// Dinlenecek port ve adres
const PORT = 3000;
const HOST = '127.0.0.1';

app.listen(PORT, HOST, () => {
  console.log(`Server running at http://${HOST}:${PORT}/`);
});