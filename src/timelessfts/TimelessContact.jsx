import { useState } from 'react'

const FORMSPREE_ENDPOINT = 'https://formspree.io/f/mzdykjla'

export default function TimelessContact() {
  const [fields, setFields] = useState({ name: '', email: '', message: '' })
  const [errors, setErrors] = useState({})
  const [feedback, setFeedback] = useState(null) // null | 'success' | 'error'
  const [sending, setSending] = useState(false)

  const set = key => e => setFields(f => ({ ...f, [key]: e.target.value }))

  const validate = () => {
    const e = {}
    if (!fields.name.trim()) e.name = 'Name is required.'
    if (!fields.email.trim()) {
      e.email = 'Email is required.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email.trim())) {
      e.email = 'Enter a valid email address.'
    }
    if (!fields.message.trim()) e.message = 'Message is required.'
    return e
  }

  const handleSubmit = async e => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setErrors({})
    setSending(true)
    setFeedback(null)

    try {
      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify(fields),
      })
      if (res.ok) {
        setFeedback('success')
        setFields({ name: '', email: '', message: '' })
      } else {
        setFeedback('error')
      }
    } catch {
      setFeedback('error')
    } finally {
      setSending(false)
    }
  }

  return (
    <>
      <header className="page-hero">
        <h1>Get in Touch</h1>
        <h2>
          IG: <a href="https://www.instagram.com/timelessfts/" target="_blank" rel="noopener noreferrer">@timelessfts</a>
        </h2>
      </header>
      <main className="contact-wrapper">
        <p>Commission a shoot, ask a question, or just say hi.</p>
        <form className="contact-form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="tl-name">Name</label>
            <input
              id="tl-name"
              type="text"
              name="name"
              value={fields.name}
              onChange={set('name')}
              placeholder="Your name"
              autoComplete="name"
              className={errors.name ? 'error' : ''}
              aria-describedby="tl-err-name"
            />
            <span className="field-error" id="tl-err-name" role="alert">{errors.name || ''}</span>
          </div>

          <div className="form-group">
            <label htmlFor="tl-email">Email</label>
            <input
              id="tl-email"
              type="email"
              name="email"
              value={fields.email}
              onChange={set('email')}
              placeholder="your@email.com"
              autoComplete="email"
              className={errors.email ? 'error' : ''}
              aria-describedby="tl-err-email"
            />
            <span className="field-error" id="tl-err-email" role="alert">{errors.email || ''}</span>
          </div>

          <div className="form-group">
            <label htmlFor="tl-message">Message</label>
            <textarea
              id="tl-message"
              name="message"
              rows={6}
              value={fields.message}
              onChange={set('message')}
              placeholder="Tell me about your project or just say hello…"
              className={errors.message ? 'error' : ''}
              aria-describedby="tl-err-message"
            />
            <span className="field-error" id="tl-err-message" role="alert">{errors.message || ''}</span>
          </div>

          {feedback && (
            <div
              className={`form-feedback ${feedback === 'success' ? 'success' : 'error-msg'}`}
              role="status"
              aria-live="polite"
            >
              {feedback === 'success'
                ? "Message sent! I'll get back to you within 48 hours."
                : 'Something went wrong. Please try again or email me directly at: bismarck@bisrqe.com.'}
            </div>
          )}

          <button type="submit" className="btn-send" disabled={sending}>
            {sending ? 'Sending…' : 'Send'}
          </button>
        </form>
      </main>
    </>
  )
}
