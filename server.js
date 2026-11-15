const http = require('http');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const hostname = '0.0.0.0';
const port = parseInt(process.env.PORT, 10) || 3000;

console.log(`[INIT] Initializing Telangana Healthcare Schemes Portal on ${hostname}:${port}...`);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

let isReady = false;
const preparePromise = app.prepare().then(() => {
  isReady = true;
  console.log('[READY] Next.js bundle & route preparation complete!');
}).catch((err) => {
  console.error('[PREPARE ERROR]', err);
});

const server = http.createServer(async (req, res) => {
  // CORS & headers
  res.setHeader('X-Powered-By', 'Telangana-Healthcare-AI');

  try {
    if (!isReady) {
      // If client requests root or assets while compiling, await preparation
      await preparePromise;
    }
    await handle(req, res);
  } catch (err) {
    console.error('[REQUEST ERROR]', req.url, err);
    if (!res.headersSent) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.end(`<h1>500 Internal Error</h1><p>${err.message}</p>`);
    }
  }
});

process.on('uncaughtException', (err) => {
  console.error('[UNCAUGHT EXCEPTION]', err);
});
process.on('unhandledRejection', (reason, promise) => {
  console.error('[UNHANDLED REJECTION]', reason);
});

server.once('error', (err) => {
  console.error('[FATAL SERVER ERROR]', err);
  process.exit(1);
});

server.listen(port, hostname, () => {
  console.log(`\n==================================================`);
  console.log(`>>> TELANGANA HEALTHCARE SCHEMES PORTAL READY <<<`);
  console.log(`>>> Local Access: http://localhost:${port}          <<<`);
  console.log(`>>> Network Access: http://127.0.0.1:${port}        <<<`);
  console.log(`==================================================\n`);
});
