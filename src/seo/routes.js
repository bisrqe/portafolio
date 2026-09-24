// Route table shared by the React app and the prerender script
import { KIND_BASE, findBySlug, resolveSlugs } from '../content/items'
import { GALLERIES } from '../timelessfts/galleries'

const TIMELESS_PAGES = ['', 'about', 'contact', ...Object.keys(GALLERIES)]

/**
 * matchRoute('/leadership/vanttec', data) →
 *   { name: 'home' | 'list' | 'detail' | 'timeless' | 'admin' | 'notfound', kind?, slug?, item?, sub? }
 */
export function matchRoute(path, data = {}) {
  if (path === '/') return { name: 'home' }
  if (path.startsWith('/admin')) return { name: 'admin' }
  if (path === '/timelessfts' || path.startsWith('/timelessfts/')) {
    const sub = path.replace(/^\/timelessfts\/?/, '')
    return TIMELESS_PAGES.includes(sub) ? { name: 'timeless', sub } : { name: 'notfound' }
  }
  for (const [kind, base] of Object.entries(KIND_BASE)) {
    if (path === base) return { name: 'list', kind }
    if (path.startsWith(`${base}/`)) {
      const slug = path.slice(base.length + 1)
      const item = findBySlug(data[kind] || [], slug)
      return { name: 'detail', kind, slug, item }
    }
  }
  return { name: 'notfound' }
}

/** Every language-independent path that should exist as a static page */
export function listPaths(data = {}) {
  const paths = ['/', ...Object.values(KIND_BASE)]
  Object.entries(KIND_BASE).forEach(([kind, base]) => {
    const slugs = resolveSlugs(data[kind] || [])
    slugs.forEach(slug => paths.push(`${base}/${slug}`))
  })
  TIMELESS_PAGES.forEach(sub => paths.push(sub ? `/timelessfts/${sub}` : '/timelessfts'))
  return paths
}
