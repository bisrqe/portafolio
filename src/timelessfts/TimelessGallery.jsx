import { useEffect, useRef } from 'react'
import { useLanguage } from '../i18n/LanguageContext'
import { cld } from './galleries'

export default function TimelessGallery({ gallery, images }) {
  const { t } = useLanguage()
  const gridRef = useRef(null)
  const title = t(`timeless.galleries.${gallery}.title`)
  const subtitle = t(`timeless.galleries.${gallery}.subtitle`)

  useEffect(() => {
    const grid = gridRef.current
    if (!grid) return undefined
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return
          const img = entry.target
          img.src = img.dataset.src
          img.onload = () => img.classList.add('loaded')
          observer.unobserve(img)
        })
      },
      { rootMargin: '200px 0px' },
    )
    grid.querySelectorAll('img[data-src]').forEach(img => observer.observe(img))
    return () => observer.disconnect()
  }, [images])

  return (
    <>
      <header className="page-hero">
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </header>
      <main>
        <div className="gallery-grid" ref={gridRef} role="list" aria-label={t('timeless.galleries.galleryLabel', { gallery: title })}>
          {images.map((src, i) => (
            <div key={src} className="gallery-item" role="listitem">
              <img data-src={cld(src, 900)} alt={t('timeless.galleries.alt', { gallery: title, n: i + 1 })} loading="lazy" />
            </div>
          ))}
        </div>
      </main>
    </>
  )
}
