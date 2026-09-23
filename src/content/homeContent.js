// Default home-page content (English base + reviewed ES/FR translations).
// Used until the corresponding field is saved from the admin dashboard; after that,
// Firestore (home/content) is the source of truth.
import { textHash } from './hash'

// Marks the bundled translations as reviewed ("manual") so auto-translation keeps them
function reviewed(item, fields) {
  const meta = {}
  const langs = ["es", "fr"]
  langs.forEach(lang => {
    meta[lang] = {}
    fields.forEach(field => {
      if (item.translations?.[lang]?.[field]) meta[lang][field] = { source: 'manual', hash: textHash(item[field] || '') }
    })
  })
  return { ...item, i18nMeta: meta }
}

export const EXPERTISE_FIELDS = ['title', 'description']
export const HIGHLIGHT_FIELDS = ['value', 'label', 'detail']
export const TOOLKIT_FIELDS = ['label', 'items']
export const ABILITY_FIELDS = ['title', 'description']

export const DEFAULT_EXPERTISE_AREAS = [
  {
    id: 'strategy',
    title: 'Strategy & Business Architecture',
    description: 'Enterprise architecture assessments and TO-BE designs (TOGAF, BPMN 2.0, ArchiMate, SAP Signavio) and innovation portfolios (IMBOK), developed in academic consulting challenges with Ternium, Corning and Brands&People.',
    translations: {
      es: {
        title: 'Estrategia y arquitectura de negocio',
        description: 'Evaluaciones de arquitectura empresarial y diseños TO-BE (TOGAF, BPMN 2.0, ArchiMate, SAP Signavio) y portafolios de innovación (IMBOK), desarrollados en retos académicos de consultoría con Ternium, Corning y Brands&People.',
      },
      fr: {
        title: 'Stratégie et architecture d’entreprise',
        description: 'Évaluations d’architecture d’entreprise et conceptions TO-BE (TOGAF, BPMN 2.0, ArchiMate, SAP Signavio), ainsi que portefeuilles d’innovation (IMBOK), réalisés lors de défis de conseil académiques avec Ternium, Corning et Brands&People.',
      },
    },
  },
  {
    id: 'data',
    title: 'Data & Machine Learning',
    description: "SQL data warehousing, dashboarding, and predictive and clustering models in Python. I am currently deepening these skills through the University of Tokyo's GCI World program. My team placed 2nd at the Hey Banco Datathon 2026.",
    translations: {
      es: {
        title: 'Datos y aprendizaje automático',
        description: 'Almacenes de datos en SQL, tableros de control y modelos predictivos y de agrupamiento en Python. Actualmente profundizo en estas habilidades con el programa GCI World de la Universidad de Tokio. Mi equipo obtuvo el 2.º lugar en el Hey Banco Datathon 2026.',
      },
      fr: {
        title: 'Données et apprentissage automatique',
        description: 'Entrepôts de données SQL, tableaux de bord et modèles prédictifs et de clustering en Python. J’approfondis actuellement ces compétences grâce au programme GCI World de l’Université de Tokyo. Mon équipe a obtenu la 2e place au Hey Banco Datathon 2026.',
      },
    },
  },
  {
    id: 'leadership',
    title: 'Leadership & Social Impact',
    description: "Selected as one of the top 5 students in Tec's School of Engineering (Global Leaders for the Future) and as a Youth Observer at UNFCCC SB62 in Bonn. Recipient of the EGS Don Eugenio's Circle and Social Impact awards.",
    translations: {
      es: {
        title: 'Liderazgo e impacto social',
        description: 'Seleccionado como uno de los 5 mejores estudiantes de la Escuela de Ingeniería del Tec (Global Leaders for the Future) y como Observador Juvenil en la SB62 de la CMNUCC en Bonn. Reconocido con los premios Don Eugenio’s Circle e Impacto Social del programa EGS.',
      },
      fr: {
        title: 'Leadership et impact social',
        description: 'Sélectionné parmi les 5 meilleurs étudiants de l’École d’ingénierie du Tec (Global Leaders for the Future) et comme observateur jeunesse à la SB62 de la CCNUCC à Bonn. Lauréat des prix Don Eugenio’s Circle et Social Impact du programme EGS.',
      },
    },
  },
].map(item => reviewed(item, EXPERTISE_FIELDS))

