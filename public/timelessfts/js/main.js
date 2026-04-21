/* ============================================================
   TIMELESS FTS — main.js
   Handles: carousel, accordion, mobile nav, contact form,
            active nav link, lazy loading
============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  initNav()
  initCarousel()
  initAccordion()
  initContactForm()
  initLazyLoad()
  setActiveNavLink()
})

/* ============================================================
   NAVIGATION — hamburger mobile menu
============================================================ */
function initNav() {
  const hamburger = document.querySelector('.hamburger')
  const navLinks  = document.querySelector('.nav-links')
  if (!hamburger || !navLinks) return

  hamburger.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open')
    hamburger.classList.toggle('open', isOpen)
    hamburger.setAttribute('aria-expanded', isOpen)
    document.body.style.overflow = isOpen ? 'hidden' : ''
  })

  // Close menu when a link is clicked
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open')
      hamburger.classList.remove('open')
      hamburger.setAttribute('aria-expanded', 'false')
      document.body.style.overflow = ''
    })
  })

  // Close on ESC
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && navLinks.classList.contains('open')) {
      navLinks.classList.remove('open')
      hamburger.classList.remove('open')
      hamburger.setAttribute('aria-expanded', 'false')
      document.body.style.overflow = ''
    }
  })
}

/* ============================================================
   ACTIVE NAV LINK
============================================================ */
function setActiveNavLink() {
  const path     = window.location.pathname
  const filename = path.split('/').pop() || 'index.html'
  document.querySelectorAll('.nav-links a').forEach(link => {
    const href = link.getAttribute('href')
    if (href === filename || (filename === '' && href === 'index.html')) {
      link.classList.add('active')
    }
  })
}

/* ============================================================
   CAROUSEL
============================================================ */
function initCarousel() {
  const carousel = document.querySelector('.carousel')
  if (!carousel) return

  const track   = carousel.querySelector('.carousel-track')
  const slides  = carousel.querySelectorAll('.carousel-slide')
  const prevBtn = carousel.querySelector('.carousel-btn.prev')
  const nextBtn = carousel.querySelector('.carousel-btn.next')
  const dotsEl  = carousel.querySelector('.carousel-dots')

  if (!track || slides.length === 0) return

  let current  = 0
  let timer    = null
  const DELAY  = 5000
  const total  = slides.length

  // Build dots
  slides.forEach((_, i) => {
    const dot = document.createElement('button')
    dot.className = 'carousel-dot' + (i === 0 ? ' active' : '')
    dot.setAttribute('aria-label', `Go to slide ${i + 1}`)
    dot.addEventListener('click', () => goTo(i))
    dotsEl.appendChild(dot)
  })

  function goTo(index) {
    slides[current].setAttribute('aria-hidden', 'true')
    current = (index + total) % total
    track.style.transform = `translateX(-${current * 100}%)`
    updateDots()
    slides[current].removeAttribute('aria-hidden')
  }

  function updateDots() {
    dotsEl.querySelectorAll('.carousel-dot').forEach((dot, i) => {
      dot.classList.toggle('active', i === current)
    })
  }

  function startAutoplay() {
    timer = setInterval(() => goTo(current + 1), DELAY)
  }

  function stopAutoplay() {
    clearInterval(timer)
  }

  prevBtn?.addEventListener('click', () => { stopAutoplay(); goTo(current - 1); startAutoplay() })
  nextBtn?.addEventListener('click', () => { stopAutoplay(); goTo(current + 1); startAutoplay() })

  // Pause on hover
  carousel.addEventListener('mouseenter', stopAutoplay)
  carousel.addEventListener('mouseleave', startAutoplay)

  // Touch / swipe support
  let touchStartX = 0
  carousel.addEventListener('touchstart', e => { touchStartX = e.changedTouches[0].screenX }, { passive: true })
  carousel.addEventListener('touchend', e => {
    const delta = e.changedTouches[0].screenX - touchStartX
    if (Math.abs(delta) < 40) return
    stopAutoplay()
    goTo(delta < 0 ? current + 1 : current - 1)
    startAutoplay()
  }, { passive: true })

  // Keyboard
  carousel.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft')  { stopAutoplay(); goTo(current - 1); startAutoplay() }
    if (e.key === 'ArrowRight') { stopAutoplay(); goTo(current + 1); startAutoplay() }
  })
  carousel.setAttribute('tabindex', '0')

  // Init
  goTo(0)
  startAutoplay()
}

