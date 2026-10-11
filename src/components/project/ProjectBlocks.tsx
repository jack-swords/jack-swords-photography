import type {PortableTextBlock} from '@portabletext/types'

import {RichText} from '@/components/RichText'
import {viewportCoverSizes} from '@/components/SanityImage'
import {editAttr, type EditTarget} from '@/sanity/lib/dataAttribute'
import type {ProjectQueryResult} from '@/sanity/types'

import {Figure} from './Figure'

type Block = NonNullable<NonNullable<ProjectQueryResult>['blocks']>[number]
type BlockOf<T extends Block['_type']> = Extract<Block, {_type: T}>

// Tailwind only sees literal class names, so every variant is spelled out here.

const singleWidth = {
  narrow: {box: 'md:max-w-narrow', sizes: '(min-width: 768px) 544px, 100vw'},
  medium: {box: 'md:max-w-medium', sizes: '(min-width: 768px) 832px, 100vw'},
  wide: {box: 'md:max-w-wide', sizes: '(min-width: 768px) 1216px, 100vw'},
} as const

const singleAlign = {left: 'mr-auto', center: 'mx-auto', right: 'ml-auto'} as const

const gapSize = {s: 'gap-3', m: 'gap-6 md:gap-10', l: 'gap-10 md:gap-20'} as const

const twoColumns = {keep: 'grid-cols-2', stack: 'grid-cols-1 md:grid-cols-2'} as const

const gridCrop = {
  none: undefined,
  square: 'aspect-square',
  portrait: 'aspect-[4/5]',
  landscape: 'aspect-[3/2]',
} as const

// imageOffset: a 12-column grid, the leading image higher, the trailing one pushed down.
const offsetLayout = {
  keep: {
    grid: 'grid-cols-12 gap-x-4',
    left: 'col-span-5 col-start-1 row-start-1',
    right: 'col-span-5 col-start-8 row-start-1',
    drop: {s: 'mt-[8vw]', m: 'mt-[16vw]', l: 'mt-[24vw]'},
  },
  stack: {
    grid: 'grid-cols-1 gap-y-8 md:grid-cols-12 md:gap-x-4',
    left: 'md:col-span-5 md:col-start-1 md:row-start-1',
    right: 'md:col-span-5 md:col-start-8 md:row-start-1',
    drop: {s: 'md:mt-[8vw]', m: 'md:mt-[16vw]', l: 'md:mt-[24vw]'},
  },
} as const

const spacerSize = {s: 'h-block-s', m: 'h-block-m', l: 'h-block-l'} as const

/** Counts every image across the blocks, in reading order (the numbered index uses the same order). */
export function countImages(blocks: Block[] | null | undefined) {
  let n = 0
  for (const block of blocks ?? []) {
    if (block._type === 'imageSingle' || block._type === 'imageFullBleed') n += block.image?.asset ? 1 : 0
    if (block._type === 'imagePair') n += [block.left, block.right].filter((i) => i?.asset).length
    if (block._type === 'imageOffset') n += [block.first, block.second].filter((i) => i?.asset).length
    if (block._type === 'imageGrid2x2') n += (block.images ?? []).filter((i) => i?.asset).length
  }
  return n
}

export function ProjectBlocks({blocks, edit = null}: {blocks: Block[] | null | undefined; edit?: EditTarget}) {
  // Numbers are handed out while building the tree, in block order, so they match countImages.
  let counter = 0
  const next = (image: {asset?: unknown} | null | undefined) => (image?.asset ? ++counter : 0)

  return (
    <div className="flex flex-col gap-block-m">
      {(blocks ?? []).map((block) => {
        const at = (field: string) => editAttr(edit, `blocks[_key=="${block._key}"].${field}`)
        switch (block._type) {
          case 'imageSingle':
            return <ImageSingle key={block._key} block={block} index={next(block.image)} edit={at('image')} />
          case 'imageFullBleed':
            return <ImageFullBleed key={block._key} block={block} index={next(block.image)} edit={at('image')} />
          case 'imagePair':
            return <ImagePair key={block._key} block={block} indices={[next(block.left), next(block.right)]} edit={[at('left'), at('right')]} />
          case 'imageGrid2x2':
            return <ImageGrid
                key={block._key}
                block={block}
                indices={(block.images ?? []).map(next)}
                edit={(block.images ?? []).map((image) => at(`images[_key=="${image._key}"]`))}
              />
          case 'imageOffset':
            return <ImageOffset key={block._key} block={block} indices={[next(block.first), next(block.second)]} edit={[at('first'), at('second')]} />
          case 'textBlock':
            return (
              <div key={block._key} className="px-gutter">
                <RichText value={block.body as PortableTextBlock[] | null} className="mx-auto max-w-prose" />
              </div>
            )
          case 'spacer':
            // Cancels one of the two stream gaps around it, so it adds exactly its own height.
            return <div key={block._key} aria-hidden="true" className={`-mt-block-m ${spacerSize[block.size ?? 'm']}`} />
          default:
            return null
        }
      })}
    </div>
  )
}

