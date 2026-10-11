import {SanityImage, type ImageValue} from '@/components/SanityImage'

type Props = {
  image: ImageValue
  /** 1-based position across the whole project; drives the numbered index. */
  index: number
  sizes: string
  /** Fixed aspect-ratio class (e.g. "aspect-square"): the image is cropped around its hotspot. */
  crop?: string
  /** Extra classes for the caption, e.g. side padding on full-bleed images. */
  captionClassName?: string
  className?: string
  /** data-sanity attribute for visual editing (draft mode only). */
  edit?: string
  style?: React.CSSProperties
}

export function Figure({image, index, sizes, crop, captionClassName = '', className = '', edit, style}: Props) {
  if (!image?.asset) return null

  return (
    <figure id={`image-${index}`} data-image-index={index} data-sanity={edit} className={`scroll-mt-16 ${className}`} style={style}>
      {crop ? (
        <div className={`relative w-full overflow-hidden ${crop}`}>
          <SanityImage image={image} sizes={sizes} cover />
        </div>
      ) : (
        <SanityImage image={image} sizes={sizes} />
      )}
      {image.caption || image.captionSecondary ? (
        <figcaption className={`mt-2 ${captionClassName}`}>
          {image.caption ? <span className="block">{image.caption}</span> : null}
          {image.captionSecondary ? <span className="block text-ink-muted">{image.captionSecondary}</span> : null}
        </figcaption>
      ) : null}
    </figure>
  )
}
