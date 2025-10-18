const http = require('http');

const server = http.createServer((req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ status: 'ok', time: new Date() }));
});

const PORT = 49152; // IANA önerilen dinamik port aralığının başlangıcı
server.listen(PORT, '127.0.0.1', () => {
    console.log(`Server is running at http://127.0.0.1:${PORT}/`);
});