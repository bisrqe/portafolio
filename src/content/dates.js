// Deterministic month/year formatting (same output in Node and every browser, so prerendered HTML hydrates cleanly)
import { translate } from '../i18n/t'

// '2026-03' → 'Mar 2026' / 'mar. 2026' / 'mars 2026'
export function formatMonth(value, lang) {
  const match = /^(\d{4})(?:-(\d{2}))?$/.exec(value || '')
  if (!match) return ''
  const [, year, month] = match
  if (!month) return year
  const months = translate(lang, 'detail.months')
  return `${months[Number(month) - 1]} ${year}`
}

/** Date range of a project: startDate / endDate as 'YYYY-MM' (or 'YYYY'), `current` for ongoing work */
export function formatRange(item, lang) {
  const start = formatMonth(item?.startDate, lang)
  const end = item?.current ? translate(lang, 'detail.present') : formatMonth(item?.endDate, lang)
  if (start && end) return start === end ? start : `${start} – ${end}`
  return start || end || ''
}
