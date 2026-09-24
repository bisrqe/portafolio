import { LANGUAGES, useLanguage } from '../../i18n/LanguageContext'
import { useTheme } from '../../theme/ThemeContext'
import Icon from '../shared/Icon'

export function LanguageSwitcher({ className = '' }) {
  const { lang, setLang, t } = useLanguage()
  return (
    <div className={`lang-switch ${className}`} role="group" aria-label={t('nav.language')}>
      {LANGUAGES.map(l => (
        <button
          key={l.code}
          type="button"
          className={lang === l.code ? 'is-active' : ''}
          aria-pressed={lang === l.code}
          lang={l.code}
          title={l.name}
          onClick={() => setLang(l.code)}
        >
          {l.label}
        </button>
      ))}
    </div>
  )
}

// Both icons are rendered; CSS shows the right one for the current [data-theme]
export function ThemeToggle() {
  const { toggleTheme } = useTheme()
  const { t } = useLanguage()
  const label = t('nav.toggleTheme')
  return (
    <button type="button" className="icon-btn theme-toggle" onClick={toggleTheme} aria-label={label} title={label}>
      <Icon name="sun" size={18} className="icon-sun" />
      <Icon name="moon" size={18} className="icon-moon" />
    </button>
  )
}
