import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const output = resolve(root, 'docs');
const { categories, entries } = JSON.parse(await readFile(resolve(root, 'content/wiki.json'), 'utf8'));
const key = entry => entry.category + '/' + entry.id;
const entryMap = new Map(entries.map(entry => [key(entry), entry]));
const categoryMap = new Map(categories.map(category => [category.id, category]));
const slug = label => label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const escape = value => String(value).replace(/[&<>"']/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
})[char]);

const iconPaths = {
  sword: '<path d="M12 2v15m-4-4h8m-4 4v5m-2-3h4M12 2l2 3-2 3-2-3z"/>',
  search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
  book: '<path d="M12 6v14M12 6C9 4 5 4 2 5v14c3-1 7-1 10 1 3-2 7-2 10-1V5c-3-1-7-1-10 1Z"/>',
  crystal: '<path d="m12 2 7 6v8l-7 6-7-6V8zm0 0v20M5 8l7 4 7-4"/>',
  compass: '<circle cx="12" cy="12" r="9"/><path d="m15 9-2 4-4 2 2-4z"/>',
  layers: '<path d="m12 3 10 5-10 5L2 8zm-10 9 10 5 10-5M2 16l10 5 10-5"/>',
  cross: '<path d="m6 6 12 12M18 6 6 18"/>'
};
const icon = name => `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.45" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${iconPaths[name]}</svg>`;
const brand = base => `<a class="brand" href="${base}">${icon('sword')}<span>Sword Art Offline</span></a>`;
const route = (base, path = '') => base + (path ? path + '/' : '');
const anchor = (base, path, label, cls = '') => `<a href="${route(base, path)}"${cls ? ` class="${cls}"` : ''}>${escape(label)}</a>`;
const sectionTitle = title => `<h2 class="ruled-title">${escape(title)}</h2>`;

function header(base, current) {
  const links = [{ id: '', name: 'Home' }, ...categories];
  return `<header class="site-header">
  <div class="frame header-inner">
    ${brand(base)}
    <nav aria-label="Main navigation">${links.map(({id, name}) => `<a href="${route(base,id)}"${id === current ? ' aria-current="page"' : ''}>${name}</a>`).join('')}</nav>
    <button class="header-search" type="button" data-open-search aria-label="Search the wiki">${icon('search')}<span>Search the wiki</span><kbd>Ctrl K</kbd></button>
  </div>
</header>`;
}

function footer(base) {
  return `<footer class="site-footer"><div class="frame footer-inner">
    <div>${brand(base)}<p>An unofficial player wiki for Sword Art Offline.</p></div>
    <nav aria-label="Footer navigation">${categories.map(category => anchor(base, category.id, category.name)).join('')}<a href="#top">Back to top</a></nav>
  </div></footer>`;
}

function searchDialog() {
  return `<dialog class="search-dialog" id="wiki-search" aria-labelledby="search-heading">
    <div class="search-dialog-inner">
      <div class="dialog-heading"><h2 id="search-heading">Search the wiki</h2><form method="dialog"><button type="submit" class="icon-button" aria-label="Close search">${icon('cross')}</button></form></div>
      <label class="dialog-search-control" for="search-query">${icon('search')}<span class="visually-hidden">Search mobs, items, locations and guides</span><input id="search-query" type="search" placeholder="Try Frenzy Boar or forging" autocomplete="off" spellcheck="false"></label>
      <p class="search-message" id="search-message" role="status"></p>
      <ul class="search-results" id="search-results"></ul>
    </div>
  </dialog>`;
}

function layout({ base, title, description, current, body }) {
  return `<!doctype html>
<html lang="en" id="top" data-wiki-root="${base}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#101a28">
  <meta name="description" content="${escape(description)}">
  <title>${escape(title)} · Sword Art Offline Wiki</title>
  <link rel="icon" href="${base}assets/mark.svg" type="image/svg+xml">
  <link rel="stylesheet" href="${base}assets/wiki.css">
  <script src="${base}assets/search-index.js" defer></script>
  <script src="${base}assets/wiki.js" defer></script>
</head>
<body>
  <a class="skip-link" href="#content">Skip to content</a>
  ${header(base, current)}
  <main id="content">${body}</main>
  ${footer(base)}
  ${searchDialog()}
</body>
</html>
`;
}

function compactList(paths, base) {
  return `<ul class="compact-list">${paths.map(path => {
    const entry = entryMap.get(path);
    return `<li><a href="${route(base, path)}"><span>${escape(entry.title)}</span><span class="compact-type">${escape(entry.type)}</span></a></li>`;
  }).join('')}</ul>`;
}

