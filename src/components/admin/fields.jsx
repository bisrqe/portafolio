import { useRef, useState } from 'react'
import CloudinaryUpload from './CloudinaryUpload'
import { EDIT_LANGS, getText, setText, splitList } from './translate'

export function Field({ label, hint, children }) {
  return (
    <label className="adm-field">
      <span className="adm-label">{label}</span>
      {children}
      {hint && <span className="adm-hint">{hint}</span>}
    </label>
  )
}

export function LangTabs({ value, onChange }) {
  return (
    <div className="adm-langtabs" role="tablist" aria-label="Idioma de edición">
      {EDIT_LANGS.map(l => (
        <button
          key={l.code}
          type="button"
          role="tab"
          aria-selected={value === l.code}
          className={value === l.code ? 'is-active' : ''}
          onClick={() => onChange(l.code)}
        >
          {l.label}
        </button>
      ))}
    </div>
  )
}

/** Text input bound to a translatable field of `obj` for the selected language. */
export function TText({ obj, field, lang, onChange, multiline, rows = 4, required, placeholder }) {
  const value = getText(obj, field, lang)
  const original = obj?.[field] || ''
  const props = {
    value,
    required: required && lang === 'orig',
    placeholder: lang === 'orig' ? placeholder : (original ? `Original: ${original.slice(0, 80)}${original.length > 80 ? '…' : ''}` : ''),
    onChange: e => onChange(setText(obj, field, lang, e.target.value)),
  }
  return multiline ? <textarea rows={rows} {...props} /> : <input type="text" {...props} />
}

/** Comma-separated list input that keeps what the user types until blur. */
export function ListInput({ value = [], onChange, placeholder }) {
  const [draft, setDraft] = useState(null)
  return (
    <input
      type="text"
      placeholder={placeholder}
      value={draft ?? value.join(', ')}
      onChange={e => { setDraft(e.target.value); onChange(splitList(e.target.value)) }}
      onBlur={() => setDraft(null)}
    />
  )
}

/** Image list with upload, URL entry and removal. The first image is the cover. */
export function ImagesField({ images = [], onChange }) {
  const [url, setUrl] = useState('')
  const add = src => src && onChange([...images, src])
  const move = (from, to) => {
    const next = [...images]
    const [moved] = next.splice(from, 1)
    next.splice(to, 0, moved)
    onChange(next)
  }
  return (
    <div className="adm-images">
      {images.length > 0 && (
        <div className="adm-thumbs">
          {images.map((src, i) => (
            <figure key={`${src}-${i}`} className="adm-thumb">
              <img src={src} alt="" />
              {i === 0 && <span className="adm-thumb-badge">Portada</span>}
              <div className="adm-thumb-actions">
                {i > 0 && <button type="button" onClick={() => move(i, 0)} title="Usar como portada">★</button>}
                <button type="button" onClick={() => onChange(images.filter((_, j) => j !== i))} title="Quitar">✕</button>
              </div>
            </figure>
          ))}
        </div>
      )}
      <div className="adm-row">
        <input type="url" placeholder="https://… (URL de imagen)" value={url} onChange={e => setUrl(e.target.value)} />
        <button type="button" className="adm-btn" onClick={() => { add(url.trim()); setUrl('') }} disabled={!url.trim()}>Añadir URL</button>
        <CloudinaryUpload onUploadSuccess={data => add(data.url)} />
      </div>
    </div>
  )
}

/** Drag-to-reposition and zoom preview for the cover image (stored as positionX/Y and zoom). */
export function FramingEditor({ src, value, onChange }) {
  const drag = useRef(null)
  const { positionX = 0, positionY = 0, zoom = 1 } = value
  const clamp = (v, z) => Math.max(-(z - 1) * 50, Math.min((z - 1) * 50, v))

  const onPointerDown = e => {
    drag.current = { x: e.clientX, y: e.clientY }
    e.currentTarget.setPointerCapture(e.pointerId)
  }
  const onPointerMove = e => {
    if (!drag.current) return
    const dx = (e.clientX - drag.current.x) * 0.15
    const dy = (e.clientY - drag.current.y) * 0.15
    drag.current = { x: e.clientX, y: e.clientY }
    onChange({ positionX: Math.round(clamp(positionX + dx, zoom)), positionY: Math.round(clamp(positionY + dy, zoom)), zoom })
  }
  const setZoom = z => {
    const next = Math.round(Math.min(3, Math.max(1, z)) * 10) / 10
    onChange({ zoom: next, positionX: Math.round(clamp(positionX, next)), positionY: Math.round(clamp(positionY, next)) })
  }

  return (
    <div className="adm-framing">
      <div
        className="adm-framing-frame"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={() => { drag.current = null }}
      >
        <img src={src} alt="" draggable={false} style={{ transform: `translate(${positionX}%, ${positionY}%) scale(${zoom})` }} />
      </div>
      <div className="adm-row">
        <button type="button" className="adm-btn" onClick={() => setZoom(zoom - 0.1)} disabled={zoom <= 1}>−</button>
        <span className="adm-mono">{zoom.toFixed(1)}×</span>
        <button type="button" className="adm-btn" onClick={() => setZoom(zoom + 0.1)} disabled={zoom >= 3}>+</button>
        <button type="button" className="adm-btn" onClick={() => onChange({ positionX: 0, positionY: 0, zoom: 1 })}>Restablecer</button>
        <span className="adm-hint">Acerca la imagen y arrástrala para encuadrarla (X {positionX}% · Y {positionY}%).</span>
      </div>
    </div>
  )
}
