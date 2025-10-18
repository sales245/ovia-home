const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('Test server running on port 8888');
});

const PORT = 8888;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
  console.log('Press Ctrl+C to stop');
});