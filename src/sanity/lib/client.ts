import {createClient} from 'next-sanity'

import {apiVersion, dataset, projectId} from '../env'

/**
 * Fields whose values drive layout or code rather than being shown as text.
 * In draft mode, visible strings carry invisible "stega" markers that make
 * them clickable in the Presentation tool; these must stay clean.
 */
const NON_TEXT_FIELDS = new Set([
  // layout options
  'mediaType', 'heroTextTone', 'width', 'align', 'gap', 'verticalAlign', 'crop', 'leadSide', 'offset', 'size',
  'format', 'theme', 'indexPreviewMode', 'keepColumnsOnMobile', 'layout', 'mobile', 'titleSize', 'titlePosition', 'titleFont', 'showTitle', 'showStatement',
  // data that is parsed, not displayed
  'slug', 'date', 'lqip', 'url', 'videoUrl', 'ogImage', 'href', 'email', 'phone',
])

export const client = createClient({
  projectId: projectId || 'unconfigured',
  dataset,
  apiVersion,
  useCdn: true,
  perspective: 'published',
  stega: {
    studioUrl: '/studio',
    filter: (props) => {
      const key = props.sourcePath.at(-1)
      if (typeof key === 'string' && NON_TEXT_FIELDS.has(key)) return false
      // Projected keys (e.g. "slug": slug.current) are named in the result path.
      const resultKey = props.resultPath.at(-1)
      if (typeof resultKey === 'string' && NON_TEXT_FIELDS.has(resultKey)) return false
      return props.filterDefault(props)
    },
  },
})
