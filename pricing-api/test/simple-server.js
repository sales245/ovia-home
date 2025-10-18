const express = require('express');

const app = express();
app.use(express.json());

app.get('/test', (req, res) => {
    res.json({ message: 'Test successful!' });
});

app.post('/test', (req, res) => {
    console.log('Received POST data:', req.body);
    res.json({ received: req.body });
});

const PORT = 49153;
app.listen(PORT, '127.0.0.1', () => {
    console.log(`Test server running on http://127.0.0.1:${PORT}`);
});