# Alchemy of Things - Codebase Guide

> **IMPORTANT**: Always read this file first. Update this file whenever you modify the codebase structure, add features, or fix patterns. Keep line numbers current.

## Quick Validation Commands
```bash
# Check admin JS syntax
sed -n '/<script>/,/<\/script>/p' admin/index.html | tail -n +2 | head -n -1 > /tmp/t.js && node --check /tmp/t.js

# Check for stale .jpeg references
grep -r "\.jpeg\|\.jpg" data/ --include="*.json"

# Verify WebP files exist
ls images/**/*.webp | wc -l  # Should match JSON image count
```

## Project Overview
Minimalist art gallery for paintings and photography. Static site hosted on Netlify with GitHub-based CMS.

## Architecture
```
Frontend: Static HTML/CSS/JS served by Netlify
Admin: Browser-based, uses GitHub API directly (no backend)
Storage: GitHub repo for content, Netlify Blobs for ratings
Images: WebP format, stored in /images/
```

## Critical Files

### Frontend
- `index.html` - Landing + hub (hub nav = categories.json + Thoughts + About)
- `thoughts.html` - Index of thought experiments, rendered from `data/thoughts.json`.
  Numbering is positional: entries sort by `order`, then count from one.
- `thoughts/entry.html` - Generic reader for entries written in the admin
  (`?id=<entry-id>`). Renders title + text in the reading layout.
- `js/thoughts.js` - Loader and renderer: `loadThoughts()`, `thoughtHref()`,
  `thoughtBody()`, `renderBlocks()`, `renderThought()`.

An entry is either **short** (a `text` field) or **structured** (a `sections`
array). A structured entry carries title, standfirst, edition, note, sections,
closing, closeLine, email, pdf, colophon; each section has part, numeral,
heading, id, lede, body. `renderThought()` produces the same markup the reading
CSS and the print styles already expect, and derives the contents from the
sections. An entry may still carry `link` to point at a hand-built page.

The note and the contents open the page folded shut — `<details class="thoughts-fold">`,
a centred italic name on the hairline, no marker — so a reader meets the piece first.
Print opens both and drops the names, so the PDF is unchanged; `build-pdf.js` sets
`details.open` before rendering as well.

Section bodies use a small set of marks, blank line between blocks:

```
### text      a subheading
> line        a set-apart line; consecutive ones form one block
1. item       a numbered procedure
: term        a table entry — term, a definition line, then "Label — value" lines
anything else a paragraph
```
Inline: `*emphasis*` and `[text](#section-id)`. Anchors are slugs of the heading,
generated on save.
- `about.html` - About + portfolio modal
- `js/main.js` - All frontend logic (gallery, lightbox, ratings)
- `css/style.css` - All styles (`.thoughts*` block = long-form reading)

### Admin
- `admin/index.html` - **SINGLE FILE** containing all admin HTML + JS (~1440 lines)
  - Lines 1-215: HTML structure (login, setup, admin panels, forms)
  - Lines 254-312: Logging (`noteError`, `updateLogDisplay`, `addLog`, `copyLogs`, `clearLogs`)
  - Lines 237-270: `init()`, `show()`, `hashPass()`
  - Lines 281-405: Auth (`setupBiometric`, `loginWithBiometric`, `doLogin`, `forgotPassword`)
  - Lines 406-470: Config (`doLogout`, `migrateConfig`, `saveConfig`, `resetConfig`)
  - Lines 471-505: `showTab()`, `buildTabs()`
  - Lines 509-695: Category content & collections (`showCategoryContent`, `loadCategoryCollections`, `saveCollectionsFile`, `editCollection`)
  - Lines 707-870: Work management (`isUnfinishedCollection`, `previewWork`, `saveWorkDynamic`)
  - Lines 875-1005: Work loading & rendering (`loadCategoryWorks`, `renderWorkItem`, `updateWorkCollection`)
  - Lines 1038-1075: Image optimization (`preview`, `optimizeImage` - WebP at 85%)
  - Lines 1078-1145: App icons (`previewAppIcon`, `generateIcon`, `saveAppIcons`)
  - Lines 1147-1215: GitHub API (`gh`, `getFile`, `saveFile`, `uploadImg`)
  - Lines 1219-1240: Init (`loadAll`, `loadRatingsAdmin`)
  - Lines 1288+: Settings, categories CRUD, drag/drop

### Data Files
```
data/
├── categories.json        # Top-level categories (paintings, photography)
├── works.json            # Paintings metadata (main file)
├── photography.json      # Photography metadata (currently empty)
├── collections.json      # Paintings collections (legacy, still used)
├── observations.json     # Photography collections
├── paintings-collections.json  # Paintings collections (new format)
├── content.json          # Site text content, landing image
├── settings.json         # Site settings
├── paintings/*.json      # Individual painting files
└── photography/*.json    # Individual photography files
```

