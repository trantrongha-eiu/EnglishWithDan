import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'

const FRONTEND = path.resolve(import.meta.dirname, '../frontend')
const SHARED_PREFIXES = ['/css/', '/js/', '/img/', '/sounds/', '/fonts/', '/manifest.json']
const MIME = {
  '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.webp': 'image/webp', '.gif': 'image/gif', '.mp3': 'audio/mpeg', '.woff2': 'font/woff2',
}

const assetHash = (rel) => {
  const text = fs.readFileSync(path.join(FRONTEND, rel), 'utf8').replace(/\r\n/g, '\n')
  return crypto.createHash('sha256').update(text, 'utf8').digest('hex').slice(0, 10)
}

// Stylesheets a route loads only while it is open (components/PageCss.jsx)
const PAGE_CSS = ['entrance-test', 'vocab-leaderboard', 'shop', 'duel', 'inbox', 'pf-pages', 'profile', 'pf-profile', 'inventory', 'tuition', 'review-history', 'dictation', 'shadowing', 'goal', 'writing-practice', 'essential-grammar', 'playful', 'advanced-sentences', 'writing-practice-page', 'task1-practice', 'task2-practice', 'speaking-part2', 'task2-highlight', 'task2-generic-tpl', 'task2-template', 'vocab-battle']

// The app reuses the static site's CSS/JS/images (/css/tokens.css,
// /js/shared/word-audio.js, /img/…). On Render they sit next to /app/; in
// `npm run dev` this serves them straight from ../frontend.
function serveFrontendInDev() {
  return {
    name: 'serve-frontend-in-dev',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        // dev also prefixes the base onto classic <script src="/js/…">
        const url = (req.url || '').split('?')[0].replace(/^\/app(?=\/(?:css|js|img|sounds|fonts)\/)/, '')
        if (!SHARED_PREFIXES.some(p => url.startsWith(p))) return next()
        const file = path.join(FRONTEND, decodeURIComponent(url))
        if (!file.startsWith(FRONTEND) || !fs.existsSync(file) || !fs.statSync(file).isFile()) return next()
        res.setHeader('Content-Type', MIME[path.extname(file).toLowerCase()] || 'application/octet-stream')
        fs.createReadStream(file).pipe(res)
      })
    },
  }
}

// /css/* and /js/* are served with a long immutable cache, so every
// reference needs a ?v=<content hash> (same rule as
// scripts/stamp-asset-versions.js for the static pages, which doesn't scan
// frontend/app/). Stamped at build time.
function stampSharedAssets() {
  return {
    name: 'stamp-shared-assets',
    apply: 'build',
    transformIndexHtml(html) {
      return html.replace(/(["'])(\/(?:css|js)\/[\w./-]+\.(?:css|js))\1/g, (m, q, rel) => {
        const file = path.join(FRONTEND, rel)
        if (!fs.existsSync(file)) return m
        return `${q}${rel}?v=${assetHash(rel)}${q}`
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), serveFrontendInDev(), stampSharedAssets()],
  base: '/app/',
  define: {
    __PAGE_CSS__: JSON.stringify(Object.fromEntries(
      PAGE_CSS.map(n => [n, `/css/${n}.css?v=${assetHash(`/css/${n}.css`)}`]),
    )),
  },
  build: {
    outDir: '../frontend/app',
    emptyOutDir: true,
  },
})
