(() => {
  const dialog = document.querySelector('#wiki-search');
  const input = document.querySelector('#search-query');
  const results = document.querySelector('#search-results');
  const message = document.querySelector('#search-message');
  const base = document.documentElement.dataset.wikiRoot;
  const index = window.wikiSearchIndex;
  const quickEntries = ['bestiary/frenzy-boar/', 'items/boarfang-blade/', 'locations/stachion/', 'guide/death-and-revival/'];
  const normalize = value => value.normalize('NFKD').toLowerCase();
  const searchable = index.map(entry => ({
    ...entry, name: normalize(entry.title),
    all: normalize([entry.title, entry.category, entry.type, entry.summary, entry.keywords].join(' '))
  }));

  function showResults() {
    const query = normalize(input.value.trim());
    const terms = query.split(/\s+/);
    const matches = query ? searchable
      .filter(entry => terms.every(term => entry.all.includes(term)))
      .sort((first, second) => Number(second.name.includes(query)) - Number(first.name.includes(query)) || first.title.localeCompare(second.title))
      : quickEntries.map(path => searchable.find(entry => entry.path === path)).filter(Boolean);

    message.textContent = query
      ? matches.length ? `${matches.length} result${matches.length === 1 ? '' : 's'}${matches.length > 8 ? ' · first 8 shown' : ''}` : 'No entries found. Try a shorter term.'
      : 'Quick lookup';
    const rows = matches.slice(0, 8).map(entry => {
      const row = document.createElement('li');
      const link = document.createElement('a');
      const title = document.createElement('strong');
      const category = document.createElement('small');
      const summary = document.createElement('p');
      link.href = base + entry.path;
      title.textContent = entry.title;
      category.textContent = entry.category;
      summary.textContent = entry.summary;
      link.append(title, category, summary);
      row.append(link);
      return row;
    });
    results.replaceChildren(...rows);
  }

  function openSearch() {
    if (!dialog.open) dialog.showModal();
    showResults();
    input.focus();
    input.select();
  }

  for (const button of document.querySelectorAll('[data-open-search]')) button.addEventListener('click', openSearch);
  input.addEventListener('input', showResults);
  dialog.addEventListener('click', event => {
    if (event.target === dialog) dialog.close();
  });
  document.addEventListener('keydown', event => {
    const shortcut = (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k';
    if (shortcut) {
      event.preventDefault();
      openSearch();
    }
  });
  dialog.addEventListener('keydown', event => {
    const links = [...results.querySelectorAll('a')];
    const position = links.indexOf(document.activeElement);
    if (event.key === 'ArrowDown' && (event.target === input || position >= 0) && links.length) {
      event.preventDefault();
      links[Math.min(position + 1, links.length - 1)].focus();
    }
    if (event.key === 'ArrowUp' && position >= 0) {
      event.preventDefault();
      (links[position - 1] || input).focus();
    }
    if (event.key === 'Enter' && event.target === input && links.length) links[0].click();
  });

  const filterBar = document.querySelector('[data-filter-bar]');
  if (filterBar) {
    const buttons = [...filterBar.querySelectorAll('[data-filter]')];
    const entries = [...document.querySelectorAll('[data-entry-type]')];
    const count = filterBar.querySelector('[data-filter-count]');
    function selectFilter(selected) {
      let shown = 0;
      for (const button of buttons) button.setAttribute('aria-pressed', String(button === selected));
      for (const entry of entries) {
        entry.hidden = selected.dataset.filter !== 'All' && selected.dataset.filter !== entry.dataset.entryType;
        if (!entry.hidden) shown++;
      }
      count.textContent = `${shown} entr${shown === 1 ? 'y' : 'ies'}`;
    }
    for (const button of buttons) button.addEventListener('click', () => selectFilter(button));
    selectFilter(buttons[0]);
    filterBar.hidden = false;
  }

  const headingLinks = document.querySelectorAll('.article-nav a');
  if (headingLinks.length) {
    const markSection = () => {
      const selected = window.location.hash || headingLinks[0].hash;
      for (const link of headingLinks) {
        if (link.hash === selected) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      }
    };
    window.addEventListener('hashchange', markSection);
    markSection();
  }
})();
