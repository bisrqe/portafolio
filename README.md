# bisrqe — Personal Portfolio

Personal portfolio of **Bismarck Animas Roque**: professional projects, leadership experience and the
**Timeless FTS** photography sub-site. Available in **English, Spanish and French**, with light and dark themes.

Built with React 18 + Vite, Firebase (Firestore, Auth, Storage) and Cloudinary; deployed on Vercel.

## Features

- **Pages:** Home (`/`), Projects (`/professional-projects`), one page per project (`/professional-projects/<slug>`), Leadership (`/leadership`, `/leadership/<slug>`), Timeless FTS (`/timelessfts/*`) and the admin dashboard (`/admin`). English lives at the root, Spanish under `/es` and French under `/fr`.
- **Static HTML for search engines and link previews:** every public page is prerendered at build time with its real content, title, description, canonical URL, `hreflang` alternates, Open Graph image and `schema.org` data; React then hydrates it.
- **Three languages:** interface strings live in `src/i18n/`. Content is written in **English** in the dashboard and translated **automatically** into Spanish and French when saved (see *Automatic translation*). Translations can be corrected by hand; manual edits are never overwritten and are flagged for review if the English text changes. The language is part of the URL; first-time visitors whose browser is in Spanish or French are sent to that version, and an explicit choice (or `?lang=es|en|fr`) is remembered.
- **Light / dark theme** with a toggle, remembered per visitor (defaults to the system setting).
- **Admin dashboard** (Google sign-in): edit the home page, projects, leadership items, image framing, featured items, ordering, visible tag filters and tag translations. Settings are stored in Firestore, so every visitor sees them.

## Project structure

```
src/
├── App.jsx                  # Routes and data subscriptions
├── main.jsx                 # Providers (theme, language, router)
├── AppRoot.jsx              # Providers shared by the browser and prerender entries
├── entry-server.jsx         # Build-time renderer used by scripts/prerender.mjs
├── router.jsx               # Minimal client-side router (language-prefixed URLs)
├── seo/                     # Route table, <head> tags, JSON-LD
├── content/                 # Default home content, profile data, slugs and summaries
├── firebase.js              # Firebase app + Firestore (public site)
├── firebaseAdmin.js         # Auth + Storage (loaded only on /admin)
├── hooks/                   # useFirestore (live data + cache), useSiteSettings
├── i18n/                    # LanguageContext, translations.js, timeless.js
├── theme/ThemeContext.jsx
├── styles/global.css        # Design tokens and base styles
├── components/
│   ├── layout/              # Navbar, Footer, language/theme controls
│   ├── pages/               # HomeView, CollectionPage (projects & leadership)
│   ├── shared/              # ItemCard, ImageCarousel, Lightbox, TagFilter, Icon
│   └── admin/               # Dashboard, editors, uploads
└── timelessfts/             # Photography sub-site (own visual identity)
```

## Local development

```bash
npm install
cp .env.example .env.local   # fill in Firebase + Cloudinary values
npm run dev                  # http://localhost:3000 (client-side rendering, API functions included)
npm run build                # client build + prerendered pages in dist/
npm run preview              # serves dist/ like Vercel (clean URLs, rewrites, 404)
npm run lint
```

## Firebase setup

1. **Firestore rules:** paste `FIRESTORE_RULES.txt` into *Firebase Console → Firestore → Rules* and publish.
2. **Storage rules:** paste `FIREBASE_STORAGE_RULES.txt` into *Storage → Rules* and publish.
3. **Authentication:** enable the Google provider and add the production domain under *Authorized domains*.

Collections used: `home/content`, `projects`, `leadership`, `settings/site`.

### Admin access

Writes are allowed for the owner's verified Google account (the email written in both rules files) or any user with
the `admin` custom claim. The claim is optional; to set it, run `node scripts/set-admin-claim.cjs you@example.com` with a
service-account key saved as `scripts/serviceAccountKey.json` (git-ignored), then sign in again.

`VITE_ADMIN_EMAIL` lets that account open the dashboard.

## Automatic translation

`api/translate.js` is a Vercel serverless function (served by Vite middleware during `npm run dev`). It only accepts
requests signed in as the portfolio owner (Firebase ID token with the `admin` claim or the owner's verified email).

Configure one provider in *Vercel → Settings → Environment Variables* (server-only, no `VITE_` prefix):

| Variable | Provider | Notes |
|---|---|---|
| `DEEPL_API_KEY` | DeepL | Recommended; the free plan includes 500,000 characters/month |
| `GOOGLE_TRANSLATE_API_KEY` | Google Cloud Translation v2 | API key (not a service-account key); requires billing |
| *(none)* | MyMemory | No key; lower quality and a daily quota |

Home-page sections added in code (`src/content/homeContent.js`: key areas, highlights & recognitions, technical toolkit)
are shown until they are saved from the dashboard; from then on Firestore is the source of truth.

## Prerendering and SEO

`npm run build` runs three steps:

1. `vite build` — the browser bundle.
2. `vite build --ssr src/entry-server.jsx` — a Node bundle of the same React app.
3. `scripts/prerender.mjs` — reads `home/content`, `settings/site`, `projects` and `leadership` from Firestore's public REST API,
   renders every page in EN/ES/FR to `dist/**.html`, embeds the data for hydration, and writes `sitemap.xml`, `robots.txt`,
   `404.html` and `app-shell.html` (the SPA shell used by `/admin` and by entries created after the last build).

If Firestore cannot be read during a Vercel build, the build fails so the previous deployment stays online
(`PRERENDER_ALLOW_EMPTY=1` overrides this). `PRERENDER_DATA_FILE=path.json` renders from a local file instead.

**Keeping the static pages current:** create a Deploy Hook (*Vercel → Settings → Git → Deploy Hooks*, branch `main`) and
save its URL as `VERCEL_DEPLOY_HOOK_URL`. After each change in the dashboard, `/api/rebuild` triggers a new deployment
(changes are grouped for 20 s). Visitors always see live Firestore data after the page loads; the rebuild updates what
search engines and link previews read.

`SITE_URL` sets the absolute URL used in canonical links, Open Graph and the sitemap (defaults to Vercel's production
domain). The social card image is `public/og-image.png`; project pages use their cover image (cropped to 1200×630 by
Cloudinary).

## Cloudinary

Create an **unsigned** upload preset and set `VITE_CLOUDINARY_CLOUD_NAME` and `VITE_CLOUDINARY_UPLOAD_PRESET`.
Images for the Timeless galleries are listed in `src/timelessfts/galleries.js`.

## Deployment (Vercel)

`vercel.json` enables clean URLs and rewrites `/admin` and not-yet-prerendered entry pages to the SPA shell. Add every `VITE_*` variable from `.env.example`
under *Project → Settings → Environment Variables* and redeploy.

> All `VITE_*` values are embedded in the public bundle. Never store secrets in them; security relies on the Firebase rules.
