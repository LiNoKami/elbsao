# Working on the Sword Art Offline wiki

- Start from the latest main. Use one branch and a pull request per issue when working with another contributor. Include the change, validation, and open questions in the pull request.
- Edit encyclopedia entries in content/entries/<category>/<id>.json. The filename is the URL slug. Keep it stable, write in short sentences, and link related entries by category/id. Source notes are public in GitHub and omitted from generated pages and the search index.
- Check the client version and distinguish live server observations from packaged client values in the relevant sentence. Keep damage, spawn rates, routes, and death rules tentative until verified on the server.
- Use src/ for CSS, browser behavior, and optimized original artwork. Avoid uploading client art, account data, raw game archives, or private screenshots.
- Run npm run build and npm run check before opening a PR. The GitHub Actions workflow builds the site and deploys changes on main. Generated dist/ files stay out of Git.
- Maintain keyboard access, mobile layout, high contrast, readable navigation, and the dark blue, cyan, ivory, and restrained gold theme.
