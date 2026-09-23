import { useState } from 'react'
import { useLanguage } from '../../i18n/LanguageContext'
import Icon from './Icon'
import { framingStyle } from './media'

export default function ImageCarousel({ images, alt, item, onExpand }) {
  const { t } = useLanguage()
  const [index, setIndex] = useState(0)
  if (images.length === 0) return null

  const current = Math.min(index, images.length - 1)
  const go = delta => setIndex((current + delta + images.length) % images.length)
  const multiple = images.length > 1

  return (
    <div className="media">
      <button type="button" className="media-frame" onClick={() => onExpand?.(images[current])} aria-label={t('common.expand')}>
        <img src={images[current]} alt={alt} loading="lazy" style={framingStyle(item)} />
      </button>
      {multiple && (
        <>
          <button type="button" className="media-nav media-nav--prev" onClick={() => go(-1)} aria-label={t('common.prev')}>
            <Icon name="chevron-left" size={18} />
          </button>
          <button type="button" className="media-nav media-nav--next" onClick={() => go(1)} aria-label={t('common.next')}>
            <Icon name="chevron-right" size={18} />
          </button>
          <div className="media-dots">
            {images.map((_, i) => (
              <button
                key={i}
                type="button"
                className={i === current ? 'is-active' : ''}
                onClick={() => setIndex(i)}
                aria-label={t('common.goTo', { n: i + 1 })}
              />
            ))}
          </div>
          <span className="media-count">{current + 1}/{images.length}</span>
        </>
      )}
    </div>
  )
}
