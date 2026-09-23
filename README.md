# bisrqe — Personal Portfolio

Personal portfolio of **Bismarck Animas Roque**: professional projects, leadership experience and the
**Timeless FTS** photography sub-site. Available in **English, Spanish and French**, with light and dark themes.

Built with React 18 + Vite, Firebase (Firestore, Auth, Storage) and Cloudinary; deployed on Vercel.

## Features

- **Pages:** Home (`/`), Projects (`/professional-projects`), Leadership (`/leadership`), Timeless FTS (`/timelessfts/*`) and the admin dashboard (`/admin`).
- **Three languages:** interface strings live in `src/i18n/`. Firestore content (titles, descriptions, bio, metrics, skills and tag names) is translated from the dashboard; empty translations fall back to the original text. The language is detected from the browser, remembered per visitor and can be forced with `?lang=es|en|fr`.
- **Light / dark theme** with a toggle, remembered per visitor (defaults to the system setting).
- **Admin dashboard** (Google sign-in): edit the home page, projects, leadership items, image framing, featured items, ordering, visible tag filters and tag translations. Settings are stored in Firestore, so every visitor sees them.

## Project structure

```
src/
├── App.jsx                  # Routes and data subscriptions
├── main.jsx                 # Providers (theme, language, router)
├── router.jsx               # Minimal client-side router
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
npm run dev                  # http://localhost:3000
npm run build && npm run preview
npm run lint
```

## Firebase setup

1. **Firestore rules:** paste `FIRESTORE_RULES.txt` into *Firebase Console → Firestore → Rules* and publish.
2. **Storage rules:** paste `FIREBASE_STORAGE_RULES.txt` into *Storage → Rules* and publish.
3. **Authentication:** enable the Google provider and add the production domain under *Authorized domains*.

Collections used: `home/content`, `projects`, `leadership`, `settings/site`.

### Admin access

Writes are allowed only for users with the `admin` custom claim:

1. *Project settings → Service accounts → Generate new private key*; save it as `scripts/serviceAccountKey.json` (git-ignored).
2. Run `node scripts/set-admin-claim.cjs you@example.com`.
3. Sign out and sign back in at `/admin`.

`VITE_ADMIN_EMAIL` is optional: it only lets that account open the dashboard before the claim exists.

## Cloudinary

Create an **unsigned** upload preset and set `VITE_CLOUDINARY_CLOUD_NAME` and `VITE_CLOUDINARY_UPLOAD_PRESET`.
Images for the Timeless galleries are listed in `src/timelessfts/galleries.js`.

## Deployment (Vercel)

`vercel.json` configures the Vite build and SPA rewrites. Add every `VITE_*` variable from `.env.example`
under *Project → Settings → Environment Variables* and redeploy.

> All `VITE_*` values are embedded in the public bundle. Never store secrets in them; security relies on the Firebase rules.
