import { readFile, readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const root = fileURLToPath(new URL('../', import.meta.url));
export const output = resolve(root, 'dist');

const entriesDirectory = resolve(root, 'content/entries');

function readJson(path) {
  return readFile(path, 'utf8').then(text => JSON.parse(text));
}

export async function loadContent() {
  const categories = await readJson(resolve(root, 'content/categories.json'));
  const entries = [];
  for (const { id: category } of categories) {
    const folder = resolve(entriesDirectory, category);
    const files = await readdir(folder, { withFileTypes: true });
    for (const file of files.filter(item => item.isFile() && item.name.endsWith('.json')).sort((a, b) => a.name.localeCompare(b.name))) {
      const fields = await readJson(resolve(folder, file.name));
      entries.push({ ...fields, category, id: file.name.slice(0, -5) });
    }
  }
  return { categories, entries };
}