/* ============================================================
   FAQ ACCORDION
============================================================ */
function initAccordion() {
  const items = document.querySelectorAll('.accordion-item')
  if (!items.length) return

  items.forEach(item => {
    const trigger = item.querySelector('.accordion-trigger')
    const body    = item.querySelector('.accordion-body')
    if (!trigger || !body) return

    trigger.addEventListener('click', () => {
      const isOpen = trigger.getAttribute('aria-expanded') === 'true'

      // Close all open items
      items.forEach(other => {
        const otherTrigger = other.querySelector('.accordion-trigger')
        const otherBody    = other.querySelector('.accordion-body')
        otherTrigger?.setAttribute('aria-expanded', 'false')
        otherBody?.classList.remove('open')
      })

      // Toggle clicked item
      if (!isOpen) {
        trigger.setAttribute('aria-expanded', 'true')
        body.classList.add('open')
      }
    })
  })
}

/* ============================================================
   CONTACT FORM — Formspree
   Replace FORMSPREE_ENDPOINT in contact.html with your endpoint.
============================================================ */
function initContactForm() {
  const form     = document.getElementById('contact-form')
  if (!form) return

  const feedback = document.getElementById('form-feedback')
  const nameEl   = document.getElementById('field-name')
  const emailEl  = document.getElementById('field-email')
  const msgEl    = document.getElementById('field-message')
  const btn      = form.querySelector('.btn-send')

  function showError(el, errId, msg) {
    el.classList.add('error')
    const errEl = document.getElementById(errId)
    if (errEl) { errEl.textContent = msg; errEl.classList.add('visible') }
  }
  function clearError(el, errId) {
    el.classList.remove('error')
    const errEl = document.getElementById(errId)
    if (errEl) errEl.classList.remove('visible')
  }

  function validate() {
    let valid = true
    clearError(nameEl,  'err-name')
    clearError(emailEl, 'err-email')
    clearError(msgEl,   'err-message')

    if (!nameEl.value.trim()) {
      showError(nameEl, 'err-name', 'Name is required.'); valid = false
    }
    if (!emailEl.value.trim()) {
      showError(emailEl, 'err-email', 'Email is required.'); valid = false
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailEl.value.trim())) {
      showError(emailEl, 'err-email', 'Enter a valid email address.'); valid = false
    }
    if (!msgEl.value.trim()) {
      showError(msgEl, 'err-message', 'Message is required.'); valid = false
    }
    return valid
  }

  form.addEventListener('submit', async e => {
    e.preventDefault()
    if (!validate()) return

    btn.disabled    = true
    btn.textContent = 'Sending…'
    feedback.className = 'form-feedback'

    try {
      const res = await fetch(form.action, {
        method:  'POST',
        headers: { 'Accept': 'application/json' },
        body:    new FormData(form)
      })

      if (res.ok) {
        form.reset()
        feedback.textContent  = 'Thanks for reaching out! I\'ll get back to you soon.'
        feedback.className    = 'form-feedback success'
      } else {
        throw new Error('Server error')
      }
    } catch {
      feedback.textContent = 'Something went wrong. Please email me directly at bismarck@bisrqe.com'
      feedback.className   = 'form-feedback error-msg'
    } finally {
      btn.disabled    = false
      btn.textContent = 'Send'
    }
  })
}

/* ============================================================
   LAZY LOADING — Intersection Observer
============================================================ */
function initLazyLoad() {
  const lazyImgs = document.querySelectorAll('img[data-src]')
  if (!lazyImgs.length) return

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return
      const img = entry.target
      img.src = img.dataset.src
      img.removeAttribute('data-src')
      img.addEventListener('load', () => img.classList.add('loaded'))
      obs.unobserve(img)
    })
  }, { rootMargin: '200px 0px' })

  lazyImgs.forEach(img => observer.observe(img))
}
