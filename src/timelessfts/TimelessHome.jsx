import { useState, useEffect, useRef, useCallback } from 'react'

const SLIDES = [
  {
    src: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1400&q=80&auto=format&fit=crop',
    alt: 'Mountain landscape at golden hour',
    title: 'Light & Time',
    subtitle: 'Landscapes · Portraits · Stories',
  },
  {
    src: 'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=1400&q=80&auto=format&fit=crop',
    alt: 'Misty forest with soft morning light',
    title: 'Into the Quiet',
    subtitle: 'Nature & Atmosphere',
  },
  {
    src: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1400&q=80&auto=format&fit=crop',
    alt: 'Travel photography — coastal road',
    title: 'Wandering Eye',
    subtitle: 'Travel & Documentary',
  },
  {
    src: 'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=1400&q=80&auto=format&fit=crop',
    alt: 'Wildflower meadow in warm afternoon light',
    title: 'In Full Bloom',
    subtitle: 'Color & Texture',
  },
  {
    src: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=1400&q=80&auto=format&fit=crop',
    alt: 'Person silhouette at sunset',
    title: 'Human & Horizon',
    subtitle: 'Portraits & Stillness',
  },
]

const FAQ_ITEMS = [
  {
    q: 'How do I commission a shoot?',
    a: 'Reach out via the Contact page with your idea, preferred date, and location. I\'ll usually reply within 48 hours to discuss the project and next steps.',
  },
  {
    q: "What's your typical turnaround time?",
    a: 'For most portrait and lifestyle sessions, expect a 7–14 day turnaround for the final edited gallery. Larger projects like events or multi-day shoots may take 2–4 weeks. Rush delivery options are available upon request.',
  },
  {
    q: 'Do you shoot in film or digital?',
    a: 'Both! The Canon and Digicam sections showcase distinct camera systems I work with. I love the warmth and grain of film for personal projects, while I rely on digital for client work requiring reliable, high-resolution results.',
  },
  {
    q: "What's included in a photo package?",
    a: 'Every package includes a pre-shoot consultation, the selected number of edited high-resolution images, and delivery via a private online gallery with download access. Print options can be arranged at an additional cost.',
  },
  {
    q: 'Can I use the photos on social media?',
    a: 'Yes — personal use including social media is always included. For commercial or brand use, please mention this when booking so we can discuss the appropriate licensing for your project.',
  },
  {
    q: 'Do you travel for shoots?',
    a: 'Absolutely. Travel photography is at the heart of what I do. For shoots outside my local area, travel costs are covered by the client at cost. Let me know your destination and we can work out the details.',
  },
  {
    q: 'What if the weather is bad on shoot day?',
    a: "Overcast and moody skies often make for the most interesting shots! That said, if conditions are truly prohibitive, we'll reschedule at no extra charge. I always monitor the forecast ahead of any outdoor session.",
  },
]

function Carousel() {
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
      aria-label="Featured photography"
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
              src={slide.src}
              alt={slide.alt}
              loading={i === 0 ? 'eager' : 'lazy'}
            />
            <div className="carousel-caption">
              <h1>{slide.title}</h1>
              <p>{slide.subtitle}</p>
            </div>
          </div>
        ))}
      </div>

      <button className="carousel-btn prev" aria-label="Previous slide" onClick={handlePrev}>
        <svg viewBox="0 0 24 24" aria-hidden="true"><polyline points="15 18 9 12 15 6" /></svg>
      </button>
      <button className="carousel-btn next" aria-label="Next slide" onClick={handleNext}>
        <svg viewBox="0 0 24 24" aria-hidden="true"><polyline points="9 18 15 12 9 6" /></svg>
      </button>

      <div className="carousel-dots" role="group" aria-label="Slide indicators">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            className={`carousel-dot${i === current ? ' active' : ''}`}
            aria-label={`Go to slide ${i + 1}`}
            onClick={() => { stopAutoplay(); goTo(i); startAutoplay() }}
          />
        ))}
      </div>
    </section>
  )
}

function Accordion({ navigate }) {
  const [openIndex, setOpenIndex] = useState(null)

  return (
    <section className="faq-section" aria-labelledby="faq-heading">
      <h2 id="faq-heading">Frequently Asked Questions</h2>

      {FAQ_ITEMS.map((item, i) => (
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
              {i === 0 ? (
                <>
                  Reach out via the{' '}
                  <a href="/timelessfts/contact" onClick={e => { e.preventDefault(); navigate('/timelessfts/contact') }}>
                    Contact page
                  </a>{' '}
                  with your idea, preferred date, and location. I'll usually reply within 48 hours to discuss the project and next steps.
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
      <Carousel />
      <Accordion navigate={navigate} />
    </>
  )
}
