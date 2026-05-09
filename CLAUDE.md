# Alchemy of Things - Codebase Guide

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
- `index.html` - Main gallery page
- `js/main.js` - All frontend logic (gallery, lightbox, ratings)
- `css/style.css` - All styles

### Admin
- `admin/index.html` - **SINGLE FILE** containing all admin HTML + JS (~1400 lines)
  - Lines 1-230: HTML structure (login, setup, admin panels)
  - Lines 231-270: `init()`, `show()`, `hashPass()`
  - Lines 280-400: Auth functions (`doLogin`, `setupBiometric`, `forgotPassword`)
  - Lines 470-505: `showTab()`, `buildTabs()`
  - Lines 509-670: Category/collection management
  - Lines 705-870: Work upload (`saveWork`, `uploadImg`, `optimizeImage`)
  - Lines 870-1050: Image processing (WebP conversion at 85% quality)
  - Lines 1100-1200: Categories CRUD
  - Lines 1200+: Ratings admin, drag/drop, init

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
└── package.json          # Dependencies (@netlify/blobs)
```

## Key Patterns

### Image Paths
All images use `.webp` format. Paths stored as `/images/{category}/{timestamp}.webp`

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

## Common Issues & Fixes

### Images not loading
Check ALL JSON files have `.webp` paths:
```bash
grep -r "\.jpeg\|\.jpg" data/ --include="*.json"
```

### Admin buttons not working
JavaScript syntax error - validate with:
```bash
sed -n '/<script>/,/<\/script>/p' admin/index.html | tail -n +2 | head -n -1 > /tmp/test.js && node --check /tmp/test.js
```

### Collection save/load mismatch
`saveCollectionsFile()` must match `loadCategoryCollections()` file selection logic

## Build & Deploy
- `netlify.toml` - Build config, headers, function settings
- `scripts/build.js` - Build script (minimal)
- `scripts/convert-to-webp.js` - Image conversion utility
- Deploy: Push to main triggers Netlify build

## Testing Locally
No local server needed for frontend (static files). Admin requires:
1. GitHub token with repo scope
2. CORS handled by GitHub API

## Branch Convention
Feature branches: `claude/description-{sessionId}`
