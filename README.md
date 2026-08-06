# Palette Lab Website 🎨

Source for the [Palette Lab](https://palettelab-nus.github.io/) site. Content lives in YAML under `src/data/`; most updates can be done on GitHub in the browser (no local clone required).

## Updating the site

Step-by-step guides:

- **[Updating People](https://github.com/PaletteLab-NUS/palettelab-nus.github.io/wiki/Updating-People)** — headshots, roles, trajectory map
- **[Updating Publications](https://github.com/PaletteLab-NUS/palettelab-nus.github.io/wiki/Updating-Publications)** — papers, thumbnails, author links

Field-level schemas (reference):

- [`src/data/README.md`](src/data/README.md)

| Content | Data file | Assets |
| --- | --- | --- |
| People | [`src/data/people.yaml`](src/data/people.yaml) | [`src/assets/team/`](src/assets/team/) |
| Publications | [`src/data/publications.yaml`](src/data/publications.yaml) | [`src/assets/pub/`](src/assets/pub/) |
| News / memories | [`src/data/news.yaml`](src/data/news.yaml) | [`src/assets/events/`](src/assets/events/) |

### Quick rules

- **People:** set `category` to `labMember`, `friends`, or `professor`. Lab members should include `image`, colors, `interests`, and `trajectory` when possible.
- **Publications:** add new entries **at the top** of `publications.yaml`. Lab author strings must match a key (or `name`) in `people.yaml` to highlight and link.
- **Thumbnails / photos:** use a filename only (resolved under the asset folders above), or a full `https://` URL for publication thumbnails.
- **PRs only:** edit on GitHub → **Commit changes…** → **Create a new branch** → open a pull request. Don’t commit straight to `main`. Ask a lab mate to review and merge.

---

## Local development (maintainers)

Node.js 24+ required.

```bash
npm install
cp .env.example .env   # then set REACT_APP_MAPBOX_TOKEN for the People trajectory map
npm start              # preview at http://localhost:3000
```

The trajectory map needs a Mapbox **public** token (`pk.*`) in `.env`. Without it, the rest of the site still runs; the map shows a setup hint instead. Never commit `.env`.

## Deploy (GitHub Actions)

Deploys run automatically on push to `main` (workflow: `.github/workflows/deploy.yml`). Prefer this over `npm run deploy` so the token is not typed into a local publish step.

**One-time setup**

1. Create a Mapbox public token (`pk.*`) and restrict it by URL to `https://palettelab-nus.github.io` (and `http://localhost:3000` if you want local maps).
2. In the GitHub repo: **Settings → Secrets and variables → Actions → New repository secret**
   - Name: `REACT_APP_MAPBOX_TOKEN`
   - Value: the `pk.*` token
3. Confirm Pages is served from the `gh-pages` branch (**Settings → Pages**).
4. Push to `main`, or run **Actions → Deploy GitHub Pages → Run workflow**.

CRA inlines `REACT_APP_*` into the JS bundle at build time, so the public `pk.*` token will still appear in browser sources on `gh-pages`. That is expected for client-side Mapbox — protect it with URL restrictions, not by trying to hide it. Do not use a secret Mapbox token (`sk.*`) in the frontend.
