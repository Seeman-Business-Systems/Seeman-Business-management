import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const distDir = resolve(__dirname, 'dist');
const port = Number(process.env.PORT || 4173);

const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.gif': 'image/gif',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

function sendFile(res, filePath) {
  const ext = extname(filePath);
  res.writeHead(200, {
    'Content-Type': contentTypes[ext] || 'application/octet-stream',
  });
  createReadStream(filePath).pipe(res);
}

function resolveDistPath(pathname) {
  const decodedPath = decodeURIComponent(pathname.split('?')[0]);
  const cleanPath = normalize(decodedPath).replace(/^(\.\.[/\\])+/, '');
  return join(distDir, cleanPath);
}

createServer((req, res) => {
  if (!existsSync(distDir)) {
    res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Client build not found. Run npm run build first.');
    return;
  }

  const requestPath = new URL(req.url || '/', `http://${req.headers.host}`).pathname;
  const filePath = resolveDistPath(requestPath);
  const hasExtension = Boolean(extname(requestPath));

  if (existsSync(filePath) && statSync(filePath).isFile()) {
    sendFile(res, filePath);
    return;
  }

  if (hasExtension) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not found');
    return;
  }

  sendFile(res, join(distDir, 'index.html'));
}).listen(port, '0.0.0.0', () => {
  console.log(`Client server listening on port ${port}`);
});
