import { useState } from 'react'
import { useLanguage } from '../i18n/LanguageContext'
import { LanguageSwitcher } from '../components/layout/Controls'

const NAV_LINKS = [
  { href: '/timelessfts/about', key: 'about' },
  { href: '/timelessfts/portraits', key: 'portraits' },
  { href: '/timelessfts/concept', key: 'concept' },
  { href: '/timelessfts/events', key: 'events' },
  { href: '/timelessfts/contact', key: 'contact' },
]

export default function TimelessNav({ path, navigate }) {
  const { t } = useLanguage()
  const [open, setOpen] = useState(false)

  const handleLink = (e, href) => {
    e.preventDefault()
    setOpen(false)
    navigate(href)
  }

  return (
    <nav className="nav" aria-label="Timeless">
      <a href="/timelessfts" className="nav-logo" aria-label={t('timeless.nav.home')} onClick={e => handleLink(e, '/timelessfts')}>
        <span className="logo-text">timelessfts</span>
      </a>

      <button
        className={`hamburger${open ? ' open' : ''}`}
        aria-label={t('timeless.nav.toggle')}
        aria-expanded={open}
        aria-controls="tl-nav-links"
        onClick={() => setOpen(o => !o)}
      >
        <span /><span /><span />
      </button>

      <ul className={`nav-links${open ? ' open' : ''}`} id="tl-nav-links">
        {NAV_LINKS.map(({ href, key }) => (
          <li key={href}>
            <a href={href} className={path === href ? 'active' : ''} onClick={e => handleLink(e, href)}>
              {t(`timeless.nav.${key}`)}
            </a>
          </li>
        ))}
        <li className="nav-extras">
          <a href="/" className="nav-back" onClick={e => handleLink(e, '/')}>← {t('timeless.nav.back')}</a>
          <LanguageSwitcher className="tl-lang" />
        </li>
      </ul>
    </nav>
  )
}
