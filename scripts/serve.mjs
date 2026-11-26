import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';
import { output as root } from './content.mjs';

const base = '/elbsao/';
const port = Number(process.env.WIKI_PREVIEW_PORT || 4173);
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.gif': 'image/gif', '.avif': 'image/avif' };

createServer(async (request, response) => {
  try {
    const url = new URL(request.url, 'http://localhost');
    if (url.pathname === '/' || url.pathname === base.slice(0, -1)) {
      response.writeHead(302, { Location: base });
      return response.end();
    }
    const path = decodeURIComponent(url.pathname.startsWith(base) ? url.pathname.slice(base.length) : '');
    const file = resolve(root, !path || path.endsWith('/') ? path + 'index.html' : path);
    if (!url.pathname.startsWith(base) || !file.startsWith(resolve(root) + sep)) throw new Error('Missing page');
    const data = await readFile(file);
    response.writeHead(200, { 'Content-Type': types[extname(file)] || 'application/octet-stream' });
    response.end(request.method === 'HEAD' ? '' : data);
  } catch {
    response.writeHead(404, { 'Content-Type': types['.html'] });
    response.end(await readFile(resolve(root, '404.html')).catch(() => 'Build the wiki before starting preview.'));
  }
}).listen(port, '127.0.0.1', () => console.log('Wiki preview: http://127.0.0.1:' + port + base));
