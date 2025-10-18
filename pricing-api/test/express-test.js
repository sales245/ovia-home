const express = require('express');
const app = express();

// Log middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
    next();
});

// CORS middleware
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

// Test endpoint
app.get('/ping', (req, res) => {
    res.json({ pong: new Date().toISOString() });
});

const PORT = 49153;
app.listen(PORT, '127.0.0.1', () => {
    console.log(`Express server running at http://127.0.0.1:${PORT}/ping`);
    console.log('Press Ctrl+C to stop');
});