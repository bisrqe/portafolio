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

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const { t } = useLanguage()
  const label = theme === 'dark' ? t('nav.toLight') : t('nav.toDark')
  return (
    <button type="button" className="icon-btn" onClick={toggleTheme} aria-label={label} title={label}>
      <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={18} />
    </button>
  )
}
