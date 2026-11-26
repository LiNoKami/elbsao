# Sword Art Offline Wiki

A small static player wiki with four linked directories, quick search, and survival guides. Local research for the first entries came from the installed 0.3.6 client. Pages indicate where beta-server behavior still needs confirmation.

## Run locally

Use Node.js 22 or later. Run:

    npm run build
    npm run check
    npm run dev

Open the URL printed by the server. The development server uses the same /elbsao/ prefix as GitHub Pages.

## Edit the wiki

Open an article and choose **Edit this page**. To create one, use **New entry** on the appropriate directory. These links open [Pages CMS](https://app.pagescms.org/LiNoKami/elbsao/main). The repository owner installs the Pages CMS GitHub App once for this repository. GitHub collaborators with write access can then use their own GitHub sign-in.

- Each article lives at content/entries/<category>/<slug>.json. The filename controls its public URL. An article has a title, type, summary, and one or more headed sections. Optional fields include related articles, source notes, and an image.
- Use the Wiki images library for article images. Uploaded files go into src/assets/wiki/. Add a short description for screen-reader users when the image conveys information.
- .pages.yml defines editor fields. content/categories.json defines website directories and filters. If you add an entry type, update both.
- src/assets/ holds styles and browser behavior. The build renders static pages and the search index into dist/.

Source notes live in the public repository. Read AGENTS.md for contribution and handoff guidance. The build checks types and relationships, and the check script verifies internal links, anchors, and editor links.

## Publish

In Settings → Pages, set Source to **GitHub Actions**. The **Build and publish wiki** workflow checks pull requests and deploys changes on main to [the live wiki](https://linokami.github.io/elbsao/). To retry a deployment, run the workflow manually against main.
