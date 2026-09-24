import { Link, useRouter } from '../../router'
import { useLanguage } from '../../i18n/LanguageContext'
import { excerpt } from '../../content/items'
import ImageCarousel from './ImageCarousel'
import Icon from './Icon'
import { getImages } from './media'

const MAX_TAGS = 3

// "Professional Experience | 180 Degrees Consulting" → "180 Degrees Consulting" (placeholder when there is no image)
function shortName(title) {
  const part = title.split('|').pop().split(',').pop().trim()
  return part.length > 32 ? `${part.slice(0, 30)}…` : part
}

/**
 * Summary card for a project or leadership entry. The full text lives on its own page (`href`).
 * `variant="compact"` is used for the previews on the home page and detail pages.
 */
export default function ItemCard({ item, kind = 'projects', href, tagLabel = tag => tag, variant }) {
  const { t, pick } = useLanguage()
  const { navigate } = useRouter()
  const title = pick(item, 'title') || 'Untitled'
  const role = kind === 'leadership' ? pick(item, 'role') : ''
  const summary = pick(item, 'summary') || excerpt(pick(item, 'description'))
  const images = getImages(item)
  const tags = item.tags || []

  return (
    <article className={`item-card card ${variant === 'compact' ? 'item-card--compact' : ''}`}>
      {images.length > 0 ? (
        <ImageCarousel images={images} alt={title} item={item} onExpand={() => navigate(href)} frameLabel={title} />
      ) : (
        <Link to={href} className="media media--placeholder grid-bg" aria-hidden="true" tabIndex={-1}>
          <span className="media-placeholder-icon"><Icon name="terminal" size={22} /></span>
          <span className="media-placeholder-text">{shortName(title)}</span>
        </Link>
      )}
      <div className="item-body">
        {role && <p className="item-role">{role}</p>}
        <h3 className="item-title"><Link to={href} className="item-title-link">{title}</Link></h3>
        {summary && <p className="item-desc">{summary}</p>}

        {tags.length > 0 && (
          <div className="chips">
            {tags.slice(0, MAX_TAGS).map(tag => <span key={tag} className="chip">{tagLabel(tag)}</span>)}
            {tags.length > MAX_TAGS && <span className="chip chip--more">+{tags.length - MAX_TAGS}</span>}
          </div>
        )}

        <Link to={href} className="link-arrow item-link" aria-label={`${t('detail.readMore')}: ${title}`}>
          {t('detail.readMore')} <Icon name="arrow-right" />
        </Link>
      </div>
    </article>
  )
}
