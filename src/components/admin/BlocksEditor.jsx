// Free-form content editor for project pages: add, reorder and remove blocks of text,
// headings, images, galleries, documents, videos, quotes, link buttons and dividers.
import CloudinaryUpload from './CloudinaryUpload'
import FirebaseUpload from './FirebaseUpload'
import { Field, ImagesField, TText } from './fields'
import { videoEmbedUrl } from '../shared/ContentBlocks'

export const BLOCK_TEXT_FIELDS = ['text', 'caption', 'title']

const BLOCK_TYPES = [
  { type: 'paragraph', label: 'Texto', icon: '¶' },
  { type: 'heading', label: 'Subtítulo', icon: 'H' },
  { type: 'image', label: 'Imagen', icon: '▣' },
  { type: 'gallery', label: 'Galería', icon: '▦' },
  { type: 'document', label: 'Documento', icon: '⎙' },
  { type: 'video', label: 'Video', icon: '▶' },
  { type: 'quote', label: 'Cita', icon: '❝' },
  { type: 'link', label: 'Botón / enlace', icon: '↗' },
  { type: 'divider', label: 'Separador', icon: '—' },
]
const LABELS = Object.fromEntries(BLOCK_TYPES.map(b => [b.type, b.label]))

const newBlock = type => ({
  id: `b${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
  type, text: '', caption: '', title: '', url: '', images: [], translations: {}, i18nMeta: {},
})

function BlockFields({ block, lang, set }) {
  const url = (label, placeholder, extra) => (
    <Field label={label}>
      <div className="adm-row">
        <input type="url" value={block.url || ''} placeholder={placeholder} onChange={e => set({ ...block, url: e.target.value })} />
        {extra}
      </div>
    </Field>
  )
  switch (block.type) {
    case 'paragraph':
      return (
        <Field label="Texto" hint="Separa párrafos con una línea en blanco. Usa la barra para negritas, enlaces y listas.">
          <TText obj={block} field="text" lang={lang} onChange={set} multiline rows={6} markdown />
        </Field>
      )
    case 'heading':
      return <Field label="Subtítulo"><TText obj={block} field="text" lang={lang} onChange={set} /></Field>
    case 'image':
      return (
        <>
          {url('Imagen', 'https://… (URL de imagen)', <CloudinaryUpload onUploadSuccess={({ url: u }) => set({ ...block, url: u })} />)}
          {block.url && <img className="adm-block-preview" src={block.url} alt="" />}
          <Field label="Pie de foto (opcional)"><TText obj={block} field="caption" lang={lang} onChange={set} /></Field>
          <label className="adm-check adm-check--inline">
            <input type="checkbox" checked={Boolean(block.wide)} onChange={e => set({ ...block, wide: e.target.checked })} />
            Imagen ancha
          </label>
        </>
      )
    case 'gallery':
      return (
        <>
          <Field label="Imágenes"><ImagesField images={block.images || []} onChange={images => set({ ...block, images })} /></Field>
          <Field label="Pie de galería (opcional)"><TText obj={block} field="caption" lang={lang} onChange={set} /></Field>
        </>
      )
    case 'document':
      return (
        <>
          {url('Archivo', 'https://… (o súbelo)', (
            <FirebaseUpload
              folder="portfolio_files"
              accept="*"
              label="Subir archivo"
              onUploadSuccess={({ url: u, name }) => set({ ...block, url: u, fileName: name, title: block.title || name.replace(/\.[^.]+$/, '') })}
            />
          ))}
          {block.fileName && <span className="adm-hint">Archivo: {block.fileName}</span>}
          <Field label="Título del documento"><TText obj={block} field="title" lang={lang} onChange={set} placeholder="Informe final" /></Field>
          <Field label="Descripción breve (opcional)"><TText obj={block} field="caption" lang={lang} onChange={set} placeholder="PDF · 12 páginas" /></Field>
          <label className="adm-check adm-check--inline">
            <input type="checkbox" checked={Boolean(block.preview)} onChange={e => set({ ...block, preview: e.target.checked })} />
            Mostrar vista previa en la página (solo PDF)
          </label>
        </>
      )
    case 'video':
      return (
        <>
          {url('Video (YouTube o Vimeo)', 'https://www.youtube.com/watch?v=…')}
          {block.url && !videoEmbedUrl(block.url) && <span className="adm-hint">No es un enlace de YouTube o Vimeo: se mostrará como botón.</span>}
          <Field label="Pie (opcional)"><TText obj={block} field="caption" lang={lang} onChange={set} /></Field>
        </>
      )
    case 'quote':
      return (
        <>
          <Field label="Cita"><TText obj={block} field="text" lang={lang} onChange={set} multiline rows={3} /></Field>
          <Field label="Autor (opcional)">
            <input type="text" value={block.cite || ''} onChange={e => set({ ...block, cite: e.target.value })} />
          </Field>
        </>
      )
    case 'link':
      return (
        <>
          {url('Enlace', 'https://…')}
          <Field label="Texto del botón"><TText obj={block} field="title" lang={lang} onChange={set} placeholder="Read the report" /></Field>
        </>
      )
    default:
      return <p className="adm-hint">Línea separadora entre secciones.</p>
  }
}

export default function BlocksEditor({ blocks = [], onChange, lang }) {
  const update = (index, next) => onChange(blocks.map((b, i) => (i === index ? next : b)))
  const move = (index, delta) => {
    const next = [...blocks]
    const [moved] = next.splice(index, 1)
    next.splice(index + delta, 0, moved)
    onChange(next)
  }
  const insert = (type, at = blocks.length) => {
    const next = [...blocks]
    next.splice(at, 0, newBlock(type))
    onChange(next)
  }

  return (
    <div className="adm-blocks">
      {blocks.length === 0 && <p className="adm-empty adm-empty--sm">Aún no hay contenido adicional. Agrega texto, imágenes, documentos o videos.</p>}
      {blocks.map((block, i) => (
        <div key={block.id ?? i} className="adm-card adm-block">
          <div className="adm-card-head">
            <span className="adm-block-type">{LABELS[block.type] || block.type}</span>
            <div className="adm-row">
              <button type="button" className="adm-btn adm-btn--icon" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Subir">↑</button>
              <button type="button" className="adm-btn adm-btn--icon" onClick={() => move(i, 1)} disabled={i === blocks.length - 1} aria-label="Bajar">↓</button>
              <button type="button" className="adm-btn adm-btn--icon adm-btn--danger" onClick={() => onChange(blocks.filter((_, j) => j !== i))} aria-label="Eliminar bloque">✕</button>
            </div>
          </div>
          <BlockFields block={block} lang={lang} set={next => update(i, next)} />
        </div>
      ))}
      <div className="adm-block-add">
        <span className="adm-muted adm-small">Agregar:</span>
        {BLOCK_TYPES.map(b => (
          <button key={b.type} type="button" className="adm-btn" onClick={() => insert(b.type)}>
            <span aria-hidden="true">{b.icon}</span> {b.label}
          </button>
        ))}
      </div>
    </div>
  )
}
