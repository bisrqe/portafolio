import { useMemo, useState } from 'react'
import { firestoreApi } from '../../hooks/useFirestore'
import { getImages } from '../shared/media'
import { sortItems } from '../shared/sort'
import { Field, FramingEditor, ImagesField, LangTabs, ListEditor, ListInput, TText } from './fields'
import { cleanI18n, migrateLegacy, toPayload } from './translate'
import BlocksEditor, { BLOCK_TEXT_FIELDS } from './BlocksEditor'
import { autoTranslate, countPending } from './autoTranslate'
import { schedulePublish } from './publish'
import { KIND_BASE, resolveSlugs, slugify } from '../../content/items'

const CONFIG = {
  projects: { singular: 'proyecto', title: 'Proyectos', hasRole: false, hasSdg: false },
  leadership: { singular: 'experiencia de liderazgo', title: 'Liderazgo', hasRole: true, hasSdg: true },
}

const emptyItem = () => ({
  title: '', role: '', summary: '', description: '', slug: '', link: '', images: [], tags: [], sdg: [],
  startDate: '', endDate: '', current: false, skills: '', collaborators: [], blocks: [],
  featured: false, order: '', positionX: 0, positionY: 0, zoom: 1, translations: {}, i18nMeta: {},
})

const TEXT_FIELDS = ['title', 'role', 'summary', 'description', 'skills']
const schemaFor = cfg => ({
  fields: TEXT_FIELDS.filter(f => cfg.hasRole || f !== 'role'),
  lists: { collaborators: ['role'], blocks: BLOCK_TEXT_FIELDS },
})

// Existing entries without a saved slug get the one the public site already uses
function toForm(item, slugs) {
  const images = getImages(item)
  const form = {
    ...emptyItem(), ...item, images, order: item.order ?? '', slug: item.slug || slugs?.get(item.id) || '',
    translations: item.translations || {}, i18nMeta: item.i18nMeta || {},
  }
  form.collaborators = (form.collaborators || []).map((c, i) => ({ id: c.id ?? `c${i}`, name: '', url: '', role: '', translations: {}, i18nMeta: {}, ...c }))
  form.blocks = (form.blocks || []).map((b, i) => ({ id: b.id ?? `b${i}`, translations: {}, i18nMeta: {}, ...b }))
  return migrateLegacy(form, TEXT_FIELDS)
}

// Unique URL slug among the other entries of the collection
function uniqueSlug(form, items) {
  const base = slugify(form.slug || form.title) || 'item'
  const taken = new Set([...resolveSlugs(items.filter(i => i.id !== form.id)).values()])
  let slug = base
  for (let n = 2; taken.has(slug); n++) slug = `${base}-${n}`
  return slug
}

const SUMMARY_MAX = 220

