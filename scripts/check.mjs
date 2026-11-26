import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { createContext, runInContext } from 'node:vm';
import { loadContent, output } from './content.mjs';

const base = '/elbsao/';
const origin = 'https://wiki.invalid';
const editor = 'https://app.pagescms.org/LiNoKami/elbsao/main/collection/';
const { categories, entries } = await loadContent();
const paths = ['', '404.html', ...categories.map(({id}) => id + '/'), ...entries.map(({category,id}) => category + '/' + id + '/')];
const docs = new Map();

for (const path of paths) {
  const file = path.endsWith('.html') ? path : path + 'index.html';
  const html = await readFile(resolve(output,file),'utf8');
  assert.equal((html.match(/<h1[\s>]/g) || []).length, 1, path + ' has a single page title');
  assert.match(html, /<main id="content">/);
  assert.doesNotMatch(html, /data\/saomod\//);
  docs.set(base + path, html);
}
for (const [path, html] of docs) {
  for (const [, url] of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const destination = new URL(url, origin + path);
    if (destination.origin !== origin) continue;
    assert.ok(destination.pathname.startsWith(base), 'Link outside site: ' + url + ' at ' + path);
    if (docs.has(destination.pathname)) {
      if (destination.hash) {
        const id = decodeURIComponent(destination.hash.slice(1));
        assert.ok(docs.get(destination.pathname).includes('id="' + id + '"'), 'Unknown anchor: ' + url + ' at ' + path);
      }
    } else {
      await access(resolve(output,decodeURIComponent(destination.pathname.slice(base.length))));
    }
  }
}
const sandbox = createContext({ window: {} });
runInContext(await readFile(resolve(output,'assets/search-index.js'),'utf8'), sandbox);
assert.equal(sandbox.window.wikiSearchIndex.length, entries.length);
for (const record of sandbox.window.wikiSearchIndex) assert.ok(docs.has(base + record.path));
for (const { id } of categories) assert.ok(docs.get(base + id + '/').includes(editor + id + '/new'));
for (const { id, category } of entries) {
  const path = category + '/' + id;
  const editUrl = editor + category + '/edit/' + encodeURIComponent('content/entries/' + path + '.json');
  assert.ok(docs.get(base + path + '/').includes(editUrl), 'Incorrect editor link for ' + path);
}
await access(resolve(output,'.nojekyll'));
console.log('Verified ' + docs.size + ' pages, internal links, anchors, editor links, and ' + entries.length + ' search entries.');