function ImageSingle({block, index, edit}: {block: BlockOf<'imageSingle'>; index: number; edit?: string}) {
  const width = singleWidth[block.width ?? 'medium']
  return (
    <div className="px-gutter">
      <Figure image={block.image} index={index} edit={edit} sizes={width.sizes} className={`w-full ${width.box} ${singleAlign[block.align ?? 'center']}`} />
    </div>
  )
}

function ImageFullBleed({block, index, edit}: {block: BlockOf<'imageFullBleed'>; index: number; edit?: string}) {
  return (
    <Figure
      image={block.image}
      index={index}
      edit={edit}
      sizes={block.fullHeight ? viewportCoverSizes(block.image) : '100vw'}
      crop={block.fullHeight ? 'h-svh' : undefined}
      captionClassName="px-gutter"
    />
  )
}

function ImagePair({block, indices, edit}: {block: BlockOf<'imagePair'>; indices: number[]; edit: (string | undefined)[]}) {
  const cols = twoColumns[block.keepColumnsOnMobile ? 'keep' : 'stack']
  const sizes = block.keepColumnsOnMobile ? '(min-width: 1280px) 608px, 50vw' : '(min-width: 1280px) 608px, (min-width: 768px) 50vw, 100vw'
  return (
    <div className="px-gutter">
      <div
        className={`mx-auto grid max-w-wide ${cols} ${gapSize[block.gap ?? 'm']} ${block.verticalAlign === 'bottom' ? 'items-end' : 'items-start'}`}
      >
        <Figure image={block.left} index={indices[0]} edit={edit[0]} sizes={sizes} />
        <Figure image={block.right} index={indices[1]} edit={edit[1]} sizes={sizes} />
      </div>
    </div>
  )
}

function ImageGrid({block, indices, edit}: {block: BlockOf<'imageGrid2x2'>; indices: number[]; edit: (string | undefined)[]}) {
  const cols = twoColumns[block.keepColumnsOnMobile ? 'keep' : 'stack']
  const sizes = block.keepColumnsOnMobile ? '(min-width: 1280px) 608px, 50vw' : '(min-width: 1280px) 608px, (min-width: 768px) 50vw, 100vw'
  return (
    <div className="px-gutter">
      <div className={`mx-auto grid max-w-wide items-start ${cols} ${gapSize[block.gap ?? 'm']}`}>
        {(block.images ?? []).map((image, i) => (
          <Figure key={image._key ?? i} image={image} index={indices[i]} edit={edit[i]} sizes={sizes} crop={gridCrop[block.crop ?? 'none']} />
        ))}
      </div>
    </div>
  )
}

function ImageOffset({block, indices, edit}: {block: BlockOf<'imageOffset'>; indices: number[]; edit: (string | undefined)[]}) {
  const layout = offsetLayout[block.keepColumnsOnMobile ? 'keep' : 'stack']
  const leadsLeft = block.leadSide !== 'right'
  const drop = layout.drop[block.offset ?? 'm']
  const sizes = block.keepColumnsOnMobile ? '(min-width: 1280px) 500px, 42vw' : '(min-width: 1280px) 500px, (min-width: 768px) 42vw, 100vw'
  return (
    <div className="px-gutter">
      <div className={`mx-auto grid max-w-wide items-start ${layout.grid}`}>
        <Figure image={block.first} index={indices[0]} edit={edit[0]} sizes={sizes} className={leadsLeft ? layout.left : layout.right} />
        <Figure image={block.second} index={indices[1]} edit={edit[1]} sizes={sizes} className={`${leadsLeft ? layout.right : layout.left} ${drop}`} />
      </div>
    </div>
  )
}