export default function ItemsEditor({ collectionName, items, notify }) {
  const cfg = CONFIG[collectionName]
  const [form, setForm] = useState(null) // null = list view
  const [lang, setLang] = useState('base')
  const [busy, setBusy] = useState('') // '' | 'saving' | 'translating' | 'bulk'
  const sorted = useMemo(() => sortItems(items), [items])
  const schema = useMemo(() => schemaFor(cfg), [cfg])
  const slugs = useMemo(() => resolveSlugs(items), [items])
  const pendingItems = useMemo(() => sorted.map(i => toForm(i, slugs)).filter(item => countPending(item, schema) > 0), [sorted, schema, slugs])

  const openNew = () => { setForm(emptyItem()); setLang('base') }
  const openEdit = item => { setForm(toForm(item, slugs)); setLang('base') }
  const close = () => setForm(null)

  const translateNow = async () => {
    setBusy('translating')
    const { result, count, error } = await autoTranslate(form, schema)
    setForm(result)
    setBusy('')
    if (error) notify(`Traducción automática incompleta: ${error}`, 'error')
    else notify(count ? `${count === 1 ? '1 texto traducido' : `${count} textos traducidos`}. Revísalos en las pestañas ES y FR.` : 'No había textos pendientes de traducir.')
  }

  // Translates every saved item that still has missing or outdated automatic translations
  const translateAll = async () => {
    setBusy('bulk')
    let done = 0
    let failed = ''
    for (const item of pendingItems) {
      const { result, error } = await autoTranslate(item, schema)
      if (error) { failed = error; break }
      const { translations, i18nMeta } = toPayload(result)
      try {
        await firestoreApi.update(collectionName, item.id, { translations, i18nMeta })
        done++
        schedulePublish()
      } catch (err) {
        failed = err.message
        break
      }
    }
    setBusy('')
    if (failed) notify(`Se tradujeron ${done} elementos; después falló: ${failed}`, 'error')
    else notify(`${done} elementos traducidos al español y al francés.`)
  }

  const save = async e => {
    e.preventDefault()
    setBusy('saving')
    const { result: translated, count, error } = await autoTranslate(form, schema)
    setForm(translated)
    const payload = toPayload(translated)
    payload.collaborators = translated.collaborators.filter(c => c.name?.trim()).map(cleanI18n)
    payload.blocks = translated.blocks.map(cleanI18n)
    if (payload.current) payload.endDate = ''
    payload.slug = uniqueSlug(translated, items)
    payload.image = payload.images[0] || ''
    payload.order = payload.order === '' ? null : Number(payload.order)
    if (!cfg.hasRole) delete payload.role
    if (!cfg.hasSdg) delete payload.sdg
    try {
      if (form.id) await firestoreApi.update(collectionName, form.id, payload)
      else await firestoreApi.add(collectionName, payload)
      schedulePublish()
      const base = form.id ? 'Cambios guardados' : `Nuevo ${cfg.singular} publicado`
      if (error) notify(`${base}, pero la traducción automática falló (${error}). Se mostrará el inglés hasta traducir.`, 'error')
      else notify(count ? `${base}; ${count === 1 ? '1 texto traducido' : `${count} textos traducidos`} automáticamente.` : `${base}.`)
      close()
    } catch (err) {
      notify(`No se pudo guardar: ${err.message}`, 'error')
    } finally {
      setBusy('')
    }
  }

  const remove = async item => {
    if (!window.confirm(`¿Eliminar «${item.title || 'sin título'}»? Esta acción no se puede deshacer.`)) return
    try {
      await firestoreApi.remove(collectionName, item.id)
      schedulePublish()
      notify('Elemento eliminado.')
    } catch (err) {
      notify(`No se pudo eliminar: ${err.message}`, 'error')
    }
  }

  if (form) {
    const cover = form.images[0]
    return (
      <form className="adm-panel" onSubmit={save}>
        <div className="adm-panel-head">
          <h2>{form.id ? `Editar ${cfg.singular}` : `Nuevo ${cfg.singular}`}</h2>
          <div className="adm-row">
            <button type="button" className="adm-btn" onClick={translateNow} disabled={Boolean(busy) || countPending(form, schema) === 0}>
              {busy === 'translating' ? 'Traduciendo…' : 'Traducir ahora'}
            </button>
            <LangTabs value={lang} onChange={setLang} />
          </div>
        </div>
        <p className="adm-hint">
          Escribe en inglés. Al guardar, el español y el francés se traducen automáticamente; puedes corregirlos en sus pestañas.
          Imágenes, enlaces y etiquetas son comunes a todos los idiomas.
        </p>

        <h3 className="adm-subhead">Información principal</h3>
        <div className={cfg.hasRole ? 'adm-grid-2' : ''}>
          <Field label="Título *">
            <TText obj={form} field="title" lang={lang} onChange={setForm} required />
          </Field>
          {cfg.hasRole && (
            <Field label="Rol *">
              <TText obj={form} field="role" lang={lang} onChange={setForm} required placeholder="Initiatives Coordinator" />
            </Field>
          )}
        </div>
        <Field
          label="Resumen corto (tarjetas y buscadores)"
          hint={`Opcional, hasta ~${SUMMARY_MAX} caracteres (${(lang === 'base' ? form.summary : form.translations?.[lang]?.summary || '').length}). Si está vacío, se usa el inicio de la descripción.`}
        >
          <TText obj={form} field="summary" lang={lang} onChange={setForm} multiline rows={2} />
        </Field>

        <h3 className="adm-subhead">Detalles</h3>
        <div className="adm-grid-3">
          <Field label="Inicio">
            <input type="month" value={form.startDate || ''} onChange={e => setForm({ ...form, startDate: e.target.value })} />
          </Field>
          <Field label="Fin">
            <input type="month" value={form.current ? '' : (form.endDate || '')} disabled={form.current} onChange={e => setForm({ ...form, endDate: e.target.value })} />
          </Field>
          <label className="adm-check">
            <input type="checkbox" checked={Boolean(form.current)} onChange={e => setForm({ ...form, current: e.target.checked })} />
            Sigue en curso
          </label>
        </div>
        <Field label="Habilidades desarrolladas (separadas por comas)" hint="Se muestran como etiquetas en «Detalles» y se traducen automáticamente.">
          <TText obj={form} field="skills" lang={lang} onChange={setForm} placeholder="Stakeholder management, Curriculum design, Public speaking" />
        </Field>
        <Field label="Colaboradores (personas u organizaciones)">
          <ListEditor
            items={form.collaborators}
            onChange={collaborators => setForm({ ...form, collaborators })}
            lang={lang}
            fields={[
              { field: 'name', label: 'Nombre', translatable: false, placeholder: 'Tec de Monterrey · Ruta Azul' },
              { field: 'role', label: 'Rol o relación (opcional)', placeholder: 'Partner organization' },
            ]}
            renderExtra={(person, set) => (
              <Field label="Enlace (opcional)">
                <input type="url" value={person.url || ''} placeholder="https://linkedin.com/in/…" onChange={e => set({ ...person, url: e.target.value })} />
              </Field>
            )}
            newItem={() => ({ name: '', role: '', url: '', translations: {}, i18nMeta: {} })}
            addLabel="Agregar colaborador"
          />
        </Field>

        <h3 className="adm-subhead">Contenido de la página</h3>
        <Field label="Descripción principal" hint="Aparece primero en la página del proyecto. Admite negritas, cursivas, enlaces, listas y subtítulos.">
          <TText obj={form} field="description" lang={lang} onChange={setForm} multiline rows={10} markdown />
        </Field>
        <Field label="Contenido adicional" hint="Bloques que aparecen debajo de la descripción, en este orden.">
          <BlocksEditor blocks={form.blocks} onChange={blocks => setForm({ ...form, blocks })} lang={lang} />
        </Field>

        <h3 className="adm-subhead">Portada e imágenes de la tarjeta</h3>
        <Field label="Imágenes" hint="La primera imagen es la portada; las demás aparecen en el carrusel de la tarjeta y en la galería superior de la página.">
          <ImagesField images={form.images} onChange={images => setForm({ ...form, images })} />
        </Field>
        {cover && (
          <Field label="Encuadre de la portada">
            <FramingEditor src={cover} value={form} onChange={framing => setForm({ ...form, ...framing })} />
          </Field>
        )}

        <h3 className="adm-subhead">Publicación</h3>
        <div className="adm-grid-2">
          <Field label="Dirección de la página" hint={`${KIND_BASE[collectionName]}/${slugify(form.slug || form.title) || '…'}  ·  cambiarla rompe los enlaces ya compartidos`}>
            <input type="text" value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} placeholder={slugify(form.title)} />
          </Field>
          <Field label="Enlace externo (botón «Visitar proyecto»)">
            <input type="url" value={form.link} onChange={e => setForm({ ...form, link: e.target.value })} placeholder="https://…" />
          </Field>
          <Field label="Etiquetas (separadas por comas)" hint="Los nombres de las etiquetas se traducen en la pestaña «Etiquetas».">
            <ListInput value={form.tags} onChange={tags => setForm({ ...form, tags })} placeholder="Professional Experience, Hackathons" />
          </Field>
          {cfg.hasSdg && (
            <Field label="ODS (opcional, separados por comas)">
              <ListInput value={form.sdg} onChange={sdg => setForm({ ...form, sdg })} placeholder="SDG 4, SDG 13" />
            </Field>
          )}
          <label className="adm-check">
            <input type="checkbox" checked={Boolean(form.featured)} onChange={e => setForm({ ...form, featured: e.target.checked })} />
            Destacar en la página de inicio
          </label>
          <Field label="Orden (opcional)" hint="Número menor = aparece primero. Vacío = por fechas, lo más reciente primero.">
            <input type="number" className="adm-w-sm" value={form.order ?? ''} onChange={e => setForm({ ...form, order: e.target.value })} />
          </Field>
        </div>

        <div className="adm-actions">
          <button type="button" className="adm-btn" onClick={close}>Cancelar</button>
          <button type="submit" className="adm-btn adm-btn--primary adm-btn--lg" disabled={Boolean(busy)}>{busy === 'saving' ? 'Guardando y traduciendo…' : 'Guardar'}</button>
        </div>
      </form>
    )
  }

  return (
    <section className="adm-panel">
      <div className="adm-panel-head">
        <h2>{cfg.title}</h2>
        <div className="adm-row">
          {pendingItems.length > 0 && (
            <button type="button" className="adm-btn" onClick={translateAll} disabled={Boolean(busy)} title="Traduce al español y al francés los elementos que aún no tienen traducción">
              {busy === 'bulk' ? 'Traduciendo…' : `Traducir pendientes (${pendingItems.length})`}
            </button>
          )}
          <button type="button" className="adm-btn adm-btn--primary" onClick={openNew}>+ Agregar</button>
        </div>
      </div>

      {sorted.length === 0 ? (
        <p className="adm-empty">Aún no hay elementos.</p>
      ) : (
        <ul className="adm-list">
          {sorted.map(item => {
            const cover = getImages(item)[0]
            const langs = Object.keys(item.translations || {}).filter(l => l !== 'en')
            return (
              <li key={item.id} className="adm-list-item">
                <div className="adm-list-thumb">{cover ? <img src={cover} alt="" /> : <span>—</span>}</div>
                <div className="adm-list-body">
                  <strong>{item.title || 'Sin título'}</strong>
                  {item.role && <span className="adm-muted adm-small">{item.role}</span>}
                  <div className="adm-badges">
                    {item.featured && <span className="adm-badge adm-badge--accent">Destacado</span>}
                    {item.order != null && item.order !== '' && <span className="adm-badge">#{item.order}</span>}
                    {['es', 'fr'].map(l => (
                      <span key={l} className={`adm-badge ${langs.includes(l) ? 'adm-badge--ok' : 'adm-badge--off'}`} title={langs.includes(l) ? 'Traducción guardada' : 'Sin traducción'}>
                        {l.toUpperCase()}
                      </span>
                    ))}
                    {(item.tags || []).map(tag => <span key={tag} className="adm-badge">{tag}</span>)}
                  </div>
                </div>
                <div className="adm-list-actions">
                  <button type="button" className="adm-btn" onClick={() => openEdit(item)}>Editar</button>
                  <button type="button" className="adm-btn adm-btn--danger" onClick={() => remove(item)}>Eliminar</button>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
