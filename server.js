// server.js
const { createServer } = require('http');
const next = require('next');

const hostname = '0.0.0.0';
const port = process.env.PORT || 3000;
const dev = false;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => {
    handle(req, res);
  }).listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
  });
});
