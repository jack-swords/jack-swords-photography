import type {Metadata} from 'next'

import {ImageIndex} from '@/components/project/ImageIndex'
import {countImages, ProjectBlocks} from '@/components/project/ProjectBlocks'
import {SiteHeader} from '@/components/SiteHeader'
import {sanityFetch} from '@/sanity/lib/live'
import {previewImagesQuery} from '@/sanity/lib/queries'
import type {PreviewImagesQueryResult, ProjectQueryResult} from '@/sanity/types'

/**
 * Layout preview: every block type, and the main Row variations, built from
 * photos already in the dataset. Not linked anywhere and not indexed.
 */
export const metadata: Metadata = {
  title: 'Layout preview',
  robots: {index: false, follow: false},
}

type Block = NonNullable<NonNullable<ProjectQueryResult>['blocks']>[number]
type Asset = PreviewImagesQueryResult[number]

export default async function PreviewPage() {
  const assets = (await sanityFetch<PreviewImagesQueryResult>({query: previewImagesQuery, tags: ['project']})) ?? []
  const blocks = buildShowcase(assets)

  return (
    <>
      <SiteHeader />
      <main id="main" className="pb-block-l">
        <header className="px-gutter pt-block-s pb-block-m">
          <div className="mx-auto max-w-medium">
            <h1 className="text-display">Layout preview</h1>
            <p className="mt-6 max-w-prose font-serif text-lead">
              Every block a project story can use, with the main Row settings side by side. Captions give each photo&apos;s
              original size. This page is not linked from the site.
            </p>
          </div>
        </header>
        {blocks.length ? <ProjectBlocks blocks={blocks} /> : <p className="px-gutter">No images in the dataset yet.</p>}
      </main>
      <ImageIndex total={countImages(blocks)} />
    </>
  )
}

function buildShowcase(assets: Asset[]): Block[] {
  const usable = assets.filter((a) => a.width && a.height)
  const portrait = usable.filter((a) => a.height! > a.width!)
  const landscape = usable.filter((a) => a.width! > a.height!)
  const square = usable.filter((a) => a.width === a.height)
  if (!portrait.length || !landscape.length) return []

  // Cycle through each shape so examples use different photos where possible.
  const counters = {p: 0, l: 0, s: 0}
  const pick = (shape: 'p' | 'l' | 's') => {
    const list = shape === 'p' ? portrait : shape === 'l' ? landscape : square.length ? square : portrait
    return list[counters[shape]++ % list.length]
  }

  let key = 0
  const photo = (asset: Asset) => ({
    _key: `img-${key++}`,
    alt: `Example photo, ${asset.width}×${asset.height}`,
    caption: `${asset.width}×${asset.height}`,
    captionSecondary: null,
    crop: null,
    hotspot: null,
    asset: {_id: asset._id, url: asset.url, lqip: asset.lqip, width: asset.width, height: asset.height},
  })
  const label = (heading: string, note?: string) =>
    ({
      _key: `label-${key++}`,
      _type: 'textBlock',
      body: [
        {_type: 'block', _key: `h-${key++}`, style: 'h3', markDefs: [], children: [{_type: 'span', _key: 's', text: heading, marks: []}]},
        ...(note
          ? [{_type: 'block', _key: `p-${key++}`, style: 'normal', markDefs: [], children: [{_type: 'span', _key: 's', text: note, marks: []}]}]
          : []),
      ],
    }) as unknown as Block
  const row = (shapes: ('p' | 'l' | 's')[], opts: {layout?: string; width?: string; gap?: string; verticalAlign?: string; mobile?: string}) =>
    ({
      _key: `row-${key++}`,
      _type: 'imageRow',
      layout: opts.layout ?? 'height',
      width: opts.width ?? 'wide',
      gap: opts.gap ?? 'm',
      verticalAlign: opts.verticalAlign ?? 'top',
      mobile: opts.mobile ?? 'stack',
      images: shapes.map((s) => photo(pick(s))),
    }) as unknown as Block
  const single = (shape: 'p' | 'l' | 's', width: string, align: string) =>
    ({_key: `single-${key++}`, _type: 'imageSingle', width, align, image: photo(pick(shape))}) as unknown as Block

  return [
    label('Row · equal height · wide', 'Portrait, landscape and square share one height; nothing is cropped. On phones: one per line.'),
    row(['p', 'l', 's'], {}),
    label('Row · equal height · two images · medium width'),
    row(['l', 'p'], {width: 'medium'}),
    label('Row · equal height · full width · four images', 'On phones: two per line.'),
    row(['p', 'l', 'p', 'l'], {width: 'full', gap: 's', mobile: 'two'}),
    label('Row · equal columns · aligned to the bottom', 'Same width each; heights follow the photos.'),
    row(['l', 'p', 'l'], {layout: 'columns', verticalAlign: 'bottom'}),
    label('Row · equal columns · middle', 'On phones: the row is kept side by side.'),
    row(['p', 'l'], {layout: 'columns', verticalAlign: 'center', width: 'medium', mobile: 'keep'}),
    label('Row · a single image', 'A row with one image behaves like a single image at the row width.'),
    row(['l'], {width: 'medium'}),
    label('Single image · narrow · left'),
    single('p', 'narrow', 'left'),
    label('Single image · wide · centred'),
    single('l', 'wide', 'center'),
    label('Full-width image', 'Keeps the page margin; switch on "Edge to edge" to run it to the screen edges.'),
    {_key: `fb-${key++}`, _type: 'imageFullBleed', fullHeight: false, image: photo(pick('l'))} as unknown as Block,
    label('Offset pair · left leads'),
    {
      _key: `off-${key++}`,
      _type: 'imageOffset',
      leadSide: 'left',
      offset: 'm',
      keepColumnsOnMobile: false,
      first: photo(pick('p')),
      second: photo(pick('l')),
    } as unknown as Block,
    label('Text block', 'Story text sits at a comfortable reading width between images.'),
    {
      _key: `text-${key++}`,
      _type: 'textBlock',
      body: [
        {_type: 'block', _key: 't1', style: 'normal', markDefs: [], children: [{_type: 'span', _key: 's', text: 'Paragraphs set in the story serif, with italics, links and pull quotes available in the Studio.', marks: []}]},
        {_type: 'block', _key: 't2', style: 'blockquote', markDefs: [], children: [{_type: 'span', _key: 's', text: '“A pull quote looks like this.”', marks: []}]},
      ],
    } as unknown as Block,
  ]
}
