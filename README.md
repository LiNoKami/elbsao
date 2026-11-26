# Sword Art Offline Wiki

A small static player wiki with four linked directories, quick search, and survival guides. Local research for the first entries came from the installed 0.3.6 client. Pages indicate where beta-server behavior still needs confirmation.

## Run locally

Use Node.js 22 or later. Run:

    npm run build
    npm run check
    npm run dev

Open the URL printed by the server. The development server uses the same /elbsao/ prefix as GitHub Pages.

## Edit the wiki

- content/wiki.json holds the categories, entries, source notes, recipe rows, and related-entry IDs.
- src/assets/ holds the styles and browser behavior.
- scripts/build.mjs renders the pages and search index into docs/.
- docs/ is generated. Commit the rebuilt output after editing source.

Read AGENTS.md for contribution and handoff guidance. A typical entry has a category, stable ID, title, type, summary, one or more headed sections, and optional facts and links. The build checks types and relationships. The check script verifies every static internal link and anchor against the Pages project prefix.

## Publish

In Settings → Pages, choose Deploy from a branch, then main and /docs. GitHub will publish when the main branch is updated.
