import { useLanguage } from '../i18n/LanguageContext'
import { cld } from './galleries'

// Native lazy loading: images are in the HTML (prerender-friendly) and load as they approach the viewport
export default function TimelessGallery({ gallery, images }) {
  const { t } = useLanguage()
  const title = t(`timeless.galleries.${gallery}.title`)
  const subtitle = t(`timeless.galleries.${gallery}.subtitle`)

  return (
    <>
      <header className="page-hero">
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </header>
      <main>
        <div className="gallery-grid" role="list" aria-label={t('timeless.galleries.galleryLabel', { gallery: title })}>
          {images.map((src, i) => (
            <div key={src} className="gallery-item" role="listitem">
              <img src={cld(src, 900)} alt={t('timeless.galleries.alt', { gallery: title, n: i + 1 })} loading={i < 4 ? 'eager' : 'lazy'} decoding="async" />
            </div>
          ))}
        </div>
      </main>
    </>
  )
}
