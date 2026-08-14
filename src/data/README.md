# Site data schemas

YAML in this folder is loaded at build time via `yaml-loader` (`config-overrides.js`) and imported by React pages. Edit these files to update the live site; keep filenames and field names as documented below.

| File | Consumed by |
| --- | --- |
| `people.yaml` | `People`, `TrajectoryMap`, `Publications` (author linking) |
| `news.yaml` | `News` / `NewsEntry` |
| `publications.yaml` | `Publications` / `PublicationEntry` |

Asset folders referenced by relative filenames:

- People photos → `src/assets/team/`
- News photos → `src/assets/events/`
- Publication thumbnails → `src/assets/pub/`

---

## `people.yaml`

Top-level **map** keyed by a stable person id (usually the canonical full name). The key is used as `id` when `id` is omitted, and must match author strings in `publications.yaml` for lab-member highlighting.

```yaml
"Jane L. E":
  name: "Jane L. E"
  description: "Lab Director"
  website: "https://ejane.me/"
  category: "professor"          # required — see categories below
  image: "janee_purple-480.webp" # filename in src/assets/team/
  color: "#7978d6"               # card back / trajectory line
  textColor: "#eeeeee"           # interest text; may be a CSS gradient
  interests:                     # flip-card back (not used for friends)
    - "Creativity Support"
  bio: |                         # optional HTML; reserved for focus panel
    <p>...</p>
  trajectory:                    # optional; drives the map
    - label: "Princeton"
      loc: "40°20'35.0\"N 74°39'18.0\"W"
      note: "Hometown, B.S. @Princeton"
```

### Fields

| Field | Required | Type | Notes |
| --- | --- | --- | --- |
| *(map key)* | yes | string | Stable id; defaults as `id` if `id` is absent |
| `id` | no | string \| number | Overrides map key; used for React keys / map focus |
| `name` | no | string | Display name; falls back to map key |
| `description` | no | string | Role line under the name (e.g. `PhD`, `intern • UW undergrad`) |
| `website` | no | url | Card link target |
| `category` | **yes** | enum | Entries without `category` are dropped |
| `image` | yes\* | string | Filename under `src/assets/team/` (\*missing → console warn) |
| `color` | no | CSS color | Default `#7978D6`. Near-black may fall back to `textColor` on the map |
| `textColor` | no | CSS color or `linear-gradient(...)` | Default `#FFFFFF`. Gradients use background-clip text |
| `interests` | no | string[] | Flip-card back for `professor` / `labMember`. Empty strings still render as blank rows — omit them |
| `bio` | no | HTML string | Loaded into the People page; currently not shown (`display: none`) |
| `hiringNote` | no | string | Parsed but not rendered yet |
| `trajectory` | no | stop[] | See below. Omit for friends / people without map stops |

### `category` values

| Value | UI |
| --- | --- |
| `professor` | Hero focus card + trajectory map |
| `labMember` | “Lab Members” grid (flip cards) + map |
| `friends` | “Friends of the Lab” grid (simple link cards, no flip / no trajectory expected) |
| `future` | Not listed on People; still treated as a lab author on Publications |

### `trajectory[]` stops

Used by `TrajectoryMap`. Include **cities you stayed in for more than one year** (same rule as the map caption). Life-stage pie slices are **inferred from `note` text** (and fall back to `description` / `category`).

Location sharing is optional. Omit any stop you do not want public, or use the privacy placeholder below instead of a real city.

| Field | Required | Type | Notes |
| --- | --- | --- | --- |
| `label` | yes | string | City / place name shown on the map |
| `loc` | yes\* | DMS string | Format: `1°17'41.0"N 103°46'31.4"E` (N/S then E/W). Invalid → stop skipped. \*May be omitted when `label` is the privacy placeholder |
| `note` | yes\* | string | Personal detail in popups; keywords drive stages (\*empty → role fallback) |

**Privacy placeholder** (maps to the gray South Pacific node; not a city pie):

```yaml
    - label: "Location Privacy Retained"
      loc: "14°00'00.0\"S 162°00'00.0\"W"
      note: "Omitted"
```

Use that exact `label` (from `PRIVACY_NODE` in `TrajectoryMap.js`). `loc` is filled in if you leave it out.

Keywords recognized in `note` (case-insensitive; multi-label OK):

