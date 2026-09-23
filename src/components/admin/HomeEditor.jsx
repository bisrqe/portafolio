import { useEffect, useState } from 'react'
import { deleteField } from 'firebase/firestore'
import { firestoreApi, HOME_PATH } from '../../hooks/useFirestore'
import {
  ABILITY_FIELDS, EXPERTISE_FIELDS, HIGHLIGHT_FIELDS, TOOLKIT_FIELDS, resolveHome,
} from '../../content/homeContent'
import CloudinaryUpload from './CloudinaryUpload'
import FirebaseUpload from './FirebaseUpload'
import { Field, LangTabs, ListEditor, ListInput, TText } from './fields'
import { cleanI18n, migrateLegacy } from './translate'
import { autoTranslate, countPending } from './autoTranslate'

const TOP_FIELDS = ['tagline', 'description', 'fullBio']
export const HOME_SCHEMA = {
  fields: TOP_FIELDS,
  lists: { expertiseAreas: EXPERTISE_FIELDS, highlights: HIGHLIGHT_FIELDS, toolkit: TOOLKIT_FIELDS, abilities: ABILITY_FIELDS },
}

function fromDoc(home) {
  const resolved = resolveHome(home)
  const top = migrateLegacy({
    name: resolved.name || '',
    tagline: resolved.tagline || '',
    description: resolved.description || '',
    fullBio: resolved.fullBio || '',
    heroImage: resolved.heroImage || '',
    translations: resolved.translations || {},
    i18nMeta: resolved.i18nMeta || {},
  }, TOP_FIELDS)
  const list = (items, fields) => items.map((x, i) => migrateLegacy({ ...x, id: x.id ?? `i${i}`, translations: x.translations || {}, i18nMeta: x.i18nMeta || {} }, fields))
  return {
    ...top,
    expertiseAreas: list(resolved.expertiseAreas, EXPERTISE_FIELDS),
    highlights: list(resolved.highlights, HIGHLIGHT_FIELDS),
    toolkit: list(resolved.toolkit, TOOLKIT_FIELDS),
    // The old emoji "icon" field is no longer shown and is dropped on save
    abilities: list(resolved.abilities, ABILITY_FIELDS).map(a => ({
      id: a.id, title: a.title || '', description: a.description || '', tags: a.tags || [], translations: a.translations, i18nMeta: a.i18nMeta,
    })),
  }
}

function toPayload(form) {
  const clean = items => items.map(cleanI18n)
  return {
    ...cleanI18n(form),
    expertiseAreas: clean(form.expertiseAreas),
    highlights: clean(form.highlights),
    toolkit: clean(form.toolkit),
    abilities: clean(form.abilities),
    achievements: deleteField(), // replaced by "highlights"
  }
}

