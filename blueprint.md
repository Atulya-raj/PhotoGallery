# Lumora (Celebrare Frontend Internship — Project Blueprint)

> Feed this file to Antigravity to scaffold the full project.
> Assignment: Photo Gallery Web App in React

## 1. Tech Stack

| Layer | Tool | Notes |
|---|---|---|
| Framework | React 18 | Functional components + hooks only. Zero class components. |
| Bundler | Vite | Bootstrap with `npm create vite@latest` → select React |
| Styling | Tailwind CSS v3 | Only styling tool allowed. No UI libraries whatsoever. |
| API | Picsum Photos | `https://picsum.photos/v2/list?limit=30` — no API key needed |
| State | useReducer | For favourites. useState is NOT accepted for this feature. |
| Persistence | localStorage | Favourites must survive page refresh. |
| Language | JavaScript (ES6+) | TypeScript not required. |

**Banned:** MUI, Ant Design, Bootstrap, Chakra, Radix, Shadcn, or any other component library.

---

## 2. Project Structure

Scaffold exactly this structure — no more, no less:

```
lumora/
├── public/
├── src/
│   ├── hooks/
│   │   └── useFetchPhotos.js       ← custom hook for all fetch logic
│   ├── components/
│   │   ├── SearchBar.jsx           ← controlled search input
│   │   ├── Gallery.jsx             ← main grid, uses useFetchPhotos
│   │   └── PhotoCard.jsx           ← single photo card with heart button
│   ├── App.jsx                     ← root, holds useReducer + localStorage sync
│   ├── main.jsx
│   └── index.css                   ← Tailwind directives only
├── tailwind.config.js
├── vite.config.js
├── package.json
└── index.html
```

---

## 3. Setup Commands

Run in order:

```bash
npm create vite@latest lumora -- --template react
cd lumora
npm install
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
npm run dev
```

In `tailwind.config.js`, set content paths:

```js
content: ["./index.html", "./src/**/*.{js,jsx}"]
```

In `src/index.css`, replace everything with:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

---

## 4. API Details

**Endpoint:** `https://picsum.photos/v2/list?limit=30`

**Response shape per photo object:**

```json
{
  "id": "0",
  "author": "Alejandro Escamilla",
  "width": 5616,
  "height": 3744,
  "url": "https://unsplash.com/...",
  "download_url": "https://picsum.photos/id/0/5616/3744"
}
```

**Fields used in the app:**
- `id` — unique key, used for favourites tracking
- `author` — displayed on card, used for search filtering
- `download_url` — used as the `<img src>`. Append `/400/300` to resize: `https://picsum.photos/id/{id}/400/300`

---

## 5. Hook — `useFetchPhotos.js`

**Location:** `src/hooks/useFetchPhotos.js`

**Must return exactly:** `{ photos, loading, error }`

**Logic:**
- `photos` → array, initialised as `[]`
- `loading` → boolean, starts `true`, set to `false` after fetch settles
- `error` → string or null, set if fetch throws or response is not ok
- Fetch fires once on mount via `useEffect` with empty dependency array `[]`
- If fetch fails, set a human-readable error string and leave `photos` as `[]`
- The Gallery component calls this hook — it must NOT fetch data directly

```js
// src/hooks/useFetchPhotos.js
import { useState, useEffect } from "react";

export function useFetchPhotos() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("https://picsum.photos/v2/list?limit=30")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch photos.");
        return res.json();
      })
      .then((data) => setPhotos(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return { photos, loading, error };
}
```

---

## 6. State Architecture — `useReducer` for Favourites

**Location:** `App.jsx`

**State shape:**

```js
{ favourites: [] }   // array of photo id strings
```

**Actions:**

```js
{ type: "TOGGLE_FAVOURITE", payload: id }
```

**Reducer logic:**

```js
function reducer(state, action) {
  switch (action.type) {
    case "TOGGLE_FAVOURITE": {
      const exists = state.favourites.includes(action.payload);
      const updated = exists
        ? state.favourites.filter((id) => id !== action.payload)
        : [...state.favourites, action.payload];
      localStorage.setItem("favs", JSON.stringify(updated));
      return { ...state, favourites: updated };
    }
    default:
      return state;
  }
}
```

**Initialiser (read from localStorage on first load):**

```js
function init() {
  const stored = localStorage.getItem("favs");
  return { favourites: stored ? JSON.parse(stored) : [] };
}

// In App.jsx:
const [state, dispatch] = useReducer(reducer, undefined, init);
```

**Why useReducer and not useState:**
- Favourites state has a single, clearly defined action type with predictable transitions
- Reducer makes localStorage sync logic centralised — one place to handle it
- Scales cleanly if more actions are added later (e.g. CLEAR_ALL_FAVOURITES)

---

## 7. Performance Hooks — `useCallback` + `useMemo`

Both go in `Gallery.jsx` (or `App.jsx` if you pass filtered list down as prop).

### useCallback — search handler

```js
const [query, setQuery] = useState("");

const handleSearch = useCallback((e) => {
  setQuery(e.target.value);
}, []);
// Passed to SearchBar as the onChange prop.
// Stable reference — SearchBar won't re-render just because Gallery re-renders.
```

