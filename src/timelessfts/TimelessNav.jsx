import { useState } from 'react'

const NAV_LINKS = [
  { href: '/timelessfts/about', label: 'About' },
  { href: '/timelessfts/personal-work', label: 'Personal Work' },
  { href: '/timelessfts/day2day', label: 'Day2Day' },
  { href: '/timelessfts/canon', label: 'Canon' },
  { href: '/timelessfts/digicam', label: 'Digicam' },
  { href: '/timelessfts/contact', label: 'Contact' },
]

export default function TimelessNav({ path, navigate }) {
  const [open, setOpen] = useState(false)

  const handleLink = (e, href) => {
    e.preventDefault()
    setOpen(false)
    navigate(href)
  }

  return (
    <nav className="nav" role="navigation" aria-label="Main navigation">
      <a
        href="/timelessfts"
        className="nav-logo"
        aria-label="Timeless home"
        onClick={e => handleLink(e, '/timelessfts')}
      >
        <span className="logo-text">timeless</span>
      </a>

      <button
        className={`hamburger${open ? ' open' : ''}`}
        aria-label="Toggle navigation menu"
        aria-expanded={open}
        aria-controls="tl-nav-links"
        onClick={() => setOpen(o => !o)}
      >
        <span /><span /><span />
      </button>

      <ul
        className={`nav-links${open ? ' open' : ''}`}
        id="tl-nav-links"
        role="list"
      >
        {NAV_LINKS.map(({ href, label }) => (
          <li key={href}>
            <a
              href={href}
              className={path === href ? 'active' : ''}
              onClick={e => handleLink(e, href)}
            >
              {label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
