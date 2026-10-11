import type {PreviewProps} from 'sanity'

import {urlFor} from '../lib/image'

type RowPreviewProps = PreviewProps & {images?: {asset?: {_ref?: string}}[]}

/** Row preview in the Studio: the usual title line, plus a strip of the row's thumbnails. */
export function RowPreview(props: RowPreviewProps) {
  const images = (props.images ?? []).filter((i) => i?.asset?._ref)
  return (
    <div>
      {props.renderDefault(props)}
      {images.length > 1 ? (
        <div style={{display: 'flex', gap: 4, padding: '0 8px 8px', overflow: 'hidden'}}>
          {images.slice(0, 8).map((image, i) => (
            // eslint-disable-next-line @next/next/no-img-element -- Studio-only thumbnail
            <img
              key={i}
              src={urlFor(image).height(96).fit('max').url()}
              alt=""
              style={{height: 48, width: 'auto', objectFit: 'contain', borderRadius: 2}}
            />
          ))}
        </div>
      ) : null}
    </div>
  )
}