function renderHome() {
  const base = './';
  const featured = entryMap.get('bestiary/frenzy-boar');
  const sections = [
    ['bestiary', 'compass', ['bestiary/frenzy-boar', 'bestiary/illfang', 'bestiary/canopy-prowler']],
    ['items', 'crystal', ['items/boarfang-blade', 'items/tuskbite-ring', 'items/revive-crystal']],
    ['locations', 'layers', ['locations/stachion', 'locations/lake-talpha', 'locations/stachion-labyrinth']]
  ];
  return layout({
    base, current: '', title: 'Aincrad field guide', description: 'A player wiki for Sword Art Offline. Browse mobs, items, locations, and survival guides.',
    body: `<section class="frame hero">
      <div class="hero-copy">
        <h1 class="slash-title">Aincrad<br>Field Guide</h1>
        <p class="hero-description">Look up creatures, gear, and locations before your next run.</p>
        <button type="button" class="hero-search" data-open-search>${icon('search')}<span>Search the wiki</span><kbd>Ctrl K</kbd></button>
        <a class="hero-browse" href="./bestiary/">Browse the bestiary</a>
      </div>
      <aside class="hero-console" aria-labelledby="featured-title">
        <div class="console-orbit" aria-hidden="true"><span></span></div>
        <p class="console-label">From the bestiary</p>
        <h2 id="featured-title">${anchor(base, key(featured), featured.title)}</h2>
        <p class="console-deck">${escape(featured.summary)}</p>
        <nav aria-label="Featured creature sections">
          <a class="console-selected" href="${route(base, key(featured))}">Overview</a>
          <a href="${route(base, key(featured))}#encounter">Encounter</a>
          <a href="${route(base, key(featured))}#loot-and-gear">Loot</a>
        </nav>
        <dl class="console-cues"><div><dt>Attack cues</dt><dd>Hoof scrape · Snort · Charge</dd></div></dl>
      </aside>
    </section>
    <section class="frame start-strip" aria-label="Start here">
      <a class="start-link critical" href="./guide/death-and-revival/">${icon('crystal')}<span><strong>Death &amp; revival</strong><small>Check the rules before you fight.</small></span></a>
      <a class="start-link" href="./guide/first-session/">${icon('book')}<span><strong>First-session checklist</strong><small>Get ready to leave town.</small></span></a>
    </section>
    <section class="frame directory" aria-label="Browse the wiki">
      ${sections.map(([id, symbol, paths]) => {
        const category = categoryMap.get(id);
        return `<div class="directory-column"><h2>${icon(symbol)}${anchor(base,id,category.name)}</h2>${compactList(paths,base)}</div>`;
      }).join('')}
    </section>`
  });
}

function breadcrumbs(base, category, insideEntry = false) {
  const trail = insideEntry ? anchor(base, category.id, category.name) : `<span aria-current="page">${escape(category.name)}</span>`;
  return `<nav class="breadcrumbs" aria-label="Breadcrumb">${anchor(base, '', 'Home')}<span aria-hidden="true">/</span>${trail}</nav>`;
}

function renderCategory(category) {
  const base = '../';
  const catalogue = entries.filter(entry => entry.category === category.id);
  return layout({
    base, title: category.name, current: category.id, description: category.intro,
    body: `<div class="frame page-shell">
      ${breadcrumbs(base, category)}
      <div class="listing-heading"><h1 class="slash-title">${escape(category.name)}</h1><p>${escape(category.intro)}</p></div>
      <section class="catalogue" aria-label="${escape(category.name)} catalogue">
        ${sectionTitle('All ' + (category.id === 'bestiary' ? 'creatures' : category.name.toLowerCase() + (category.id === 'guide' ? 's' : '')))}
        <div class="filter-bar" hidden data-filter-bar><div class="filter-options" aria-label="Filter entries">
        ${['All', ...category.filters].map((type,i) => `<button type="button" data-filter="${escape(type)}" aria-pressed="${i === 0}">${escape(type)}</button>`).join('')}
        </div><span class="filter-count" role="status" data-filter-count></span></div>
        <ul class="catalogue-list">${catalogue.map(entry => `<li data-entry-type="${escape(entry.type)}"><a href="${route(base, key(entry))}">
          <span><strong>${escape(entry.title)}</strong><span class="listing-summary">${escape(entry.summary)}</span></span><span class="type-label">${escape(entry.type)}</span></a></li>`).join('')}</ul>
      </section>
    </div>`
  });
}

