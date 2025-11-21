Woloo After School Hub - Frontend

Static Vue 3 (CDN) frontend using Bootstrap 5 and Font Awesome.

Run locally
Open `index.html` in a browser via a local server (e.g., VS Code Live Server). Set API base URL in dev via console:

```js
localStorage.setItem('API_BASE', 'http://localhost:3000')
```

Build/Deploy (GitHub Pages)
- Push this folder as a repo `woloo-frontend` under your GitHub account `justnnamdi01`.
- Enable GitHub Pages (Settings → Pages) from `main` branch root.
- The app will be available at: `https://justnnamdi01.github.io/woloo-frontend/`.
- In browser console, set:

```js
localStorage.setItem('API_BASE', 'https://<your-aws-eb-domain>')
```

Features mapping to requirements
- Vue 3 via CDN; v-for listing; v-on handlers; computed and validation.
- Sorting by subject/location/price/spaces asc/desc.
- Add to cart with availability decrement and disable at 0.
- Cart toggle, remove restores spaces, checkout with regex validation.
- Fetch GET `/lessons`, POST `/orders`, PUT `/lessons/:id`.
- Search as you type via GET `/search`.



