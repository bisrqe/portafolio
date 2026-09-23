import { useLanguage } from '../../i18n/LanguageContext'

export default function TagFilter({ tags, active, onChange, tagLabel }) {
  const { t } = useLanguage()
  if (tags.length === 0) return null
  return (
    <div className="tag-filter" role="group" aria-label={t('filters.label')}>
      <button type="button" className={!active ? 'is-active' : ''} aria-pressed={!active} onClick={() => onChange(null)}>
        {t('filters.all')}
      </button>
      {tags.map(tag => (
        <button
          key={tag}
          type="button"
          className={active === tag ? 'is-active' : ''}
          aria-pressed={active === tag}
          onClick={() => onChange(tag)}
        >
          {tagLabel(tag)}
        </button>
      ))}
    </div>
  )
}