function renderSection(section) {
  return `<section class="article-section" id="${slug(section.title)}">
    ${sectionTitle(section.title)}
    ${(section.paragraphs || []).map(text => `<p>${escape(text)}</p>`).join('')}
    ${section.bullets ? `<ul>${section.bullets.map(bullet => `<li>${escape(bullet)}</li>`).join('')}</ul>` : ''}
    ${section.materials ? `<table class="materials"><thead><tr><th scope="col">Material</th><th scope="col">Quantity</th></tr></thead><tbody>${section.materials.map(([material, count]) => `<tr><th scope="row">${escape(material)}</th><td>${escape(count)}</td></tr>`).join('')}</tbody></table>` : ''}
  </section>`;
}

function renderEntry(entry) {
  const category = categoryMap.get(entry.category);
  const base = '../../';
  const links = [...(entry.facts ? ['Overview'] : []), ...entry.sections.map(section => section.title)];
  const related = entry.related || [];
  return layout({
    base, current: category.id, title: entry.title, description: entry.summary,
    body: `<div class="frame page-shell article-shell">
      ${breadcrumbs(base, category, true)}
      <div class="article-grid">
        <article>
          <p class="article-kind">${escape(entry.type)}</p>
          <h1 class="slash-title">${escape(entry.title)}</h1>
          <p class="article-deck">${escape(entry.summary)}</p>
          <nav class="article-nav" aria-label="On this page">${links.map((title,i) => `<a href="#${slug(title)}"${i === 0 ? ' aria-current="location"' : ''}>${escape(title)}</a>`).join('')}</nav>
          ${entry.facts ? `<div id="overview" class="overview"><dl class="fact-table">${entry.facts.map(([label,value]) => `<div><dt>${escape(label)}</dt><dd>${escape(value)}</dd></div>`).join('')}</dl></div>` : ''}
          ${entry.sections.map(renderSection).join('')}
          ${related.length ? `<section class="article-section">${sectionTitle('Related entries')}${compactList(related, base)}</section>` : ''}
          ${anchor(base, category.id, 'Back to ' + category.name.toLowerCase(), 'text-link back-link')}
        </article>
        <aside class="article-aside" aria-label="More from ${escape(category.name)}"><h2>More in ${escape(category.name)}</h2>${compactList(entries.filter(item => item.category === entry.category && item.id !== entry.id).slice(0,3).map(key),base)}</aside>
      </div>
    </div>`
  });
}

function validateContent() {
  if (categoryMap.size !== categories.length || entryMap.size !== entries.length) throw new Error('Duplicate category or entry ID');
  for (const entry of entries) {
    const category = categoryMap.get(entry.category);
    if (!category?.filters.includes(entry.type) || !/^[a-z0-9-]+$/.test(entry.id)) throw new Error('Invalid entry: ' + key(entry));
    if (!entry.title || !entry.summary || !entry.sections?.length) throw new Error('Incomplete entry: ' + key(entry));
    const ids = ['overview', ...entry.sections.map(section => slug(section.title))];
    if (new Set(ids).size !== ids.length || ids.includes('')) throw new Error('Invalid section headings in ' + key(entry));
    for (const related of entry.related || []) if (!entryMap.has(related)) throw new Error('Unknown related entry: ' + related);
  }
}

async function write(routePath, html) {
  const directory = resolve(output, routePath);
  await mkdir(directory, { recursive: true });
  await writeFile(resolve(directory, 'index.html'), html);
}

validateContent();
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
await cp(resolve(root,'src/assets'), resolve(output,'assets'), { recursive: true });
await write('', renderHome());
for (const category of categories) await write(category.id, renderCategory(category));
for (const entry of entries) await write(key(entry), renderEntry(entry));
const searchRecords = entries.map(({ title, summary, category, type, id, sections }) => ({
  title, summary, category: categoryMap.get(category).name, type, path: category + '/' + id + '/',
  keywords: sections.flatMap(section => [section.title, ...(section.paragraphs || []), ...(section.bullets || []), ...(section.materials || []).flat()]).join(' ')
}));
await writeFile(resolve(output, 'assets/search-index.js'), 'window.wikiSearchIndex = ' + JSON.stringify(searchRecords) + ';\n');
await writeFile(resolve(output, '.nojekyll'), '');
await writeFile(resolve(output, '404.html'), layout({
  base: '/elbsao/', current: null, title: 'Page missing', description: 'This page could not be found.',
  body: '<div class="frame page-shell"><h1 class="slash-title">Page missing</h1><p>That page may have moved.</p><a class="text-link" href="/elbsao/">Return to the field guide</a></div>'
}));
console.log('Built ' + (entries.length + categories.length + 2) + ' pages into docs/.');
