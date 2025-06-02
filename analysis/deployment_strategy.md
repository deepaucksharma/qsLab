# Deployment Strategy: TechFlix

This guide outlines how to build and host the production version of TechFlix.

## 1. Production Build

Run `npm run build` from the `techflix/` directory. This invokes Vite to generate an optimized `dist/` folder containing static assets (HTML, JS, CSS, images). These files are ready to be served by any static hosting service or a Node server.

## 2. Production Server (`server.js`)

The project includes `server.js`, a small Express server used to serve the contents of `dist/` in production. It enables gzip compression, serves static files with caching headers, and falls back to `index.html` for client‑side routing. Start it with:

```bash
node server.js
# or via npm
npm run serve
```

This reads the `PORT` environment variable (default `3000`) so it can run on platforms like Heroku or Render.

## 3. Hosting Options

### Static Hosting

Because the output of `npm run build` is entirely static, you can host the `dist/` folder on platforms such as Netlify, Vercel, or GitHub Pages. Use `npm run preview` locally to verify the build before deploying.

### Node Server Hosting

For environments requiring a custom server (e.g., when using dynamic environment variables or wanting full control over headers), deploy `server.js` to a Node‑compatible host. After running `npm run build`, start the server with `node server.js`.

## 4. Environment Configuration

Create a `.env` file in the project root to define variables prefixed with `VITE_` for the frontend (e.g., `VITE_API_URL`, `VITE_ANALYTICS_ID`). The Express server respects `PORT` for its listening port. During deployment, ensure these variables are set appropriately for your hosting provider.
