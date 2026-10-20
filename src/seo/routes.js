// Route table shared by the React app and the prerender script
import { KIND_BASE, findBySlug, resolveSlugs } from '../content/items'

/**
 * matchRoute('/leadership/vanttec', data) →
 *   { name: 'home' | 'list' | 'detail' | 'admin' | 'notfound', kind?, slug?, item? }
 */
export function matchRoute(path, data = {}) {
  if (path === '/') return { name: 'home' }
  if (path.startsWith('/admin')) return { name: 'admin' }
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
  return paths
}
