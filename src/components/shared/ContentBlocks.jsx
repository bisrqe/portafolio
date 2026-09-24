// Renders the free-form content of a project page: text, headings, images, galleries,
// documents, videos, quotes, link buttons and dividers (edited in /admin → "Contenido").
import { useLanguage } from '../../i18n/LanguageContext'
import { Markdown } from '../../content/markdown'
import Icon from './Icon'

// YouTube / Vimeo URL → privacy-friendly embed URL (null for anything else)
export function videoEmbedUrl(url = '') {
  const yt = /(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{6,})/.exec(url)
  if (yt) return `https://www.youtube-nocookie.com/embed/${yt[1]}`
  const vimeo = /vimeo\.com\/(?:video\/)?(\d+)/.exec(url)
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`
  return null
}

const fileExtension = (name = '', url = '') => ((name || url.split('?')[0]).split('.').pop() || '').slice(0, 5).toUpperCase()

function Caption({ text }) {
  return text ? <figcaption>{text}</figcaption> : null
}

function Block({ block, onExpand }) {
  const { t, pick } = useLanguage()
  const text = pick(block, 'text')
  const caption = pick(block, 'caption')
  const title = pick(block, 'title')

  switch (block.type) {
    case 'heading':
      return text ? <h2 className="cb-heading">{text}</h2> : null
    case 'paragraph':
      return text ? <Markdown text={text} className="cb-text" /> : null
    case 'image':
      return block.url ? (
        <figure className={`cb-figure ${block.wide ? 'cb-figure--wide' : ''}`}>
          <button type="button" className="cb-image" onClick={() => onExpand?.(block.url)} aria-label={t('common.expand')}>
            <img src={block.url} alt={caption || title || ''} loading="lazy" />
          </button>
          <Caption text={caption} />
        </figure>
      ) : null
    case 'gallery':
      return block.images?.length ? (
        <figure className="cb-figure">
          <div className="cb-gallery">
            {block.images.map(src => (
              <button key={src} type="button" className="cb-image" onClick={() => onExpand?.(src)} aria-label={t('common.expand')}>
                <img src={src} alt={caption || ''} loading="lazy" />
              </button>
            ))}
          </div>
          <Caption text={caption} />
        </figure>
      ) : null
    case 'document': {
      if (!block.url) return null
      const ext = fileExtension(block.fileName, block.url)
      return (
        <div className="cb-document">
          <a className="cb-doc-card" href={block.url} target="_blank" rel="noopener noreferrer">
            <span className="cb-doc-icon"><Icon name="file" size={22} /></span>
            <span className="cb-doc-info">
              <strong>{title || block.fileName || t('detail.openDocument')}</strong>
              <span>{[ext, caption].filter(Boolean).join(' · ')}</span>
            </span>
            <span className="cb-doc-action">{t('detail.openDocument')} <Icon name="external" size={16} /></span>
          </a>
          {block.preview && ext === 'PDF' && (
            <iframe className="cb-pdf" src={`${block.url}#view=FitH`} title={title || block.fileName || 'PDF'} loading="lazy" />
          )}
        </div>
      )
    }
    case 'video': {
      const embed = videoEmbedUrl(block.url)
      if (!block.url) return null
      return (
        <figure className="cb-figure">
          {embed ? (
            <div className="cb-video">
              <iframe
                src={embed}
                title={caption || t('detail.video')}
                loading="lazy"
                allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            <a className="btn btn--ghost" href={block.url} target="_blank" rel="noopener noreferrer"><Icon name="play" /> {caption || t('detail.video')}</a>
          )}
          {embed && <Caption text={caption} />}
        </figure>
      )
    }
    case 'quote':
      return text ? (
        <blockquote className="cb-quote">
          <p>{text}</p>
          {block.cite && <cite>{block.cite}</cite>}
        </blockquote>
      ) : null
    case 'link':
      return block.url ? (
        <p className="cb-link">
          <a className="btn btn--ghost" href={block.url} target="_blank" rel="noopener noreferrer">{title || block.url} <Icon name="external" /></a>
        </p>
      ) : null
    case 'divider':
      return <hr className="cb-divider" />
    default:
      return null
  }
}

export default function ContentBlocks({ blocks = [], onExpand }) {
  if (!blocks.length) return null
  return (
    <div className="content-blocks">
      {blocks.map((block, i) => <Block key={block.id ?? i} block={block} onExpand={onExpand} />)}
    </div>
  )
}
