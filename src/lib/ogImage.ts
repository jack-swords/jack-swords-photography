import type {Metadata} from 'next'

import type {ImageValue} from '@/components/SanityImage'
import {urlFor} from '@/sanity/lib/image'

/** Open Graph image (1200×630, cropped around the hotspot) from a Sanity image, if there is one. */
export function ogImages(image: ImageValue | undefined): NonNullable<Metadata['openGraph']>['images'] {
  if (!image?.asset) return undefined
  return [{url: urlFor(image).width(1200).height(630).fit('crop').url(), width: 1200, height: 630}]
}
