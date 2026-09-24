// <head> tags per page (title, description, canonical, hreflang, Open Graph, JSON-LD).
// Rendered to a string by the prerender script and re-applied in the browser on navigation.
import { LANG_CODES, localizePath } from '../i18n/paths'
import { pickField, translate } from '../i18n/t'
import { PROFILE } from '../content/profile'
import { excerpt } from '../content/items'
import { resolveHome } from '../content/homeContent'
import { getImages } from '../components/shared/media'
import { HOME_PATH } from '../hooks/useFirestore'
import { matchRoute } from './routes'

const OG_LOCALE = { en: 'en_US', es: 'es_MX', fr: 'fr_FR' }
const DEFAULT_OG_IMAGE = '/og-image.png'

const escapeHtml = value => String(value ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

// JSON inside <script> must not be able to close the tag
const safeJson = value => JSON.stringify(value).replace(/</g, '\\u003c')

// Cloudinary images are cropped to the 1200×630 social-card format
function socialImage(url, siteUrl) {
  if (!url) return `${siteUrl}${DEFAULT_OG_IMAGE}`
  if (url.includes('res.cloudinary.com') && url.includes('/image/upload/')) {
    return url.replace('/image/upload/', '/image/upload/c_fill,g_auto,w_1200,h_630,f_jpg,q_auto/')
  }
  return url
}

function personJsonLd(home, siteUrl) {
  const areas = (home.expertiseAreas || []).map(a => a.title).filter(Boolean)
  return {
    '@type': 'Person',
    '@id': `${siteUrl}/#person`,
    name: PROFILE.name,
    alternateName: PROFILE.alternateName,
    givenName: PROFILE.givenName,
    familyName: PROFILE.familyName,
    url: `${siteUrl}/`,
    image: home.heroImage || `${siteUrl}${DEFAULT_OG_IMAGE}`,
    email: `mailto:${PROFILE.email}`,
    ...(home.tagline ? { jobTitle: home.tagline } : {}),
    ...(home.description ? { description: home.description } : {}),
    address: { '@type': 'PostalAddress', addressLocality: PROFILE.locality, addressRegion: PROFILE.region, addressCountry: PROFILE.country },
    affiliation: { '@type': 'CollegeOrUniversity', name: PROFILE.university.name, url: PROFILE.university.url },
    knowsLanguage: PROFILE.languages,
    ...(areas.length ? { knowsAbout: areas } : {}),
    sameAs: [PROFILE.linkedin, PROFILE.github],
  }
}

/**
 * buildHead({ lang, path, data, siteUrl }) → { title, description, canonical, alternates, image, type, jsonLd, noindex }
 * `data` holds 'home/content', 'projects', 'leadership'.
 */
export function buildHead({ lang, path, data = {}, siteUrl = '' }) {
  const t = (key, vars) => translate(lang, key, vars)
  const home = resolveHome(data[HOME_PATH] || {})
  const route = matchRoute(path, data)
  const tagline = pickField(home, 'tagline', lang) || t('hero.fallbackTagline')
  const person = personJsonLd(home, siteUrl)

  let title = `${PROFILE.name} — ${tagline}`
  let description = pickField(home, 'description', lang) || t('meta.description')
  let image = `${siteUrl}${DEFAULT_OG_IMAGE}`
  let type = 'website'
  let noindex = false
  const jsonLd = []

  if (route.name === 'home') {
    type = 'profile'
    jsonLd.push(person, {
      '@type': 'WebSite',
      '@id': `${siteUrl}/#website`,
      url: `${siteUrl}/`,
      name: `${PROFILE.name} — Portfolio`,
      inLanguage: LANG_CODES,
      author: { '@id': person['@id'] },
    })
  } else if (route.name === 'list') {
    title = `${t(`${route.kind}.title`)} — ${PROFILE.shortName}`
    description = t(`${route.kind}.subtitle`)
    jsonLd.push({
      '@type': 'CollectionPage',
      name: t(`${route.kind}.title`),
      url: `${siteUrl}${localizePath(path, lang)}`,
      inLanguage: lang,
      about: { '@id': person['@id'] },
    })
  } else if (route.name === 'detail' && route.item) {
    const item = route.item
    const itemTitle = pickField(item, 'title', lang)
    title = `${itemTitle} — ${PROFILE.shortName}`
    description = pickField(item, 'summary', lang) || excerpt(pickField(item, 'description', lang), 160)
    const cover = getImages(item)[0]
    image = socialImage(cover, siteUrl)
    type = 'article'
    const listPath = route.kind === 'leadership' ? '/leadership' : '/professional-projects'
    jsonLd.push({
      '@type': 'CreativeWork',
      name: itemTitle,
      description,
      url: `${siteUrl}${localizePath(path, lang)}`,
      inLanguage: lang,
      ...(cover ? { image: cover } : {}),
      ...(item.tags?.length ? { keywords: item.tags.join(', ') } : {}),
      ...(item.link ? { sameAs: item.link } : {}),
      author: { '@id': person['@id'] },
    }, {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: PROFILE.shortName, item: `${siteUrl}${localizePath('/', lang)}` },
        { '@type': 'ListItem', position: 2, name: t(`${route.kind}.title`), item: `${siteUrl}${localizePath(listPath, lang)}` },
        { '@type': 'ListItem', position: 3, name: itemTitle, item: `${siteUrl}${localizePath(path, lang)}` },
      ],
    })
  } else if (route.name === 'timeless') {
    const sub = route.sub
    const pageName = sub === '' ? '' : (sub === 'about' || sub === 'contact' ? t(`timeless.nav.${sub}`) : t(`timeless.galleries.${sub}.title`))
    title = pageName ? `${pageName} — Timeless FTS` : t('timeless.meta.title')
    description = sub && !['about', 'contact'].includes(sub) ? t(`timeless.galleries.${sub}.subtitle`) : t('timeless.meta.description')
  } else {
    title = `${t('common.notFound')} — ${PROFILE.shortName}`
    noindex = true
  }

  const canonical = `${siteUrl}${localizePath(path, lang)}`
  const alternates = noindex ? [] : [
    ...LANG_CODES.map(code => ({ lang: code, href: `${siteUrl}${localizePath(path, code)}` })),
    { lang: 'x-default', href: `${siteUrl}${localizePath(path, 'en')}` },
  ]
  return { lang, title, description, canonical, alternates, image, type, jsonLd, noindex }
}

