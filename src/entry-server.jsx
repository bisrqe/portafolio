// Server entry used at build time (scripts/prerender.mjs) to render each page to static HTML
import { StrictMode } from 'react'
import { renderToString } from 'react-dom/server'
import AppRoot from './AppRoot'
import { buildHead, renderHeadTags } from './seo/head'
import { listPaths } from './seo/routes'
import { splitLang } from './i18n/paths'

export { listPaths }

export function render(url, data, siteUrl) {
  const { lang, path } = splitLang(url)
  const html = renderToString(
    <StrictMode>
      <AppRoot url={url} initialData={data} />
    </StrictMode>,
  )
  const head = buildHead({ lang, path, data, siteUrl })
  return { html, head: renderHeadTags(head), lang, noindex: head.noindex }
}
export { LANG_CODES, localizePath } from './i18n/paths'
