const http = require('http');

const server = http.createServer((req, res) => {
    res.setHeader('Content-Type', 'text/plain');
    res.end('Test OK');
});

// Dinleme seçeneklerini açıkça belirtelim
const options = {
    host: '0.0.0.0',
    port: 80,
    exclusive: false,
    ipv6Only: false
};

server.listen(options, () => {
    const addr = server.address();
    console.log(`Server running at http://${addr.address}:${addr.port}/`);
    console.log('Try accessing:');
    console.log('- http://localhost/');
    console.log('- http://127.0.0.1/');
});