const http = require('http');

const server = http.createServer((req, res) => {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('Node.js HTTP server test\n');
});

const port = 9999;
server.listen(port, 'localhost', () => {
    console.log(`Server running at http://localhost:${port}/`);
    console.log('Use Ctrl+C to stop');
});