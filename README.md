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
npm run deploy         # publish to GitHub Pages
```

The trajectory map needs a Mapbox public token (`pk.*`) in `.env`. Without it, the rest of the site still runs; the map shows a setup hint instead.
