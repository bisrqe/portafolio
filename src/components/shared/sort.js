// Items with an explicit `order` come first (ascending); the rest keep the newest first
export function sortItems(items) {
  const time = v => (typeof v === 'number' ? v : (v?.seconds ? v.seconds * 1000 : 0))
  return [...items].sort((a, b) => {
    const ao = Number.isFinite(Number(a.order)) && a.order !== '' && a.order != null ? Number(a.order) : Infinity
    const bo = Number.isFinite(Number(b.order)) && b.order !== '' && b.order != null ? Number(b.order) : Infinity
    if (ao !== bo) return ao - bo
    // Then by project dates (ongoing and most recent first), then by creation date
    const ad = a.current ? '9999' : (a.endDate || a.startDate || '')
    const bd = b.current ? '9999' : (b.endDate || b.startDate || '')
    if (ad !== bd) return bd.localeCompare(ad)
    return time(b.createdAt) - time(a.createdAt)
  })
}

// Home page previews: items marked as featured first, then the rest in normal order
export function featuredItems(items, count = 3) {
  const sorted = sortItems(items)
  return [...sorted.filter(item => item.featured), ...sorted.filter(item => !item.featured)].slice(0, count)
}
