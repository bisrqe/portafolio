// URL slugs and short summaries for projects / leadership entries

export const KIND_BASE = { projects: '/professional-projects', leadership: '/leadership' }

export function slugify(text = '', max = 70) {
  const slug = text
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  if (slug.length <= max) return slug
  const cut = slug.slice(0, max)
  return cut.slice(0, cut.lastIndexOf('-') > 20 ? cut.lastIndexOf('-') : max)
}

/**
 * Stable, unique slug per item: the saved `slug`, else one derived from the English title.
 * Returns a Map(id → slug). Items are processed by id so the result never depends on sort order.
 */
export function resolveSlugs(items = []) {
  const used = new Set()
  const map = new Map()
  ;[...items].sort((a, b) => String(a.id).localeCompare(String(b.id))).forEach(item => {
    let slug = (item.slug && slugify(item.slug)) || slugify(item.title || '') || String(item.id).toLowerCase()
    if (used.has(slug)) slug = `${slug}-${String(item.id).slice(0, 5).toLowerCase()}`
    used.add(slug)
    map.set(item.id, slug)
  })
  return map
}

export function itemPath(kind, slug) {
  return `${KIND_BASE[kind]}/${slug}`
}

export function findBySlug(items, slug) {
  const slugs = resolveSlugs(items)
  return items.find(item => slugs.get(item.id) === slug) || null
}

/** Short summary for cards: first sentences up to `max` characters. */
export function excerpt(text = '', max = 190) {
  const first = text.trim().split(/\n\s*\n/)[0].replace(/\s+/g, ' ')
  if (first.length <= max) return first
  const window = first.slice(0, max)
  const sentenceEnd = Math.max(window.lastIndexOf('. '), window.lastIndexOf('! '), window.lastIndexOf('? '))
  if (sentenceEnd >= 90) return window.slice(0, sentenceEnd + 1)
  return `${window.slice(0, window.lastIndexOf(' ')).replace(/[,;:\s]+$/, '')}…`
}
