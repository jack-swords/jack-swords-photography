import {createImageUrlBuilder, type SanityImageSource} from '@sanity/image-url'

import {dataset, projectId} from '../env'

const builder = createImageUrlBuilder({projectId: projectId || 'unconfigured', dataset})

/** Base builder: always let the CDN negotiate AVIF/WebP. */
export function urlFor(source: SanityImageSource) {
  return builder.image(source).auto('format').fit('max')
}

/** Width/height of the original asset, parsed from the asset _ref (image-<id>-<w>x<h>-<ext>). */
export function getImageDimensions(ref: string): {width: number; height: number; aspectRatio: number} {
  const match = /-(\d+)x(\d+)-/.exec(ref)
  if (!match) throw new Error(`Cannot parse image dimensions from ref "${ref}"`)
  const width = Number(match[1])
  const height = Number(match[2])
  return {width, height, aspectRatio: width / height}
}
