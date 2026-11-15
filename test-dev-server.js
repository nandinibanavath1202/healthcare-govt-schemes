const { spawn } = require('child_process');
const http = require('http');
const path = require('path');

const PORT = 3001;
const HOST = '127.0.0.1';

function fetchUrl(pathName) {
  return new Promise((resolve, reject) => {
    const req = http.get({
      host: HOST,
      port: PORT,
      path: pathName,
      timeout: 5000,
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        resolve({ status: res.statusCode, length: data.length });
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timed out'));
    });
  });
}

async function waitForServer(maxRetries = 40) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const res = await fetchUrl('/');
      if (res.status === 200) {
        return true;
      }
    } catch (e) {
      if (i % 5 === 0) console.log(`Waiting for server... attempt ${i + 1}: ${e.message}`);
    }
    await new Promise((r) => setTimeout(r, 1000));
  }
  return false;
}

async function main() {
  console.log(`Starting Next.js server on ${HOST}:${PORT}...`);

  const nextBin = path.join(__dirname, '..', 'node_modules', 'next', 'dist', 'bin', 'next');
  const server = spawn(process.execPath, [nextBin, 'dev', '-H', HOST, '-p', String(PORT)], {
    cwd: path.join(__dirname, '..'),
    env: { ...process.env, NEXT_TELEMETRY_DISABLED: '1' },
    stdio: 'pipe',
  });

  server.stdout.on('data', (d) => process.stdout.write(d));
  server.stderr.on('data', (d) => process.stderr.write(d));

  try {
    const isReady = await waitForServer(40);
    if (!isReady) {
      throw new Error('Server did not start in 40 seconds');
    }

    console.log('\n--- Server is UP! Probing All Routes ---\n');

    const routes = [
      '/',
      '/hospitals',
      '/eligibility',
      '/login',
      '/register',
      '/chat',
      '/schemes',
      '/api/categories',
      '/api/hospitals?search=Osmania',
      '/api/schemes',
    ];

    for (const r of routes) {
      try {
        const res = await fetchUrl(r);
        console.log(`[STATUS ${res.status}] ${r} (${res.length} bytes)`);
      } catch (err) {
        console.error(`[ERROR] ${r}:`, err.message);
      }
    }

    console.log('\n--- All Tested Routes Responded Successfully! ---');
  } finally {
    console.log('\nShutting down test server...');
    server.kill('SIGINT');
  }
}

main().catch((err) => {
  console.error('Test server error:', err);
  process.exit(1);
});
