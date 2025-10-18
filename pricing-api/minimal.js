const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('Hello World');
});

app.listen(8080, 'localhost', () => {
  console.log('Server running at http://localhost:8080');
});