import { useCallback, useMemo, useState } from 'react'
import { useLanguage } from '../../i18n/LanguageContext'
import { useSiteSettings } from '../../hooks/useSiteSettings'
import ItemCard from '../shared/ItemCard'
import TagFilter from '../shared/TagFilter'
import Lightbox from '../shared/Lightbox'
import { sortItems } from '../shared/sort'
import '../shared/shared.css'

/**
 * Listing page shared by Projects and Leadership.
 * kind: 'projects' | 'leadership'
 */
export default function CollectionPage({ kind, items }) {
  const { t } = useLanguage()
  const { visibleTags, tagLabel } = useSiteSettings()
  const [activeTag, setActiveTag] = useState(null)
  const [expanded, setExpanded] = useState(null)
  const closeLightbox = useCallback(() => setExpanded(null), [])

  const sorted = useMemo(() => sortItems(items), [items])

  const tags = useMemo(() => {
    const allowed = visibleTags[kind]
    const set = new Set()
    sorted.forEach(item => item.tags?.forEach(tag => { if (allowed.includes(tag)) set.add(tag) }))
    return [...set].sort((a, b) => tagLabel(a).localeCompare(tagLabel(b)))
  }, [sorted, visibleTags, kind, tagLabel])

  const filtered = activeTag ? sorted.filter(item => item.tags?.includes(activeTag)) : sorted
  const cardKind = kind === 'leadership' ? 'leadership' : 'project'
  const emptyText = kind === 'leadership'
    ? t('leadership.empty')
    : (activeTag ? t('projects.emptyTag', { tag: tagLabel(activeTag) }) : t('projects.empty'))

  return (
    <>
      <header className="page-header grid-bg">
        <div className="container fade-up">
          <p className="eyebrow">{t(`${kind}.label`)}</p>
          <h1 className="section-title">{t(`${kind}.title`)}</h1>
          <p className="section-subtitle">{t(`${kind}.subtitle`)}</p>
        </div>
      </header>

      <section className="section section--tight">
        <div className="container">
          <TagFilter tags={tags} active={activeTag} onChange={setActiveTag} tagLabel={tagLabel} />
          {filtered.length === 0 ? (
            <div className="empty-state">{emptyText}</div>
          ) : (
            <div className="item-grid">
              {filtered.map(item => (
                <ItemCard key={item.id} item={item} kind={cardKind} tagLabel={tagLabel} onExpand={setExpanded} />
              ))}
            </div>
          )}
        </div>
      </section>

      <Lightbox src={expanded} onClose={closeLightbox} />
    </>
  )
}
