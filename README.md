# Egypro IT Inventory — Developer Guide

A lightweight, self-contained web app for tracking IT hardware.
No frameworks, no build step — just open `index.html` in a browser.

---

## Project structure

```
egypro-inventory/
├── index.html          ← Entry point (open this)
├── css/
│   └── style.css       ← All styling & theme tokens
└── js/
    ├── data.js         ← Inventory data + CRUD methods
    ├── export.js       ← CSV / JSON / TXT / PNG / Print
    └── app.js          ← UI logic, modals, navigation
```

---

## How to run

Just double-click `index.html` — no server needed.

For a real deployment, drop the whole folder on any static web host
(Netlify, GitHub Pages, Azure Static Web Apps, etc.) and point the
domain at `index.html`.

---

## Customisation

### 1. Change colours / theme
Open `css/style.css` and edit the `:root` block (light mode) or
`[data-theme="dark"]` block (dark mode).

Key tokens:
```css
--accent:       #2563EB   /* Primary blue — buttons, active states */
--bg-sidebar:   #FFFFFF   /* Sidebar background */
--bg-card:      #FFFFFF   /* Card / table background */
--text-primary: #111827   /* Main text colour */
```

### 2. Pre-load your own assets
Open `js/data.js` and edit the `DEFAULT_ASSETS` array.
Each item follows this shape:
```js
{
  id:           1,
  cat:          'Desktop',         // Desktop | Laptop | Server | Printer | Network
  user:         'Reception',       // who it's assigned to
  code:         'EGPROD01',        // asset tag / new convention
  hostname:     'ESYPROD01',       // computer name
  manufacturer: 'DELL',
  model:        'OptiPlex 7040',
  cpu:          3.4,               // GHz (0 = N/A)
  ram:          16,                // GB  (0 = N/A)
  hdd:          500,               // GB  (0 = N/A)
  serial:       '72TXVB2',
  os:           'MS WIN 11 Pro',
  office:       'Microsoft 365',
  av:           'Norton 360',
  status:       'OK',              // OK | Needs attention | Decommissioned
  collected:    'Everlyn Kariuki',
  vendor:       'Leverage',
  notes:        '',
}
```

### 3. Change profile details
In `js/data.js`, edit `PROFILE_DEFAULT`:
```js
const PROFILE_DEFAULT = {
  name:     'Gabby Kariuki',
  initials: 'GK',
  role:     'IT Attaché',
  org:      'Egypro Communications',
  email:    'g.kariuki@egypro.co.ke',
  ...
};
```

### 4. Add a new category
In `js/app.js`, add to the `CATS` array at the top:
```js
{ id:'CCTV', label:'CCTV', icon:'📷' },
```

### 5. Add extra columns
In `js/app.js` in `rowHTML()`, add a new `<td>`.
In `css/style.css` no changes needed — table scrolls horizontally.

---

## Data persistence
All data is saved to `localStorage` in the browser.
Data persists across page refreshes. "Reset to sample data" in
Settings wipes localStorage and reloads the defaults.

> For a real production system, replace `store.saveAssets()` and
> `store.loadAssets()` in `js/data.js` with `fetch()` calls to
> your backend API — the rest of the app won't need to change.

---

## Export formats
| Format | What you get |
|--------|-------------|
| CSV    | Opens in Excel / Google Sheets |
| JSON   | Machine-readable backup |
| TXT    | Tab-separated plain text |
| PNG    | Screenshot of the table |
| Print  | Print-optimised HTML report |

---

## Connecting to a real database (future step)
When your boss provides the database:

1. Replace `js/data.js` with API calls:
```js
async function loadAssets() {
  const res = await fetch('/api/assets');
  return res.json();
}
async function saveAsset(data) {
  await fetch('/api/assets', { method:'POST', body: JSON.stringify(data) });
}
```
2. The rest of the UI code in `app.js` works unchanged.

Recommended stack:
- **Backend**: Node.js + Express  or  Python + FastAPI
- **Database**: PostgreSQL (column names match the asset fields above)
- **Hosting**: Railway, Render, or Azure App Service
