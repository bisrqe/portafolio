import { useEffect } from 'react'
import { useLanguage } from '../../i18n/LanguageContext'
import Icon from './Icon'

export default function Lightbox({ src, alt = '', onClose }) {
  const { t } = useLanguage()

  useEffect(() => {
    if (!src) return undefined
    const onKey = e => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [src, onClose])

  if (!src) return null
  return (
    <div className="lightbox" role="dialog" aria-modal="true" onClick={onClose}>
      <button type="button" className="icon-btn lightbox-close" onClick={onClose} aria-label={t('common.close')}>
        <Icon name="close" size={20} />
      </button>
      <img src={src} alt={alt} onClick={e => e.stopPropagation()} />
    </div>
  )
}
