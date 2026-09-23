import { useRef, useState } from 'react'
import CloudinaryUpload from './CloudinaryUpload'
import { EDIT_LANGS, fieldStatus, getText, setText, splitList } from './translate'
import { retranslateField } from './autoTranslate'

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

const STATUS = {
  pending: { label: 'Se traducirá al guardar', cls: 'adm-badge--warn' },
  auto: { label: 'Traducción automática', cls: 'adm-badge--ok' },
  manual: { label: 'Editada a mano', cls: 'adm-badge--accent' },
  outdated: { label: 'Revisar: el inglés cambió', cls: 'adm-badge--warn' },
}

/**
 * Text input bound to a translatable field of `obj` for the selected language.
 * In ES/FR it shows the translation status and a button to re-translate from English.
 */
export function TText({ obj, field, lang, onChange, multiline, rows = 4, required, placeholder }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const value = getText(obj, field, lang)
  const base = obj?.[field] || ''
  const isBase = lang === 'base'
  const props = {
    value,
    required: required && isBase,
    placeholder: isBase ? placeholder : (base ? `EN: ${base.slice(0, 90)}${base.length > 90 ? '…' : ''}` : ''),
    onChange: e => onChange(setText(obj, field, lang, e.target.value)),
  }
  const input = multiline ? <textarea rows={rows} {...props} /> : <input type="text" {...props} />
  if (isBase) return input

  const status = STATUS[fieldStatus(obj, field, lang)]
  const retranslate = async () => {
    setBusy(true)
    setError('')
    try {
      onChange(await retranslateField(obj, field, lang))
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }
  return (
    <div className="adm-ttext">
      {input}
      <div className="adm-ttext-meta">
        {status && <span className={`adm-badge ${status.cls}`}>{status.label}</span>}
        {base.trim() && (
          <button type="button" className="adm-textbtn" onClick={retranslate} disabled={busy}>
            {busy ? 'Traduciendo…' : '↻ Traducir desde el inglés'}
          </button>
        )}
        {error && <span className="adm-error">{error}</span>}
      </div>
    </div>
  )
}

/**
 * Repeating list of translatable items (key areas, highlights, toolkit rows, skills).
 * fields: [{ field, label, multiline?, placeholder?, translatable? }]
 */
export function ListEditor({ items, onChange, lang, fields, newItem, addLabel, renderExtra, columns = 2 }) {
  const update = (index, next) => onChange(items.map((item, i) => (i === index ? next : item)))
  const move = (index, delta) => {
    const next = [...items]
    const [moved] = next.splice(index, 1)
    next.splice(index + delta, 0, moved)
    onChange(next)
  }
  return (
    <div className="adm-listeditor">
      {items.map((item, i) => (
        <div key={item.id ?? i} className="adm-card">
          <div className="adm-card-head">
            <span className="adm-mono adm-muted">{String(i + 1).padStart(2, '0')}</span>
            <div className="adm-row">
              <button type="button" className="adm-btn adm-btn--icon" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Subir">↑</button>
              <button type="button" className="adm-btn adm-btn--icon" onClick={() => move(i, 1)} disabled={i === items.length - 1} aria-label="Bajar">↓</button>
              <button type="button" className="adm-btn adm-btn--icon adm-btn--danger" onClick={() => onChange(items.filter((_, j) => j !== i))} aria-label="Eliminar">✕</button>
            </div>
          </div>
          <div className={columns === 2 ? 'adm-grid-2' : 'adm-grid-1'}>
            {fields.filter(f => !f.multiline).map(f => (
              <Field key={f.field} label={f.label}>
                {f.translatable === false
                  ? <input type="text" value={item[f.field] || ''} placeholder={f.placeholder} onChange={e => update(i, { ...item, [f.field]: e.target.value })} />
                  : <TText obj={item} field={f.field} lang={lang} placeholder={f.placeholder} onChange={next => update(i, next)} />}
              </Field>
            ))}
            {renderExtra?.(item, next => update(i, next))}
          </div>
          {fields.filter(f => f.multiline).map(f => (
            <Field key={f.field} label={f.label}>
              <TText obj={item} field={f.field} lang={lang} multiline rows={f.rows || 3} placeholder={f.placeholder} onChange={next => update(i, next)} />
            </Field>
          ))}
        </div>
      ))}
      <button type="button" className="adm-btn" onClick={() => onChange([...items, { ...newItem(), id: `n${Date.now()}` }])}>
        + {addLabel}
      </button>
    </div>
  )
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
