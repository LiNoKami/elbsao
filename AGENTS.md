# Working on the Sword Art Offline wiki

- Start from the latest main. Use one branch and a pull request per issue when working with another contributor. Include the change, validation, and open questions in the pull request.
- Edit encyclopedia entries in content/wiki.json. Keep IDs stable, write in short sentences, and link related entries by category/id. Add concise source paths to each entry. These notes are for editing and are omitted from the generated site and search index.
- Check the client version and distinguish live server observations from packaged client values in the relevant sentence. Keep damage, spawn rates, routes, and death rules tentative until verified on the server.
- Use src/ for CSS, browser behavior, and optimized original artwork. Avoid uploading client art, account data, raw game archives, or private screenshots.
- Build and run npm run check before opening a PR. Commit the refreshed docs/ alongside source changes. GitHub Pages reads main /docs.
- Maintain keyboard access, mobile layout, high contrast, readable navigation, and the dark blue, cyan, ivory, and restrained gold theme.
