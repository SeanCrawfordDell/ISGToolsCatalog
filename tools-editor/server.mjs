import { createServer } from 'node:http';
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const dir = new URL('.', import.meta.url);
const catalogPath = new URL('../src/data/tools.json', import.meta.url);
const submitPath = new URL('./submitted-changes.json', import.meta.url);
const port = Number(process.env.PORT) || 5180;

const send = (res, status, body, type = 'application/json') => {
  res.writeHead(status, { 'Content-Type': `${type}; charset=utf-8` });
  res.end(body);
};

const readBody = (req) => new Promise((resolve, reject) => {
  let data = '';
  req.on('data', chunk => {
    data += chunk;
    if (data.length > 5e6) reject(new Error('Payload too large'));
  });
  req.on('end', () => resolve(data));
  req.on('error', reject);
});

createServer(async (req, res) => {
  try {
    const { pathname } = new URL(req.url, 'http://localhost');
    if (req.method === 'GET' && (pathname === '/' || pathname === '/index.html')) {
      return send(res, 200, await readFile(new URL('./index.html', dir)), 'text/html');
    }
    if (req.method === 'GET' && pathname === '/tools.json') {
      return send(res, 200, await readFile(catalogPath));
    }
    if (req.method === 'POST' && pathname === '/submit') {
      const { changes, prompt, tools } = JSON.parse(await readBody(req));
      if (!Array.isArray(changes) || !changes.length) return send(res, 400, JSON.stringify({ error: 'No changes' }));
      await writeFile(submitPath, JSON.stringify({ submittedAt: new Date().toISOString(), status: 'pending', changes, prompt, tools }, null, 2));
      return send(res, 200, JSON.stringify({ ok: true, file: fileURLToPath(submitPath) }));
    }
    send(res, 404, JSON.stringify({ error: 'Not found' }));
  } catch (error) {
    send(res, 500, JSON.stringify({ error: error.message }));
  }
}).listen(port, '127.0.0.1', () => console.log(`Tools editor: http://127.0.0.1:${port}`));