### useMemo — filtered photo list

```js
const filteredPhotos = useMemo(() => {
  return photos.filter((p) =>
    p.author.toLowerCase().includes(query.toLowerCase())
  );
}, [photos, query]);
// Re-computes only when photos array or query string changes.
// Without this, the filter runs on every single render.
```

**Video explanation you must give:**
- `useMemo` — "Without it, the filter re-runs on every render even when neither photos nor the search query changed. useMemo caches the result and only recalculates when the dependencies change."
- `useCallback` — "Without it, handleSearch is a brand-new function reference every render, which would cause SearchBar to re-render unnecessarily every time Gallery updates."

---

## 8. Components

### `App.jsx`

Responsibilities:
- Declare `useReducer` with `reducer`, `init`
- Pass `state.favourites` and `dispatch` down as props to Gallery
- Render `<SearchBar>` and `<Gallery>`

### `SearchBar.jsx`

Props: `onSearch` (the `useCallback`-wrapped handler)

```jsx
export function SearchBar({ onSearch }) {
  return (
    <input
      type="text"
      onChange={onSearch}
      placeholder="Search by author..."
      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  );
}
```

### `Gallery.jsx`

Responsibilities:
- Call `useFetchPhotos()` to get `{ photos, loading, error }`
- Maintain `query` state via `useState`
- Wrap search handler in `useCallback`
- Derive `filteredPhotos` via `useMemo`
- Render loading spinner, error message, or the photo grid

**Grid Tailwind classes:**

```
grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4
```

### `PhotoCard.jsx`

Props: `photo`, `isFavourited`, `onToggle`

Responsibilities:
- Render `<img>` using `https://picsum.photos/id/{photo.id}/400/300`
- Display `photo.author` below the image
- Render a heart icon button that calls `onToggle(photo.id)`
- Heart should visually change when `isFavourited` is true (e.g. filled red vs outline)

```jsx
export function PhotoCard({ photo, isFavourited, onToggle }) {
  return (
    <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm bg-white">
      <img
        src={`https://picsum.photos/id/${photo.id}/400/300`}
        alt={photo.author}
        className="w-full h-48 object-cover"
      />
      <div className="p-3 flex items-center justify-between">
        <span className="text-sm text-gray-700 font-medium truncate">{photo.author}</span>
        <button
          onClick={() => onToggle(photo.id)}
          className="text-xl focus:outline-none"
          aria-label={isFavourited ? "Remove from favourites" : "Add to favourites"}
        >
          {isFavourited ? "❤️" : "🤍"}
        </button>
      </div>
    </div>
  );
}
```

---

## 9. Loading & Error States

Both are mandatory. Implement in `Gallery.jsx`:

```jsx
if (loading) {
  return (
    <div className="flex justify-center items-center h-64">
      <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

if (error) {
  return (
    <div className="text-center text-red-500 py-10">
      <p>Something went wrong: {error}</p>
    </div>
  );
}
```

---

## 10. localStorage Contract

| Key | Value | When written |
|---|---|---|
| `"favs"` | JSON array of id strings e.g. `["0","12","44"]` | On every `TOGGLE_FAVOURITE` dispatch inside the reducer |

**Read on init:** Passed as the third argument to `useReducer` as an initialiser function — not in a `useEffect`.

---

## 11. Screen Recording Checklist (5 min)

Record yourself covering these 5 points in order:

1. **Show the app working** — photos load, search filters by author in real time, heart toggles, refresh page and confirm favourites persist.
2. **Open `useFetchPhotos.js`** — read the hook aloud, explain what it returns, explain what happens when the fetch fails.
3. **Open the reducer** — name the actions it handles, explain why `useReducer` was chosen over `useState`.
4. **Open `useCallback` + `useMemo`** — plain English: what problem does each solve? What would break without them?
5. **One hard thing** — pick one genuine challenge, explain the problem and how you solved it.

**Recording tools:** Windows → `Win + G` | Mac → QuickTime → New Screen Recording | Any OS → OBS Studio (free)
**Upload to:** Google Drive (share link) or YouTube (unlisted)

---

## 12. Submission Steps

1. Push code to a **public** GitHub repository
2. Upload recording to Google Drive or YouTube (unlisted)
3. Fill the Google Form with:
   - GitHub repo link
   - Recording link
   - One sentence: the hardest part of the assignment
4. Submit within 24 hours of receiving the PDF

---

## 13. Hard Rules Summary

| Rule | Status |
|---|---|
| React + Vite + Tailwind only | Required |
| No UI component libraries | Banned |
| Functional components only | Required |
| useReducer for favourites | Required — useState not accepted |
| useFetchPhotos custom hook | Required |
| useCallback on search handler | Required |
| useMemo for filtered list | Required |
| localStorage persistence | Required |
| Loading spinner | Required |
| Error message | Required |
| Screen recording (5 min) | Required — no recording = not reviewed |
| Extra features beyond the 7 | Do not add |
| AI tools | Allowed — but explain every line in the video |

---

*Blueprint based on Celebrare Frontend Intern Pre-Screening Assignment PDF. Follow strictly — do not deviate from the 7 requirements.*