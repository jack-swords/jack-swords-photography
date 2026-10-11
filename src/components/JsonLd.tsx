import {stegaClean} from 'next-sanity'

/** Structured data for search engines. Draft-mode markers are removed before serialising. */
export function JsonLd({data}: {data: Record<string, unknown>}) {
  const json = JSON.stringify(stegaClean(data)).replace(/</g, '\\u003c')
  return <script type="application/ld+json" dangerouslySetInnerHTML={{__html: json}} />
}
