import Image from 'next/image'

import {urlFor} from '@/sanity/lib/image'

export type ImageValue = {
  alt?: string | null
  caption?: string | null
  captionSecondary?: string | null
  crop?: {top?: number; bottom?: number; left?: number; right?: number} | null
  hotspot?: {x?: number; y?: number} | null
  asset?: {_id: string; url?: string | null; lqip?: string | null; width?: number | null; height?: number | null} | null
} | null

/** Pixel size after the editor's crop, so width/height match what is actually served. */
export function croppedSize(image: NonNullable<ImageValue>) {
  const width = image.asset?.width ?? 1600
  const height = image.asset?.height ?? 1000
  const {top = 0, bottom = 0, left = 0, right = 0} = image.crop ?? {}
  return {width: Math.round(width * (1 - left - right)), height: Math.round(height * (1 - top - bottom))}
}

/** CSS object-position from the hotspot, adjusted for the crop, for object-fit: cover. */
export function focalPoint(image: NonNullable<ImageValue>) {
  const {x = 0.5, y = 0.5} = image.hotspot ?? {}
  const {top = 0, bottom = 0, left = 0, right = 0} = image.crop ?? {}
  const fx = (x - left) / (1 - left - right || 1)
  const fy = (y - top) / (1 - top - bottom || 1)
  const clamp = (n: number) => Math.min(100, Math.max(0, n * 100))
  return `${clamp(fx)}% ${clamp(fy)}%`
}

/**
 * `sizes` for an image cropped to fill the whole viewport: on screens taller than the
 * image's ratio it has to be wider than the screen, by the image's aspect ratio.
 */
export function viewportCoverSizes(image: ImageValue) {
  if (!image?.asset) return '100vw'
  const {width, height} = croppedSize(image)
  return `(min-aspect-ratio: ${width}/${height}) 100vw, ${Math.ceil((width / height) * 100)}vh`
}

type Props = {
  image: ImageValue
  sizes: string
  className?: string
  preload?: boolean
  /** Fill the parent (which must be positioned and sized) and crop around the hotspot. */
  cover?: boolean
}

export function SanityImage({image, sizes, className, preload = false, cover = false}: Props) {
  if (!image?.asset) return null
  const src = urlFor(image).url()
  const alt = image.alt ?? ''
  const placeholder = image.asset.lqip ? ('blur' as const) : ('empty' as const)
  const common = {
    src,
    sizes,
    preload,
    placeholder,
    blurDataURL: image.asset.lqip ?? undefined,
  }

  if (cover) {
    return <Image {...common} alt={alt} fill className={`object-cover ${className ?? ''}`} style={{objectPosition: focalPoint(image)}} />
  }
  const {width, height} = croppedSize(image)
  return <Image {...common} alt={alt} width={width} height={height} className={`h-auto w-full ${className ?? ''}`} />
}
