import { useDocument } from './useFirestore'
import { useLanguage } from '../i18n/LanguageContext'

export const SETTINGS_PATH = 'settings/site'

// Used until the admin saves tag settings for the first time (matches the previous behaviour)
export const DEFAULT_VISIBLE_TAGS = {
  projects: ['Simulation', 'Professional Experience', 'Student Groups', 'Personal Projects', 'Hackathons'],
  leadership: ['EGS', 'Leadership Iniciatives', 'International Events', 'Social Service', 'Student Groups'],
}

/**
 * Site-wide settings stored in Firestore (shared by every visitor):
 *  - visibleTags: which tags appear as filters on each page
 *  - tagLabels:   optional translations of tag names, e.g. { "Hackathons": { es: "Hackatones" } }
 */
export function useSiteSettings() {
  const { data, loading } = useDocument(SETTINGS_PATH)
  const { lang } = useLanguage()

  const visibleTags = {
    projects: data.visibleTags?.projects ?? DEFAULT_VISIBLE_TAGS.projects,
    leadership: data.visibleTags?.leadership ?? DEFAULT_VISIBLE_TAGS.leadership,
  }
  const tagLabels = data.tagLabels ?? {}
  const tagLabel = tag => tagLabels[tag]?.[lang]?.trim() || tag

  return { settings: data, visibleTags, tagLabels, tagLabel, loading }
}
