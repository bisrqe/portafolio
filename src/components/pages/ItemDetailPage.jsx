import { useCallback, useMemo, useState } from 'react'
import { Link } from '../../router'
import { useLanguage } from '../../i18n/LanguageContext'
import { useSiteSettings } from '../../hooks/useSiteSettings'
import { itemPath, resolveSlugs } from '../../content/items'
import ItemCard from '../shared/ItemCard'
import Lightbox from '../shared/Lightbox'
import Icon from '../shared/Icon'
import { framingStyle, getImages } from '../shared/media'
import { sortItems } from '../shared/sort'
import '../shared/shared.css'
import './detail.css'

/** Full page for one project or leadership entry: /professional-projects/:slug, /leadership/:slug */
export default function ItemDetailPage({ kind, item, items }) {
  const { t, pick } = useLanguage()
  const { tagLabel } = useSiteSettings()
  const [expanded, setExpanded] = useState(null)
  const closeLightbox = useCallback(() => setExpanded(null), [])

  const isLeadership = kind === 'leadership'
  const listPath = isLeadership ? '/leadership' : '/professional-projects'
  const title = pick(item, 'title')
  const role = isLeadership ? pick(item, 'role') : ''
  const summary = pick(item, 'summary')
  const description = pick(item, 'description')
  const images = getImages(item)
  const [cover, ...rest] = images

  const slugs = useMemo(() => resolveSlugs(items), [items])
  const more = useMemo(() => sortItems(items).filter(other => other.id !== item.id).slice(0, 3), [items, item.id])

  return (
    <>
      <header className="page-header grid-bg detail-header">
        <div className="container fade-up">
          <Link to={listPath} className="detail-back">
            <Icon name="arrow-left" size={16} /> {t(isLeadership ? 'detail.backLeadership' : 'detail.backProjects')}
          </Link>
          <p className="eyebrow">{t(isLeadership ? 'leadership.label' : 'projects.label')}</p>
          <h1 className="section-title detail-title">{title}</h1>
          {role && <p className="detail-role">{role}</p>}
          {summary && <p className="section-subtitle detail-lead">{summary}</p>}
        </div>
      </header>

      <section className="section section--tight">
        <div className="container detail-grid">
          <div className="detail-main">
            {cover && (
              <button type="button" className="detail-cover" onClick={() => setExpanded(cover)} aria-label={t('common.expand')}>
                <img src={cover} alt={t('detail.imageAlt', { title, n: 1 })} style={framingStyle(item)} />
              </button>
            )}
            {rest.length > 0 && (
              <div className="detail-thumbs" aria-label={t('detail.gallery')}>
                {rest.map((src, i) => (
                  <button key={src} type="button" className="detail-thumb" onClick={() => setExpanded(src)} aria-label={t('common.expand')}>
                    <img src={src} alt={t('detail.imageAlt', { title, n: i + 2 })} loading="lazy" />
                  </button>
                ))}
              </div>
            )}
            <div className="detail-body">
              {description.split(/\n\s*\n/).filter(Boolean).map((paragraph, i) => <p key={i}>{paragraph}</p>)}
            </div>
          </div>

          <aside className="detail-aside card">
            <p className="panel-title">{t('detail.details')}</p>
            <dl>
              {role && <div><dt>{t('detail.role')}</dt><dd>{role}</dd></div>}
              {item.tags?.length > 0 && (
                <div>
                  <dt>{t('detail.categories')}</dt>
                  <dd className="chips">{item.tags.map(tag => <span key={tag} className="chip">{tagLabel(tag)}</span>)}</dd>
                </div>
              )}
              {item.sdg?.length > 0 && (
                <div>
                  <dt>{t('leadership.sdg')}</dt>
                  <dd className="chips">{item.sdg.map(goal => <span key={goal} className="chip chip--accent">{goal}</span>)}</dd>
                </div>
              )}
            </dl>
            {item.link && (
              <a href={item.link} target="_blank" rel="noopener noreferrer" className="btn btn--primary detail-cta">
                {t('detail.visit')} <Icon name="external" />
              </a>
            )}
          </aside>
        </div>
      </section>

      {more.length > 0 && (
        <section className="section">
          <div className="container">
            <div className="section-head section-head--row">
              <h2 className="section-title">{t(isLeadership ? 'detail.moreLeadership' : 'detail.moreProjects')}</h2>
              <Link to={listPath} className="link-arrow">{t('featured.viewAll')} <Icon name="arrow-right" /></Link>
            </div>
            <div className="item-grid item-grid--3">
              {more.map(other => (
                <ItemCard key={other.id} item={other} kind={kind} href={itemPath(kind, slugs.get(other.id))} tagLabel={tagLabel} variant="compact" />
              ))}
            </div>
          </div>
        </section>
      )}

      <Lightbox src={expanded} onClose={closeLightbox} alt={title} />
    </>
  )
}
