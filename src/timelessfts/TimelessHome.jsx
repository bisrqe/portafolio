import { useState, useEffect, useRef, useCallback } from 'react'
import { useLanguage } from '../i18n/LanguageContext'
import { SLIDES, cld } from './galleries'

function Carousel({ navigate }) {
  const { t } = useLanguage()
  const captions = t('timeless.carousel.slides')
  const [current, setCurrent] = useState(0)
  const timerRef = useRef(null)
  const touchStartRef = useRef(0)

  const stopAutoplay = useCallback(() => clearInterval(timerRef.current), [])

  const startAutoplay = useCallback(() => {
    timerRef.current = setInterval(() => {
      setCurrent(c => (c + 1) % SLIDES.length)
    }, 5000)
  }, [])

  const goTo = useCallback(
    index => {
      const next = ((index % SLIDES.length) + SLIDES.length) % SLIDES.length
      setCurrent(next)
    },
    []
  )

  useEffect(() => {
    startAutoplay()
    return stopAutoplay
  }, [startAutoplay, stopAutoplay])

  const handlePrev = () => { stopAutoplay(); goTo(current - 1); startAutoplay() }
  const handleNext = () => { stopAutoplay(); goTo(current + 1); startAutoplay() }

  const handleTouchStart = e => { touchStartRef.current = e.changedTouches[0].screenX }
  const handleTouchEnd = e => {
    const delta = e.changedTouches[0].screenX - touchStartRef.current
    if (Math.abs(delta) < 40) return
    stopAutoplay()
    goTo(delta < 0 ? current + 1 : current - 1)
    startAutoplay()
  }

  const handleKeyDown = e => {
    if (e.key === 'ArrowLeft') { stopAutoplay(); goTo(current - 1); startAutoplay() }
    if (e.key === 'ArrowRight') { stopAutoplay(); goTo(current + 1); startAutoplay() }
  }

  return (
    <section
      className="carousel"
      aria-label={t('timeless.carousel.label')}
      tabIndex={0}
      onMouseEnter={stopAutoplay}
      onMouseLeave={startAutoplay}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onKeyDown={handleKeyDown}
    >
      <div
        className="carousel-track"
        role="list"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {SLIDES.map((slide, i) => (
          <div key={i} className="carousel-slide" role="listitem" aria-hidden={i !== current}>
            <img
              src={cld(slide.src, 1800)}
              alt={`${captions[i]?.title} — ${t(`timeless.galleries.${slide.gallery}.title`)}`}
              loading={i === 0 ? 'eager' : 'lazy'}
            />
            <div className="carousel-caption">
              {i === 0 ? <h1>{captions[i]?.title}</h1> : <h2>{captions[i]?.title}</h2>}
              <p>{captions[i]?.subtitle}</p>
              <a
                href={`/timelessfts/${slide.gallery}`}
                className="carousel-link"
                tabIndex={i === current ? 0 : -1}
                onClick={e => { e.preventDefault(); navigate(`/timelessfts/${slide.gallery}`) }}
              >
                {t('timeless.carousel.explore')} →
              </a>
            </div>
          </div>
        ))}
      </div>

      <button className="carousel-btn prev" aria-label={t('timeless.carousel.prev')} onClick={handlePrev}>
        <svg viewBox="0 0 24 24" aria-hidden="true"><polyline points="15 18 9 12 15 6" /></svg>
      </button>
      <button className="carousel-btn next" aria-label={t('timeless.carousel.next')} onClick={handleNext}>
        <svg viewBox="0 0 24 24" aria-hidden="true"><polyline points="9 18 15 12 9 6" /></svg>
      </button>

      <div className="carousel-dots" role="group" aria-label={t('timeless.carousel.indicators')}>
        {SLIDES.map((_, i) => (
          <button
            key={i}
            className={`carousel-dot${i === current ? ' active' : ''}`}
            aria-label={t('timeless.carousel.goTo', { n: i + 1 })}
            onClick={() => { stopAutoplay(); goTo(i); startAutoplay() }}
          />
        ))}
      </div>
    </section>
  )
}

function Accordion({ navigate }) {
  const { t } = useLanguage()
  const items = t('timeless.faq.items')
  const [openIndex, setOpenIndex] = useState(null)

  return (
    <section className="faq-section" aria-labelledby="faq-heading">
      <h2 id="faq-heading">{t('timeless.faq.title')}</h2>

      {items.map((item, i) => (
        <div key={i} className="accordion-item">
          <button
            className="accordion-trigger"
            aria-expanded={openIndex === i}
            aria-controls={`tl-faq-${i}`}
            onClick={() => setOpenIndex(prev => prev === i ? null : i)}
          >
            <h3>{item.q}</h3>
            <svg className="accordion-icon" viewBox="0 0 24 24" aria-hidden="true">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
          <div
            className={`accordion-body${openIndex === i ? ' open' : ''}`}
            id={`tl-faq-${i}`}
            role="region"
          >
            <p>
              {item.a.includes('{contact}') ? (
                <>
                  {item.a.split('{contact}')[0]}
                  <a href="/timelessfts/contact" onClick={e => { e.preventDefault(); navigate('/timelessfts/contact') }}>
                    {t('timeless.faq.contactLink')}
                  </a>
                  {item.a.split('{contact}')[1]}
                </>
              ) : item.a}
            </p>
          </div>
        </div>
      ))}
    </section>
  )
}

export default function TimelessHome({ navigate }) {
  return (
    <>
      <Carousel navigate={navigate} />
      <Accordion navigate={navigate} />
    </>
  )
}