| Stage | Example phrases in `note` |
| --- | --- |
| Growing up | hometown, grew up, childhood, born, formative years, high school |
| Bachelor | B.S., B.E., B.A., bachelor, undergrad |
| Master / Work | M.S., M.A., master's, MBA; also researcher / engineer / full-time (non-intern) |
| Ph.D.+ | Ph.D., doctorate, postdoc, professor, faculty |
| Intern | intern, internship |

Singapore hub popups also order people by lab role inferred from notes (`PI`, `postdoc`, `Ph.D.`, `intern` / visiting, etc.).

---

## `news.yaml`

Top-level **list** of memory entries. Sorted newest-first by `date`.

```yaml
- date: "2026-07-24"             # YYYY-MM-DD
  about: >
    Short description of what happened.
  photos:
    - path: "2026-lab-final.JPG" # filename in src/assets/events/
      caption: "Optional caption"
  video:
    - "https://www.youtube.com/watch?v=..."
  link:
    - label: "NUS News"
      url: "https://..."
```

### Fields

| Field | Required | Type | Notes |
| --- | --- | --- | --- |
| `date` | yes | `YYYY-MM-DD` | Sort key; shown as e.g. `Jul 24, 2026` |
| `about` | yes | string | Body copy (`>` / `|` folded blocks are fine) |
| `photos` | no | photo[] \| string[] | Prefer objects; a bare filename string is also accepted |
| `photo` | no | same as `photos` | Alias — either key works |
| `video` | no | url[] | YouTube watch / short / embed URLs preferred |
| `link` | no | `{ label, url }[]` | Action buttons under the entry |

### Photo item

| Field | Required | Type | Notes |
| --- | --- | --- | --- |
| `path` | one of path/url | string | Local file in `src/assets/events/` |
| `url` | one of path/url | string | Remote image URL (skips local resolve) |
| `caption` | no | string | Used in lightbox / a11y label |

---

## `publications.yaml`

Top-level **list** of papers. Grouped and sorted by `year` (descending).

```yaml
- title: "Paper title"
  authors:
    - "Mingyi Li"                # must match a people.yaml key for lab styling
    - "External Author"
  year: 2026
  venue: "Proceedings of the 2026 CHI Conference..."
  venue_short: "CHI 2026"
  location: "Barcelona, Spain"
  abstract: >
    Optional abstract shown under “Show Details”.
  award: "Best Paper"            # optional badge
  arxiv: "https://arxiv.org/abs/..."
  doi: "https://doi.org/..."
  website: "https://..."
  pdf: "https://..."
  video: "https://..."
  demo: "https://..."
  github: "https://github.com/..."
  thumbnail: "2026-chi-vizcrit.jpg"  # file in src/assets/pub/ or https URL
  bibtex: |
    @inproceedings{...}
```

### Fields

| Field | Required | Type | Notes |
| --- | --- | --- | --- |
| `title` | yes | string | Heading |
| `authors` | yes | string[] | Displayed as-is; lab members bold/linked when the string equals a `people.yaml` key or `name` |
| `year` | yes | number | Section heading / sort |
| `venue` | no | string | Full venue; if it starts with `Proceedings`, UI prefixes `In ` |
| `venue_short` | no | string | Small label above the title |
| `location` | no | string | Appended to venue line as `venue \| location` |
| `abstract` | no | string | Expandable details |
| `award` | no | string | Badge above actions |
| `bibtex` | no | string | Expandable `<pre>` block |
| `thumbnail` | no | string | Local basename under `src/assets/pub/`, or full `http(s)` URL |
| `website` | no | url | Action: Website |
| `doi` | no | url | Action: DOI |
| `arxiv` | no | url | Action: arXiv |
| `pdf` | no | url | Action: PDF |
| `video` | no | url | Action: Video |
| `demo` | no | url | Action: Demo |
| `github` | no | url | Action: Code |

Lab styling applies when the matched person has `category` in `{ professor, labMember, future }`. Friends and unknown names render as external authors.

---

## Cross-file conventions

1. **Publication authors ↔ people keys** — Prefer the exact `people.yaml` map key (e.g. `"Jane L. E"`, `"Mingyi Li"`). Display `name` also indexes, but the key is the reliable match.
2. **Image filenames only** — Do not put folder prefixes in YAML; each page resolves under its asset directory.
3. **Map coordinates** — Stick to the DMS pattern with `"` (or `″`) and hemisphere letters; decimal lat/lng is not parsed today.
4. **Ordering** — People order follows YAML object order in practice (numeric `id` sort is a no-op for string keys). News and publications sort by date/year in the UI.
