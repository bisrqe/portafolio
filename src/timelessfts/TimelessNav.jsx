import { useState } from 'react'
import { Link } from '../router'
import { useLanguage } from '../i18n/LanguageContext'
import { LanguageSwitcher } from '../components/layout/Controls'

const NAV_LINKS = [
  { href: '/timelessfts/about', key: 'about' },
  { href: '/timelessfts/portraits', key: 'portraits' },
  { href: '/timelessfts/concept', key: 'concept' },
  { href: '/timelessfts/events', key: 'events' },
  { href: '/timelessfts/contact', key: 'contact' },
]

export default function TimelessNav({ path }) {
  const { t } = useLanguage()
  const [open, setOpen] = useState(false)

  const close = () => setOpen(false)

  return (
    <nav className="nav" aria-label="Timeless">
      <Link to="/timelessfts" className="nav-logo" aria-label={t('timeless.nav.home')} onClick={close}>
        <span className="logo-text">timelessfts</span>
      </Link>

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
            <Link to={href} className={path === href ? 'active' : ''} onClick={close}>
              {t(`timeless.nav.${key}`)}
            </Link>
          </li>
        ))}
        <li className="nav-extras">
          <Link to="/" className="nav-back" onClick={close}>← {t('timeless.nav.back')}</Link>
          <LanguageSwitcher className="tl-lang" />
        </li>
      </ul>
    </nav>
  )
}
