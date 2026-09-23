import { useEffect, useState } from 'react'
import { firestoreApi } from '../../hooks/useFirestore'
import { HOME_PATH } from '../../hooks/useFirestore'
import CloudinaryUpload from './CloudinaryUpload'
import FirebaseUpload from './FirebaseUpload'
import { Field, LangTabs, ListInput, TText } from './fields'
import { cleanTranslations } from './translate'

const EMPTY = { name: '', tagline: '', description: '', fullBio: '', heroImage: '', achievements: [], abilities: [], translations: {} }
const uid = () => Date.now() + Math.floor(Math.random() * 1000)

function fromDoc(home) {
  return {
    ...EMPTY,
    name: home.name || '',
    tagline: home.tagline || '',
    description: home.description || '',
    fullBio: home.fullBio || '',
    heroImage: home.heroImage || '',
    translations: home.translations || {},
    achievements: (home.achievements || []).map(a => ({ id: a.id ?? uid(), number: a.number || '', label: a.label || '', translations: a.translations || {} })),
    // The old "icon" field is no longer shown on the site and is dropped on save
    abilities: (home.abilities || []).map(a => ({ id: a.id ?? uid(), title: a.title || '', description: a.description || '', tags: a.tags || [], translations: a.translations || {} })),
  }
}

export default function HomeEditor({ home, notify }) {
  const [form, setForm] = useState(() => fromDoc(home))
  const [lang, setLang] = useState('orig')
  const [saving, setSaving] = useState(false)
  const [dirty, setDirty] = useState(false)

  // Refresh from Firestore when nothing is being edited
  useEffect(() => { if (!dirty) setForm(fromDoc(home)) }, [home, dirty])

  const update = next => { setForm(next); setDirty(true) }
  const updateList = (key, index, next) => update({ ...form, [key]: form[key].map((x, i) => (i === index ? next : x)) })
  const removeFromList = (key, index) => update({ ...form, [key]: form[key].filter((_, i) => i !== index) })

  const save = async e => {
    e.preventDefault()
    setSaving(true)
    try {
      await firestoreApi.save(HOME_PATH, {
        ...form,
        translations: cleanTranslations(form.translations),
        achievements: form.achievements.map(a => ({ ...a, translations: cleanTranslations(a.translations) })),
        abilities: form.abilities.map(a => ({ ...a, translations: cleanTranslations(a.translations) })),
      })
      setDirty(false)
      notify('Página de inicio guardada.')
    } catch (err) {
      notify(`No se pudo guardar: ${err.message}`, 'error')
    } finally {
      setSaving(false)
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
        <LangTabs value={lang} onChange={setLang} />
      </div>
      <p className="adm-hint">
        «Original» es el texto base. Las pestañas EN, ES y FR guardan traducciones; si una está vacía, el sitio muestra el texto original.
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
      <Field label="Biografía completa (sección «Quién soy»)" hint="Separa los párrafos con una línea en blanco.">
        <TText obj={form} field="fullBio" lang={lang} onChange={update} multiline rows={7} />
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

      <h3 className="adm-subhead">Logros (cifras)</h3>
      {form.achievements.map((a, i) => (
        <div key={a.id} className="adm-repeat">
          <input type="text" className="adm-w-sm" value={a.number} placeholder="30+" onChange={e => updateList('achievements', i, { ...a, number: e.target.value })} />
          <TText obj={a} field="label" lang={lang} onChange={next => updateList('achievements', i, next)} placeholder="Proyectos entregados" />
          <button type="button" className="adm-btn adm-btn--danger" onClick={() => removeFromList('achievements', i)} aria-label="Eliminar logro">✕</button>
        </div>
      ))}
      <button type="button" className="adm-btn" onClick={() => update({ ...form, achievements: [...form.achievements, { id: uid(), number: '', label: '', translations: {} }] })}>
        + Agregar logro
      </button>

      <h3 className="adm-subhead">Habilidades</h3>
      {form.abilities.map((a, i) => (
        <div key={a.id} className="adm-card">
          <div className="adm-grid-2">
            <Field label={`Título ${String(i + 1).padStart(2, '0')}`}>
              <TText obj={a} field="title" lang={lang} onChange={next => updateList('abilities', i, next)} />
            </Field>
            <Field label="Etiquetas (separadas por comas)">
              <ListInput value={a.tags} onChange={tags => updateList('abilities', i, { ...a, tags })} placeholder="Python, Power BI, SQL" />
            </Field>
          </div>
          <Field label="Descripción">
            <TText obj={a} field="description" lang={lang} onChange={next => updateList('abilities', i, next)} multiline rows={2} />
          </Field>
          <button type="button" className="adm-btn adm-btn--danger" onClick={() => removeFromList('abilities', i)}>Eliminar habilidad</button>
        </div>
      ))}
      <button type="button" className="adm-btn" onClick={() => update({ ...form, abilities: [...form.abilities, { id: uid(), title: '', description: '', tags: [], translations: {} }] })}>
        + Agregar habilidad
      </button>

      <div className="adm-actions">
        {dirty && <span className="adm-muted adm-small">Cambios sin guardar</span>}
        <button type="submit" className="adm-btn adm-btn--primary adm-btn--lg" disabled={saving}>{saving ? 'Guardando…' : 'Guardar inicio'}</button>
      </div>
    </form>
  )
}