export default function HomeEditor({ home, notify }) {
  const [form, setForm] = useState(() => fromDoc(home))
  const [lang, setLang] = useState('base')
  const [busy, setBusy] = useState('') // '' | 'saving' | 'translating'
  const [dirty, setDirty] = useState(false)

  // Refresh from Firestore when nothing is being edited
  useEffect(() => { if (!dirty) setForm(fromDoc(home)) }, [home, dirty])

  const update = next => { setForm(next); setDirty(true) }
  const setList = key => items => update({ ...form, [key]: items })
  const pending = countPending(form, HOME_SCHEMA)

  const translateNow = async () => {
    setBusy('translating')
    const { result, count, error } = await autoTranslate(form, HOME_SCHEMA)
    update(result)
    setBusy('')
    if (error) notify(`Traducción automática incompleta: ${error}`, 'error')
    else notify(count ? `${count === 1 ? '1 texto traducido' : `${count} textos traducidos`}. Revísalos en las pestañas ES y FR.` : 'No había textos pendientes de traducir.')
  }

  const save = async e => {
    e.preventDefault()
    setBusy('saving')
    const { result, count, error } = await autoTranslate(form, HOME_SCHEMA)
    setForm(result)
    try {
      await firestoreApi.save(HOME_PATH, toPayload(result))
      setDirty(false)
      if (error) notify(`Guardado, pero la traducción automática falló (${error}). Se mostrará el inglés hasta traducir.`, 'error')
      else notify(count ? `Página de inicio guardada; ${count === 1 ? '1 texto traducido' : `${count} textos traducidos`} automáticamente.` : 'Página de inicio guardada.')
    } catch (err) {
      notify(`No se pudo guardar: ${err.message}`, 'error')
    } finally {
      setBusy('')
    }
  }

  const saveCv = async ({ url }) => {
    await firestoreApi.save(HOME_PATH, { cvUrl: url })
    notify('CV actualizado.')
  }

  return (
    <form className="adm-panel" onSubmit={save}>
      <div className="adm-panel-head">
        <h2>Página de inicio</h2>
        <div className="adm-row">
          <button type="button" className="adm-btn" onClick={translateNow} disabled={Boolean(busy) || pending === 0}>
            {busy === 'translating' ? 'Traduciendo…' : `Traducir ahora${pending ? ` (${pending})` : ''}`}
          </button>
          <LangTabs value={lang} onChange={setLang} />
        </div>
      </div>
      <p className="adm-hint">
        Escribe en inglés (pestaña «EN · base»). Al guardar, el español y el francés se traducen automáticamente; puedes corregirlos
        en sus pestañas y tus cambios se conservan. Si luego modificas el inglés, esos textos se marcan para revisión.
      </p>

      <div className="adm-grid-2">
        <Field label="Nombre *">
          <input type="text" value={form.name} required onChange={e => update({ ...form, name: e.target.value })} placeholder="Bismarck Animas" />
        </Field>
        <Field label="Titular *">
          <TText obj={form} field="tagline" lang={lang} onChange={update} required placeholder="Digital transformation, data & leadership" />
        </Field>
      </div>
      <Field label="Descripción breve (hero)">
        <TText obj={form} field="description" lang={lang} onChange={update} multiline rows={3} />
      </Field>
      <Field label="Biografía («Quién soy»)" hint="Separa los párrafos con una línea en blanco.">
        <TText obj={form} field="fullBio" lang={lang} onChange={update} multiline rows={6} />
      </Field>

      <div className="adm-grid-2">
        <Field label="Imagen principal">
          <div className="adm-row">
            <input type="url" value={form.heroImage} onChange={e => update({ ...form, heroImage: e.target.value })} placeholder="https://…" />
            <CloudinaryUpload onUploadSuccess={({ url }) => update({ ...form, heroImage: url })} />
          </div>
          {form.heroImage && <img className="adm-hero-preview" src={form.heroImage} alt="" />}
        </Field>
        <Field label="CV (PDF)" hint="Se guarda de inmediato al subirlo.">
          <div className="adm-row">
            <FirebaseUpload onUploadSuccess={saveCv} label="Subir CV" />
            {home.cvUrl && <a className="adm-link" href={home.cvUrl} target="_blank" rel="noopener noreferrer">Ver CV actual</a>}
          </div>
        </Field>
      </div>

      <h3 className="adm-subhead">Áreas clave de especialización <span className="adm-muted adm-small">(sección «Quién soy»)</span></h3>
      <ListEditor
        items={form.expertiseAreas}
        onChange={setList('expertiseAreas')}
        lang={lang}
        columns={1}
        fields={[
          { field: 'title', label: 'Título', placeholder: 'Data & Machine Learning' },
          { field: 'description', label: 'Descripción', multiline: true },
        ]}
        newItem={() => ({ title: '', description: '', translations: {}, i18nMeta: {} })}
        addLabel="Agregar área"
      />

      <h3 className="adm-subhead">Logros y reconocimientos</h3>
      <ListEditor
        items={form.highlights}
        onChange={setList('highlights')}
        lang={lang}
        fields={[
          { field: 'value', label: 'Dato destacado', placeholder: '2nd place · Top 5 · 30+' },
          { field: 'label', label: 'Título', placeholder: 'Hey Banco Datathon 2026' },
          { field: 'detail', label: 'Detalle (opcional)', multiline: true, rows: 2 },
        ]}
        renderExtra={(item, set) => (
          <Field label="Tipo">
            <select className="adm-select" value={item.kind || 'award'} onChange={e => set({ ...item, kind: e.target.value })}>
              <option value="award">Reconocimiento (con ícono)</option>
              <option value="metric">Cifra (número grande)</option>
            </select>
          </Field>
        )}
        newItem={() => ({ kind: 'award', value: '', label: '', detail: '', translations: {}, i18nMeta: {} })}
        addLabel="Agregar logro o reconocimiento"
      />

      <h3 className="adm-subhead">Habilidades <span className="adm-muted adm-small">(tarjetas)</span></h3>
      <ListEditor
        items={form.abilities}
        onChange={setList('abilities')}
        lang={lang}
        fields={[
          { field: 'title', label: 'Título' },
          { field: 'description', label: 'Descripción', multiline: true, rows: 2 },
        ]}
        renderExtra={(item, set) => (
          <Field label="Etiquetas (separadas por comas)">
            <ListInput value={item.tags} onChange={tags => set({ ...item, tags })} placeholder="Python, Power BI, SQL" />
          </Field>
        )}
        newItem={() => ({ title: '', description: '', tags: [], translations: {}, i18nMeta: {} })}
        addLabel="Agregar habilidad"
      />

      <h3 className="adm-subhead">Herramientas técnicas</h3>
      <ListEditor
        items={form.toolkit}
        onChange={setList('toolkit')}
        lang={lang}
        fields={[
          { field: 'label', label: 'Categoría', placeholder: 'Programming' },
          { field: 'items', label: 'Elementos (separados por comas)', placeholder: 'Python, SQL, Java' },
        ]}
        newItem={() => ({ label: '', items: '', translations: {}, i18nMeta: {} })}
        addLabel="Agregar categoría"
      />

      <div className="adm-actions">
        {dirty && <span className="adm-muted adm-small">Cambios sin guardar</span>}
        <button type="submit" className="adm-btn adm-btn--primary adm-btn--lg" disabled={Boolean(busy)}>
          {busy === 'saving' ? 'Guardando y traduciendo…' : 'Guardar inicio'}
        </button>
      </div>
    </form>
  )
}
