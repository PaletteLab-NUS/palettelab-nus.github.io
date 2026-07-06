# Palette Lab Website 🎨

## Updating Publications

Edit [`src/data/publications.yaml`](https://github.com/PaletteLab-NUS/palettelab-nus.github.io/blob/main/src/data/publications.yaml) on GitHub — add new entries **at the top** of the file.

**Lab author names** must match [`src/data/people.yaml`](https://github.com/PaletteLab-NUS/palettelab-nus.github.io/blob/main/src/data/people.yaml) exactly (so they link and highlight correctly).

**Thumbnail:** use a full `http://` / `https://` image URL, or upload an image to `src/assets/pub/` on GitHub and reference the filename (e.g. `2099-chi-musebot.jpg`).

### Example

```yaml
- title: "MuseBot: Coaching Novice Painters Through Metaphorical Feedback Loops"
  authors:
    - "Brushwick P. Canvasworth"
    - "Palette O'Splatter"
    - "Huebert Tintington III"
    - "Glaze Butterfield von Easel"
  year: 2099
  thumbnail: "https://example.com/musebot-preview.jpg"
  venue: "Proceedings of the 2099 CHI Conference on Human Factors in Computing Systems"
  venue_short: "CHI 2099"
  location: "Imaginarium City, Fictionland"
  abstract: >
    We built a chatbot that critiques watercolors exclusively through pastry metaphors.
    In a study with 48 novice painters, MuseBot increased creative risk-taking but also
    unexpected cravings for croissants. We discuss implications for metaphor-driven
    creative support tools.
  website: "https://example.com/musebot"
  doi: "https://doi.org/10.1145/0000000.0000001"
  arxiv: "https://arxiv.org/abs/2099.00001"
  pdf: "https://example.com/musebot.pdf"
  video: "https://www.youtube.com/watch?v=musebot-example"
  demo: "https://example.com/musebot/demo"
  github: "https://github.com/example/musebot"
  award: "Best Paper Award"
  bibtex: |
    @inproceedings{canvasworth2099musebot,
      author = {Canvasworth, Brushwick P. and O'Splatter, Palette and Tintington, Huebert III and von Easel, Glaze Butterfield},
      title = {MuseBot: Coaching Novice Painters Through Metaphorical Feedback Loops},
      year = {2099},
      booktitle = {Proceedings of the 2099 CHI Conference on Human Factors in Computing Systems},
      publisher = {Association for Computing Machinery},
      doi = {10.1145/0000000.0000001},
      url = {https://doi.org/10.1145/0000000.0000001},
      location = {Imaginarium City, Fictionland}
    }
```

Only `title`, `authors`, `year`, `venue`, `venue_short`, and `thumbnail` are required. Other fields are optional.

### Submit your changes

1. Open `publications.yaml` on GitHub → click the **pencil icon** (Edit)
2. Paste your entry at the top, then click **Commit changes…**
3. Choose **Create a new branch** and start a **pull request** (don't commit directly to `main`)
4. Ask a lab mate to review and merge

No need to clone the repo locally.

---

## Local development (maintainers)

Node.js 24+ required.

```bash
npm install
npm run start   # preview at http://localhost:3000
npm run deploy  # publish to GitHub Pages
```
