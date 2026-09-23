import { useLanguage } from '../../i18n/LanguageContext'
import ImageCarousel from './ImageCarousel'
import Icon from './Icon'
import { getImages } from './media'

/**
 * Card used for both projects and leadership entries.
 * `variant="compact"` is used for the featured previews on the home page.
 */
export default function ItemCard({ item, kind = 'project', tagLabel = tag => tag, onExpand, variant }) {
  const { t, pick } = useLanguage()
  const title = pick(item, 'title') || 'Untitled'
  const role = kind === 'leadership' ? pick(item, 'role') : ''
  const description = pick(item, 'description')
  const images = getImages(item)
  const linkLabel = kind === 'leadership' ? t('leadership.learnMore') : t('projects.view')

  return (
    <article className={`item-card card ${variant === 'compact' ? 'item-card--compact' : ''}`}>
      {images.length > 0 && <ImageCarousel images={images} alt={title} item={item} onExpand={onExpand} />}
      <div className="item-body">
        {role && <p className="item-role">{role}</p>}
        <h3 className="item-title">{title}</h3>
        {description && <p className="item-desc">{description}</p>}

        {kind === 'leadership' && item.sdg?.length > 0 && (
          <div className="chips item-sdg" aria-label={t('leadership.sdg')}>
            {item.sdg.map(goal => <span key={goal} className="chip chip--accent">{goal}</span>)}
          </div>
        )}

        {item.tags?.length > 0 && (
          <div className="chips">
            {item.tags.map(tag => <span key={tag} className="chip">{tagLabel(tag)}</span>)}
          </div>
        )}

        {item.link && (
          <a href={item.link} target="_blank" rel="noopener noreferrer" className="link-arrow item-link">
            {linkLabel}
            <Icon name="external" />
          </a>
        )}
      </div>
    </article>
  )
}