// kind: 'award' (recognition, shown with an award icon) | 'metric' (a figure)
export const DEFAULT_HIGHLIGHTS = [
  {
    id: 'datathon',
    kind: 'award',
    value: '2nd place',
    label: 'Hey Banco Datathon 2026',
    detail: 'Team result in the data science competition',
    translations: {
      es: { value: '2.º lugar', label: 'Hey Banco Datathon 2026', detail: 'Resultado en equipo en la competencia de ciencia de datos' },
      fr: { value: '2e place', label: 'Hey Banco Datathon 2026', detail: 'Résultat d’équipe au concours de science des données' },
    },
  },
  {
    id: 'glf',
    kind: 'award',
    value: 'Top 5',
    label: 'Global Leaders for the Future',
    detail: "Among the top 5 students in Tec's School of Engineering",
    translations: {
      es: { value: 'Top 5', label: 'Global Leaders for the Future', detail: 'Entre los 5 mejores estudiantes de la Escuela de Ingeniería del Tec' },
      fr: { value: 'Top 5', label: 'Global Leaders for the Future', detail: 'Parmi les 5 meilleurs étudiants de l’École d’ingénierie du Tec' },
    },
  },
  {
    id: 'unfccc',
    kind: 'award',
    value: 'UNFCCC SB62',
    label: 'Youth Observer',
    detail: 'Bonn, Germany',
    translations: {
      es: { value: 'SB62 de la CMNUCC', label: 'Observador juvenil', detail: 'Bonn, Alemania' },
      fr: { value: 'SB62 de la CCNUCC', label: 'Observateur jeunesse', detail: 'Bonn, Allemagne' },
    },
  },
  {
    id: 'egs',
    kind: 'award',
    value: 'EGS',
    label: "Don Eugenio's Circle & Social Impact awards",
    detail: 'Eugenio Garza Sada Global Leadership Program',
    translations: {
      es: { value: 'EGS', label: 'Premios Don Eugenio’s Circle e Impacto Social', detail: 'Programa de Liderazgo Global Eugenio Garza Sada' },
      fr: { value: 'EGS', label: 'Prix Don Eugenio’s Circle et Social Impact', detail: 'Programme de leadership mondial Eugenio Garza Sada' },
    },
  },
].map(item => reviewed(item, HIGHLIGHT_FIELDS))

// `items` is a comma-separated list shown as chips. Rows made of proper nouns keep the
// same text in every language (stored as reviewed translations so they are not machine-translated).
const same = text => ({ es: { items: text }, fr: { items: text } })
export const DEFAULT_TOOLKIT = [
  { id: 'programming', label: 'Programming', items: 'Python, SQL, Java, C++, R',
    translations: { es: { label: 'Programación', ...same('Python, SQL, Java, C++, R').es }, fr: { label: 'Programmation', ...same('Python, SQL, Java, C++, R').fr } } },
  { id: 'libraries', label: 'Libraries & Frameworks', items: 'Pandas, NumPy, Scikit-learn, Flask, OpenCV',
    translations: { es: { label: 'Librerías y frameworks', ...same('Pandas, NumPy, Scikit-learn, Flask, OpenCV').es }, fr: { label: 'Bibliothèques et frameworks', ...same('Pandas, NumPy, Scikit-learn, Flask, OpenCV').fr } } },
  { id: 'tools', label: 'Tools', items: 'Power BI, Tableau, Snowflake, Datameer, SAP Signavio, ArchiMate, Power Apps, Excel',
    translations: { es: { label: 'Herramientas', ...same('Power BI, Tableau, Snowflake, Datameer, SAP Signavio, ArchiMate, Power Apps, Excel').es }, fr: { label: 'Outils', ...same('Power BI, Tableau, Snowflake, Datameer, SAP Signavio, ArchiMate, Power Apps, Excel').fr } } },
  { id: 'methodologies', label: 'Methodologies', items: 'Agile/Scrum, PMI, TOGAF, ITIL 4, COBIT 5, IMBOK, Lean',
    translations: { es: { label: 'Metodologías', ...same('Agile/Scrum, PMI, TOGAF, ITIL 4, COBIT 5, IMBOK, Lean').es }, fr: { label: 'Méthodologies', ...same('Agile/Scrum, PMI, TOGAF, ITIL 4, COBIT 5, IMBOK, Lean').fr } } },
  { id: 'languages', label: 'Languages', items: 'Spanish (native), English (C1), French (B2), German (B1)',
    translations: {
      es: { label: 'Idiomas', items: 'Español (nativo), Inglés (C1), Francés (B2), Alemán (B1)' },
      fr: { label: 'Langues', items: 'Espagnol (langue maternelle), Anglais (C1), Français (B2), Allemand (B1)' },
    } },
].map(item => reviewed(item, TOOLKIT_FIELDS))

/**
 * Normalises the Firestore home document into what the page renders,
 * filling new sections with the defaults above until they are saved from /admin.
 */
export function resolveHome(home = {}) {
  const legacyMetrics = (home.achievements || []).map((a, i) => ({
    id: a.id ?? `metric-${i}`,
    kind: 'metric',
    value: a.number || '',
    label: a.label || '',
    detail: '',
    translations: a.translations || {},
  }))
  return {
    ...home,
    expertiseAreas: home.expertiseAreas ?? DEFAULT_EXPERTISE_AREAS,
    highlights: home.highlights ?? [...DEFAULT_HIGHLIGHTS, ...legacyMetrics],
    toolkit: home.toolkit ?? DEFAULT_TOOLKIT,
    abilities: home.abilities || [],
  }
}

export const splitItems = text => (text || '').split(',').map(s => s.trim()).filter(Boolean)