### Images
```
images/
├── landing.webp          # Hero image
├── paintings/*.webp      # Painting images (17 files)
└── photography/*.webp    # Photography images (3 files)
```

### Netlify Functions
```
netlify/functions/
├── ratings.js            # Rating API (GET/POST)
├── visit.js              # Visit log + per-country totals
└── package.json          # Dependencies (@netlify/blobs)
```
Both use the legacy `exports.handler` signature. With that signature Netlify does
**not** configure Blobs automatically: it passes the context on `event.blobs`, and
`connectLambda(event)` must be called before `getStore()`. Skip it and `getStore()`
throws, which reads as "storage unavailable" no matter what credentials are set.
Geography comes from the `x-nf-geo` header (base64 JSON), not `x-country`.

### Thoughts
The admin edits structured entries: Front matter, a repeatable Sections panel
(part, number, heading, subtitle, body) and Ending. `readSections()` reads the
fields back before any re-render, so nothing typed is lost when a section is
added, moved or removed.

`thoughts` is a text category, so the admin manages it like Words: entries are
written to `data/thoughts/<id>.json` and the admin keeps `data/thoughts.json` in
step via `updateWorksAggregate()`. An entry with a `link` field opens that page
instead of the generic reader — that is how the long-form pieces are attached.
The admin form does not manage `link` or `order`, so `saveWorkDynamic()` spreads
the existing work when editing to avoid dropping them.

## Key Patterns

### Image Paths
All images use `.webp` format. Paths stored as `/images/{category}/{timestamp}.webp`

### Scrolling on a phone
The document scrolls; nothing pins it shut. It used to: `body{overflow-y:hidden}`
with the scrolling done by an inner `.main` sized `calc(100vh - 105px)`. On a phone
`100vh` is the **large** viewport — the height the page would have with the address
bar hidden — and the bar only retracts when the document itself scrolls. So the box
was always ~120px taller than the window, its content fitted inside it, and the
overflow sat under the fixed footer, unreachable. The paintings page would not move
at all.

So on mobile: `body{overflow-y:visible}`, `.main` takes `min-height:calc(100dvh - 105px)`
(with a `100vh` fallback first) and no fixed height. Use `dvh` for any full-viewport
height, never a bare `vh`. Anything laid over the page — the two lightboxes, the
portfolio modal — calls `lockScroll(true)` (`body.locked{overflow:hidden}`) so the
page holds still behind it, and `lockScroll(false)` on close.

### Admin Authentication
- Password hash stored in `localStorage.alchemy_cfg`
- Session auth in `sessionStorage.alchemy_auth`
- WebAuthn/FaceID supported via `credentialId`

### GitHub API Usage
All admin operations use `gh()` function (line ~1145):
```javascript
gh(path, method, body) // Calls api.github.com/repos/{repo}{path}
```

### Collection Loading Logic
1. Try `data/{category}-collections.json`
2. Fallback to legacy names (`collections.json` for paintings, `observations.json` for photography)

### Unfinished Works
- Detected by `collectionId === 'unfinished'` OR `w.unfinished === true`
- Display with 90% grayscale filter
- No ratings shown

## Visits
One tab covers views and appreciations together. `netlify/functions/visit.js`
keeps two blobs: `log` (the last 100 views) and `totals` (all-time counts —
countries, ISO codes, cities, days, paths, devices). Totals are counts only and
outlive the log. **No address is stored**: geography comes from the `x-nf-geo`
header and nothing else identifying is kept. `nav.js` sends `pathname + search`,
so a work page is distinguishable and can be joined to its appreciations by id.

### People vs machines
`botLabel()` classifies the user agent. A match (crawler, unfurler, monitor,
headless browser, empty agent) is counted in `botCount` / `agents` and kept out
of `count`, `countries`, `cities`, `paths` and `days` — so the figures are people.
Repeated hits from a datacentre city such as Ashburn are almost always these.

### Visitor safety
The functions are public, so nothing arriving from a visitor is trusted:
- `safePath` / `safeText` / `safePlace` reduce paths, referers and place names to
  a safe charset and cap their length — the geo header can be forged by a direct
  caller, so it is sanitised too.
- `bump()` caps distinct keys per bucket, so a flood cannot grow the record.
- `ratings.js` validates `workId` against a pattern before using it as a blob
  key, and requires an integer rating of 1–100.
- Both functions answer only the site's own origin.
- The admin renders visit data through `esc()`. **Never interpolate a visit field
  into innerHTML raw** — `path` is attacker-controlled and reached the admin
  unescaped once already.
