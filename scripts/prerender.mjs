// Generates static HTML for every public page (in EN, ES and FR) after `vite build`.
// Content comes from Firestore's public REST API, so crawlers and link previews see real text,
// and the React app hydrates the same markup in the browser.
//
//   SITE_URL                        absolute site URL for canonical/og:url (default: Vercel production domain)
//   PRERENDER_DATA_FILE             optional JSON file to use instead of Firestore (tests / offline builds)
//   PRERENDER_ALLOW_EMPTY=1         deploy even if Firestore cannot be read (otherwise the Vercel build fails
//                                   and the previous deployment stays online)
import fs from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { loadEnv } from 'vite'

const root = process.cwd()
const dist = path.join(root, 'dist')
const env = { ...loadEnv('production', root, ''), ...process.env }
const onVercel = env.VERCEL === '1'

const siteUrl = (env.SITE_URL
  || (env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${env.VERCEL_PROJECT_PRODUCTION_URL}` : '')
  || 'http://localhost:4173').replace(/\/+$/, '')

// ---------- Firestore REST → plain JSON (same shape the web SDK produces) ----------
function decodeValue(v) {
  if ('stringValue' in v) return v.stringValue
  if ('integerValue' in v) return Number(v.integerValue)
  if ('doubleValue' in v) return v.doubleValue
  if ('booleanValue' in v) return v.booleanValue
  if ('nullValue' in v) return null
  if ('timestampValue' in v) return Date.parse(v.timestampValue)
  if ('mapValue' in v) return decodeFields(v.mapValue.fields || {})
  if ('arrayValue' in v) return (v.arrayValue.values || []).map(decodeValue)
  if ('referenceValue' in v) return v.referenceValue
  if ('geoPointValue' in v) return v.geoPointValue
  return null
}
const decodeFields = fields => Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, decodeValue(v)]))

async function firestoreFetch(docPath, params = '') {
  const projectId = env.VITE_FIREBASE_PROJECT_ID
  const key = env.VITE_FIREBASE_API_KEY
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${docPath}?key=${key}${params}`
  const res = await fetch(url)
  if (res.status === 404) return null
  if (!res.ok) throw new Error(`Firestore ${docPath}: HTTP ${res.status} ${(await res.text()).slice(0, 200)}`)
  return res.json()
}

async function readCollection(name) {
  const out = []
  let pageToken = ''
  do {
    const page = await firestoreFetch(name, `&pageSize=300${pageToken ? `&pageToken=${pageToken}` : ''}`)
    ;(page?.documents || []).forEach(doc => out.push({ id: doc.name.split('/').pop(), ...decodeFields(doc.fields || {}) }))
    pageToken = page?.nextPageToken || ''
  } while (pageToken)
  return out
}

async function readDoc(docPath) {
  const doc = await firestoreFetch(docPath)
  return doc ? decodeFields(doc.fields || {}) : {}
}

async function loadData() {
  if (env.PRERENDER_DATA_FILE) {
    console.log(`[prerender] Using data from ${env.PRERENDER_DATA_FILE}`)
    return JSON.parse(await fs.readFile(path.resolve(root, env.PRERENDER_DATA_FILE), 'utf8'))
  }
  if (!env.VITE_FIREBASE_PROJECT_ID || !env.VITE_FIREBASE_API_KEY) throw new Error('VITE_FIREBASE_PROJECT_ID / VITE_FIREBASE_API_KEY are not set')
  const [home, settings, projects, leadership] = await Promise.all([
    readDoc('home/content'), readDoc('settings/site'), readCollection('projects'), readCollection('leadership'),
  ])
  return { 'home/content': home, 'settings/site': settings, projects, leadership }
}

// ---------- Helpers ----------
const safeJson = value => JSON.stringify(value).replace(/</g, '\\u003c')
const xml = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

async function writePage(url, html) {
  const file = url === '/' ? 'index.html' : `${url.slice(1)}.html`
  const target = path.join(dist, file)
  await fs.mkdir(path.dirname(target), { recursive: true })
  await fs.writeFile(target, html)
  return file
}

// ---------- Main ----------
let data
try {
  data = await loadData()
} catch (err) {
  if (onVercel && env.PRERENDER_ALLOW_EMPTY !== '1') {
    console.error(`[prerender] Could not read Firestore: ${err.message}`)
    console.error('[prerender] Failing the build so the previous deployment stays online (set PRERENDER_ALLOW_EMPTY=1 to override).')
    process.exit(1)
  }
  console.warn(`[prerender] Could not read Firestore (${err.message}); pages will be rendered without content.`)
  data = { 'home/content': {}, 'settings/site': {}, projects: [], leadership: [] }
}

const { render, listPaths, localizePath, LANG_CODES } = await import(pathToFileURL(path.join(root, 'dist-server', 'entry-server.js')).href)
const template = await fs.readFile(path.join(dist, 'index.html'), 'utf8')
const dataScript = `<script>window.__PORTFOLIO_DATA__=${safeJson(data)}</script>`

const fill = (html, { head, body, lang, withData }) => template
  .replace('<html lang="en">', `<html lang="${lang}">`)
  .replace('<!--app-head-->', head)
  .replace('<!--app-html-->', body)
  .replace('<!--app-data-->', withData ? dataScript : '')

// SPA shell (no prerendered markup) for /admin and entries created after the last build
const shellHead = render('/', data, siteUrl).head
  .split('\n').filter(line => !/rel="(canonical|alternate)"|og:url|ld\+json/.test(line)).join('\n')
await fs.writeFile(path.join(dist, 'app-shell.html'), fill(template, { head: shellHead, body: '', lang: 'en', withData: false }))

const paths = listPaths(data)
const pages = []
for (const lang of LANG_CODES) {
  for (const p of paths) {
    const url = localizePath(p, lang)
    const { html, head } = render(url, data, siteUrl)
    pages.push({ path: p, lang, url, file: await writePage(url, fill(template, { head, body: html, lang, withData: true })) })
  }
}

// Not-found page (served by Vercel for unknown URLs)
{
  const { html, head } = render('/404', data, siteUrl)
  await fs.writeFile(path.join(dist, '404.html'), fill(template, { head, body: html, lang: 'en', withData: true }))
}

// sitemap.xml with hreflang alternates, and robots.txt
const urlEntries = paths.flatMap(p => LANG_CODES.map(lang => {
  const alternates = LANG_CODES.map(code => `    <xhtml:link rel="alternate" hreflang="${code}" href="${xml(siteUrl + localizePath(p, code))}"/>`)
  alternates.push(`    <xhtml:link rel="alternate" hreflang="x-default" href="${xml(siteUrl + localizePath(p, 'en'))}"/>`)
  return `  <url>\n    <loc>${xml(siteUrl + localizePath(p, lang))}</loc>\n${alternates.join('\n')}\n  </url>`
}))
await fs.writeFile(path.join(dist, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urlEntries.join('\n')}\n</urlset>\n`)
await fs.writeFile(path.join(dist, 'robots.txt'), `User-agent: *\nAllow: /\nDisallow: /admin\n\nSitemap: ${siteUrl}/sitemap.xml\n`)

await fs.rm(path.join(root, 'dist-server'), { recursive: true, force: true })
console.log(`[prerender] ${pages.length} pages (${paths.length} × ${LANG_CODES.length} languages) for ${siteUrl}`)