/** Tags as an HTML string; every tag carries data-head so the browser can replace them on navigation */
export function renderHeadTags(head) {
  const tags = [
    `<title data-head>${escapeHtml(head.title)}</title>`,
    `<meta data-head name="description" content="${escapeHtml(head.description)}" />`,
    head.noindex
      ? '<meta data-head name="robots" content="noindex" />'
      : `<link data-head rel="canonical" href="${escapeHtml(head.canonical)}" />`,
    ...head.alternates.map(a => `<link data-head rel="alternate" hreflang="${a.lang}" href="${escapeHtml(a.href)}" />`),
    `<meta data-head property="og:type" content="${head.type}" />`,
    `<meta data-head property="og:site_name" content="${escapeHtml(PROFILE.name)}" />`,
    `<meta data-head property="og:title" content="${escapeHtml(head.title)}" />`,
    `<meta data-head property="og:description" content="${escapeHtml(head.description)}" />`,
    `<meta data-head property="og:url" content="${escapeHtml(head.canonical)}" />`,
    `<meta data-head property="og:image" content="${escapeHtml(head.image)}" />`,
    `<meta data-head property="og:image:alt" content="${escapeHtml(head.title)}" />`,
    `<meta data-head property="og:locale" content="${OG_LOCALE[head.lang]}" />`,
    ...LANG_CODES.filter(code => code !== head.lang).map(code => `<meta data-head property="og:locale:alternate" content="${OG_LOCALE[code]}" />`),
    '<meta data-head name="twitter:card" content="summary_large_image" />',
    `<meta data-head name="twitter:title" content="${escapeHtml(head.title)}" />`,
    `<meta data-head name="twitter:description" content="${escapeHtml(head.description)}" />`,
    `<meta data-head name="twitter:image" content="${escapeHtml(head.image)}" />`,
  ]
  if (head.jsonLd.length) {
    tags.push(`<script data-head type="application/ld+json">${safeJson({ '@context': 'https://schema.org', '@graph': head.jsonLd })}</script>`)
  }
  return tags.join('\n    ')
}

/** Browser: replace the current head tags (used after client-side navigation) */
export function applyHead(head) {
  if (typeof document === 'undefined') return
  document.head.querySelectorAll('[data-head]').forEach(node => node.remove())
  document.head.insertAdjacentHTML('beforeend', renderHeadTags(head).replace(/<title data-head>.*?<\/title>/, ''))
  document.title = head.title
}
