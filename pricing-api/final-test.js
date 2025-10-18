const http = require('http');

const requestListener = function (req, res) {
    res.writeHead(200);
    res.end('Hello from Node.js server!');
}

const server = http.createServer(requestListener);
server.listen(9090, () => {
    console.log('Server is running on port 9090');
});