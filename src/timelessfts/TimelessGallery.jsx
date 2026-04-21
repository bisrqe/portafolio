import { useEffect, useRef } from 'react'

export default function TimelessGallery({ title, subtitle, images }) {
  const gridRef = useRef(null)

  useEffect(() => {
    const grid = gridRef.current
    if (!grid) return

    const imgs = grid.querySelectorAll('img[data-src]')
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target
            img.src = img.dataset.src
            img.classList.add('loaded')
            observer.unobserve(img)
          }
        })
      },
      { rootMargin: '200px 0px' }
    )
    imgs.forEach(img => observer.observe(img))
    return () => observer.disconnect()
  }, [images])

  return (
    <>
      <header className="page-hero">
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </header>
      <main>
        <div
          className="gallery-grid"
          ref={gridRef}
          role="list"
          aria-label={`${title} gallery`}
        >
          {images.map(({ src, alt }, i) => (
            <div key={i} className="gallery-item" role="listitem">
              <img data-src={src} src="" alt={alt} loading="lazy" />
            </div>
          ))}
        </div>
      </main>
    </>
  )
}