- `netlify.toml` sets CSP, Referrer-Policy, Permissions-Policy and HSTS; the
  admin gets a separate CSP that allows `api.github.com` and is `noindex`.

The admin opens on Visits and plots one small **uniform** dot per place on
`admin/world.svg`. Dots rather than tinted countries: at 110m resolution the
Netherlands is a few pixels and Singapore is not drawn at all, so filling a
country cannot show a small one as visited. Uniform rather than sized by count:
the list carries the numbers, and a growing dot smothers its neighbours.

A dot is **filled** when the region's own point is known and **hollow** when it
falls back to a country centroid from `admin/countries.json` (built by
`scripts/build-map.js`, which also maps ~1000 country-name aliases to ISO codes
so records made before points were captured can still be placed). A country
counted with no region record at all still gets a dot. Every counted country
must appear: if the dot count and the Where list disagree, that is the bug. `totals.regions` is keyed
`Country|Region` and carries a point rounded to half a degree (≈55km) — enough
to place a region, never a person. The SVG carries `data-lat-top` /
`data-lat-bottom` so the projection is not duplicated in the admin.

The map zooms by moving the viewBox — no library. Dot radii and the border
stroke are counter-scaled so they keep their size on screen; only the ratio
between dots carries meaning. One finger scrolls the page (`touch-action:pan-y`),
two fingers pinch and pan; wheel and drag on a desktop. A "whole world" link
appears once zoomed.

Rebuild that basemap only if it changes:
```bash
npm i --no-save world-atlas@2 world-countries topojson-client
node scripts/build-map.js
```

## Checking status
The admin posts a health report to `diagnostics/latest.json` in this repo — on
open, after errors, and on demand from the Logs tab. Read it rather than asking
for a screenshot:

```bash
git fetch origin main && git show origin/main:diagnostics/latest.json
```
It carries the admin version (stale cache shows up here), which Netlify
functions answer and how, whether the deployed data files parse, and the last 40
log lines. Netlify 404s `/diagnostics/*`, so it is not public.

Two streams, not one: `errorCount`/`errors` are things that actually went wrong
(`console.error`, `window.onerror`, rejected promises); `logCount`/`log` are
everything that happened, activity included. Read `errorCount` — it was once the
length of the whole log, so an ordinary session reported errors it never had.
The red badge on the Logs tab counts faults for the same reason.

## Common Issues & Fixes

### Images not loading
Check ALL JSON files have `.webp` paths:
```bash
grep -r "\.jpeg\|\.jpg" data/ --include="*.json"
```

Check if images are actually WebP (not PNG saved as .webp):
```bash
head -c 4 images/paintings/*.webp | od -c  # Should show "RIFF" not "PNG"
```

If PNG saved as WebP, convert with:
```bash
node -e "require('sharp')('file.webp').webp({quality:85}).toFile('out.webp')"
```

### Admin buttons not working
JavaScript syntax error - validate with:
```bash
sed -n '/<script>/,/<\/script>/p' admin/index.html | tail -n +2 | head -n -1 > /tmp/test.js && node --check /tmp/test.js
```

### Collection save/load mismatch
`saveCollectionsFile()` must match `loadCategoryCollections()` file selection logic

## The Thoughts PDF
The entry data is the source of truth; `scripts/build-pdf.js` renders
`thoughts/entry.html?id=alchemy-of-things`. Regenerate after editing the entry:
```bash
node scripts/build-pdf.js   # -> documents/alchemy-of-things.pdf
```
Fonts must be fetched as static **TTF** (bare `Mozilla/5.0` user agent against the
v1 Google Fonts API). Chromium's print pipeline silently drops woff2 web fonts and
falls back to DejaVu, so the PDF would lose Jost entirely. Print styles live in the
`@media print` block at the end of `css/style.css`.

## Build & Deploy
- `netlify.toml` - Build config, headers, function settings
- `scripts/build.js` - Build script (minimal)
- `scripts/convert-to-webp.js` - Image conversion utility
- Deploy: Push to main triggers Netlify build

## Testing Locally
No local server needed for frontend (static files). Admin requires:
1. GitHub token with repo scope
2. CORS handled by GitHub API

## Design Skill
`.claude/skills/restraint/SKILL.md` — the house design system (the fractal, tokens,
language rules, layout patterns, ship checklist). Invoke with `/restraint` before any
UI, copy, or visual change, and before adding a page or navigation level. Source
philosophy: `PHILOSOPHY.md`.

**The site is fractal and must stay that way.** symbol → hub → section →
collection/index → the thing, and the same shape again inside a long document
(parts → sections → entries). Every level is a name, a list of names, nothing else;
you ascend by the name of the level you are in. Reuse a level's existing form rather
than inventing a new one. See §2 of the skill.

## Branch Convention
Feature branches: `claude/description-{sessionId}`
