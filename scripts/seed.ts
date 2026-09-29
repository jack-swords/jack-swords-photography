/**
 * Seed the dataset with demo content: 4 categories, 3 projects that use every
 * block type, plus the site settings, homepage and about singletons.
 *
 *   pnpm seed                          # generate placeholders, upload, write documents
 *   pnpm seed --hero-video clip.mp4    # also give "Night Swimmers" a video hero
 *   pnpm seed --dry-run                # write images + documents to ./seed-output, no network
 *
 * Idempotent: documents have fixed IDs (createOrReplace) and Sanity de-duplicates
 * identical assets, so it is safe to run repeatedly.
 * Needs NEXT_PUBLIC_SANITY_PROJECT_ID and SANITY_API_WRITE_TOKEN (Editor) in .env.local.
 */
import {randomUUID} from 'node:crypto'
import {createReadStream} from 'node:fs'
import {mkdir, writeFile} from 'node:fs/promises'
import {basename, join} from 'node:path'
import {parseArgs} from 'node:util'

import {createClient} from '@sanity/client'
import sharp from 'sharp'

const {values: args} = parseArgs({
  options: {
    'dry-run': {type: 'boolean', default: false},
    'hero-video': {type: 'string'},
  },
})
const dryRun = args['dry-run']
const outDir = join(process.cwd(), 'seed-output')

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
const token = process.env.SANITY_API_WRITE_TOKEN

if (!dryRun && (!projectId || !token)) {
  console.error('Set NEXT_PUBLIC_SANITY_PROJECT_ID and SANITY_API_WRITE_TOKEN in .env.local (or use --dry-run).')
  process.exit(1)
}

const client = createClient({
  projectId: projectId || 'unconfigured',
  dataset,
  token,
  apiVersion: '2026-09-01',
  useCdn: false,
})

// ---------------------------------------------------------------------------
// Placeholder images
// ---------------------------------------------------------------------------

type Palette = [string, string, string]

const palettes: Record<string, Palette> = {
  salt: ['#e9e4da', '#c9c1b3', '#8d8579'],
  night: ['#1d2430', '#2f3d4f', '#7c8b9c'],
  lisbon: ['#efe2cf', '#d4a986', '#7b4f3a'],
  portrait: ['#d9d6d0', '#a8a39a', '#4d4a45'],
}

const shapes = {
  landscape: [2400, 1600],
  portrait: [1600, 2000],
  square: [1800, 1800],
  pano: [2800, 1400],
  tall: [1400, 2100],
} as const

type Shape = keyof typeof shapes

/** A quiet tonal study: gradient sky, a horizon, a soft sun. Varies by seed so no two match. */
function placeholderSvg(width: number, height: number, [light, mid, dark]: Palette, seed: number, label: string) {
  const rand = mulberry32(seed)
  const horizon = Math.round(height * (0.45 + rand() * 0.3))
  const sunX = Math.round(width * (0.2 + rand() * 0.6))
  const sunY = Math.round(horizon * (0.35 + rand() * 0.4))
  const sunR = Math.round(Math.min(width, height) * (0.06 + rand() * 0.1))
  const ridge = Array.from({length: 7}, (_, i) => {
    const x = Math.round((width / 6) * i)
    const y = Math.round(horizon - rand() * height * 0.08)
    return `${x},${y}`
  }).join(' ')
  const fontSize = Math.round(Math.min(width, height) * 0.018)

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${light}"/><stop offset="1" stop-color="${mid}"/>
    </linearGradient>
    <linearGradient id="ground" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${mid}"/><stop offset="1" stop-color="${dark}"/>
    </linearGradient>
    <radialGradient id="sun"><stop offset="0" stop-color="${light}" stop-opacity="0.95"/><stop offset="1" stop-color="${light}" stop-opacity="0"/></radialGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#sky)"/>
  <circle cx="${sunX}" cy="${sunY}" r="${sunR * 3}" fill="url(#sun)"/>
  <polygon points="0,${height} ${ridge} ${width},${horizon} ${width},${height}" fill="url(#ground)"/>
  <text x="${fontSize * 2}" y="${height - fontSize * 2}" font-family="monospace" font-size="${fontSize}" fill="${light}" fill-opacity="0.7">${label}</text>
</svg>`
}

function mulberry32(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

let imageCounter = 0

async function uploadImage(name: string, shape: Shape, palette: Palette): Promise<string> {
  imageCounter += 1
  const [width, height] = shapes[shape]
  const label = `${name} · ${width}×${height}`
  const svg = placeholderSvg(width, height, palette, imageCounter * 7919, label)
  // Re-encoding through sharp also guarantees no EXIF (and no GPS) reaches Sanity.
  const buffer = await sharp(Buffer.from(svg)).jpeg({quality: 82, mozjpeg: true}).toBuffer()
  const filename = `${name}.jpg`

  if (dryRun) {
    await writeFile(join(outDir, filename), buffer)
    return `image-dryrun${imageCounter}-${width}x${height}-jpg`
  }
  const asset = await client.assets.upload('image', buffer, {filename})
  return asset._id
}

type Photo = {
  _type: 'photo'
  _key?: string
  asset: {_type: 'reference'; _ref: string}
  alt: string
  caption?: string
  captionSecondary?: string
}

async function photo(
  name: string,
  shape: Shape,
  palette: Palette,
  alt: string,
  caption?: string,
  captionSecondary?: string,
): Promise<Photo> {
  const ref = await uploadImage(name, shape, palette)
  return {
    _type: 'photo',
    asset: {_type: 'reference', _ref: ref},
    alt,
    ...(caption && {caption}),
    ...(captionSecondary && {captionSecondary}),
  }
}

const key = () => randomUUID().slice(0, 12)
const withKey = <T extends object>(item: T) => ({_key: key(), ...item})
const ref = (id: string) => ({_type: 'reference' as const, _ref: id})
const refItem = (id: string) => ({...ref(id), _key: key()})

function text(...paragraphs: Array<string | {style: 'h2' | 'h3' | 'blockquote'; text: string}>) {
  return paragraphs.map((p) => {
    const {style, text: body} = typeof p === 'string' ? {style: 'normal', text: p} : p
    return {_type: 'block', _key: key(), style, markDefs: [], children: [{_type: 'span', _key: key(), text: body, marks: []}]}
  })
}

// ---------------------------------------------------------------------------
// Documents
// ---------------------------------------------------------------------------

async function buildDocuments() {
  const categories = [
    {_id: 'category-editorial', title: 'Editorial', slug: 'editorial', orderRank: '0|100000:'},
    {_id: 'category-personal', title: 'Personal', slug: 'personal', orderRank: '0|100008:'},
    {_id: 'category-commercial', title: 'Commercial', slug: 'commercial', orderRank: '0|10000g:'},
    {_id: 'category-portrait', title: 'Portrait', slug: 'portrait', orderRank: '0|10000o:'},
  ].map(({slug, ...c}) => ({_type: 'category', ...c, slug: {_type: 'slug', current: slug}}))

  const {salt, night, lisbon, portrait} = palettes

  // 1. Salt Flats: every block type, image hero, light text.
  const saltFlats = {
    _id: 'project-salt-flats',
    _type: 'project',
    title: 'Salt Flats',
    slug: {_type: 'slug', current: 'salt-flats'},
    subtitle: 'Four days on a dry lake bed, photographing the people who race across it at dawn.',
    date: '2026-05-14',
    orderRank: '0|100000:',
    categories: [refItem('category-editorial'), refItem('category-personal')],
    heroTextTone: 'dark',
    hero: {
      mediaType: 'image',
      image: await photo('salt-hero', 'pano', salt, 'A pale salt flat stretching to a low ridge under a white sky'),
    },
    credits: [
      withKey({_type: 'credit', label: 'Client', value: 'Field Quarterly'}),
      withKey({_type: 'credit', label: 'Styling', value: 'Mara Quinn'}),
      withKey({_type: 'credit', label: 'Assistant', value: 'Theo Park'}),
    ],
    blocks: [
      withKey({
        _type: 'imageSingle',
        width: 'medium',
        align: 'center',
        image: await photo('salt-01', 'landscape', salt, 'A driver adjusts goggles beside a stripped-back car', 'Ines before the first run', 'Bonneville, Utah'),
      }),
      withKey({
        _type: 'textBlock',
        body: text(
          'The lake bed only holds its shape for a few weeks each year. Before the heat arrives, the crews come out at four in the morning and wait for the light.',
          {style: 'blockquote', text: '“You are racing the ground as much as the clock.”'},
          'Everything here is measured in tenths: of a second, of a mile, of a degree.',
        ),
      }),
      withKey({
        _type: 'imagePair',
        verticalAlign: 'top',
        gap: 'm',
        keepColumnsOnMobile: false,
        left: await photo('salt-02', 'portrait', salt, 'Portrait of a mechanic holding a wrench', 'Luis, crew chief'),
        right: await photo('salt-03', 'portrait', salt, 'Close-up of cracked salt crust', 'The surface at 5am'),
      }),
      withKey({
        _type: 'imageSingle',
        width: 'narrow',
        align: 'left',
        image: await photo('salt-04', 'tall', salt, 'A lone figure walking toward the horizon', 'Walking the course', 'Mile 3'),
      }),
      withKey({
        _type: 'imageFullBleed',
        fullHeight: true,
        image: await photo('salt-05', 'pano', salt, 'Wide view of the salt flat with a car trailing dust', 'First light'),
      }),
      withKey({_type: 'spacer', size: 'l'}),
      withKey({
        _type: 'imageGrid2x2',
        crop: 'square',
        gap: 's',
        keepColumnsOnMobile: true,
        images: await Promise.all([
          photo('salt-06', 'square', salt, 'Tyre tracks in the salt'),
          photo('salt-07', 'landscape', salt, 'A timing board'),
          photo('salt-08', 'portrait', salt, 'Hands taping a helmet'),
          photo('salt-09', 'square', salt, 'A thermos on a car roof'),
        ]).then((imgs) => imgs.map(withKey)),
      }),
      withKey({
        _type: 'imageOffset',
        leadSide: 'left',
        offset: 'm',
        keepColumnsOnMobile: false,
        first: await photo('salt-10', 'portrait', salt, 'A racer resting on a cooler', 'Between heats'),
        second: await photo('salt-11', 'landscape', salt, 'Spectators under an umbrella', 'The spectators', 'Grandstand, day two'),
      }),
      withKey({_type: 'textBlock', body: text({style: 'h2', text: 'Afterwards'}, 'By nine the mirage has swallowed the far end of the course, and everyone packs up.')}),
      withKey({
        _type: 'imageSingle',
        width: 'wide',
        align: 'right',
        image: await photo('salt-12', 'landscape', salt, 'Empty course at midday', 'Nine o’clock', 'The course closes'),
      }),
    ],
    nextProjects: [refItem('project-night-swimmers')],
    seo: {_type: 'seo', description: 'A photo story from the salt flats at dawn.'},
  }

  // 2. Night Swimmers: video hero when --hero-video is given, otherwise an image hero.
  const heroVideo = args['hero-video']
  let nightHero: Record<string, unknown>
  const nightPoster = await photo('night-hero', 'pano', night, 'Swimmers silhouetted against a dark harbour')
  if (heroVideo && !dryRun) {
    const video = await client.assets.upload('file', createReadStream(heroVideo), {filename: basename(heroVideo)})
    nightHero = {mediaType: 'video', videoFile: {_type: 'file', asset: {_type: 'reference', _ref: video._id}}, poster: nightPoster}
  } else {
    nightHero = {mediaType: 'image', image: nightPoster}
  }

  const nightSwimmers = {
    _id: 'project-night-swimmers',
    _type: 'project',
    title: 'Night Swimmers',
    slug: {_type: 'slug', current: 'night-swimmers'},
    subtitle: 'A winter club that swims the harbour after dark, all year round.',
    date: '2025-12-02',
    orderRank: '0|100008:',
    categories: [refItem('category-personal'), refItem('category-portrait')],
    heroTextTone: 'light',
    hero: nightHero,
    credits: [withKey({_type: 'credit', label: 'Self-initiated', value: '2025'})],
    blocks: [
      withKey({
        _type: 'imageSingle',
        width: 'medium',
        align: 'center',
        image: await photo('night-01', 'portrait', night, 'A swimmer wrapped in a towel under a streetlight', 'Anna, 71', 'Member since 1988'),
      }),
      withKey({
        _type: 'imageOffset',
        leadSide: 'right',
        offset: 'l',
        keepColumnsOnMobile: false,
        first: await photo('night-02', 'tall', night, 'Steps leading down into black water'),
        second: await photo('night-03', 'portrait', night, 'Steam rising from a swimmer’s shoulders'),
      }),
      withKey({_type: 'spacer', size: 's'}),
      withKey({
        _type: 'imagePair',
        verticalAlign: 'bottom',
        gap: 's',
        keepColumnsOnMobile: true,
        left: await photo('night-04', 'square', night, 'Swim caps drying on a railing'),
        right: await photo('night-05', 'portrait', night, 'A thermometer reading four degrees', 'Water temperature', '4°C'),
      }),
      withKey({_type: 'textBlock', body: text('Nobody talks much before getting in. Afterwards, nobody stops talking.')}),
      withKey({
        _type: 'imageFullBleed',
        fullHeight: false,
        image: await photo('night-06', 'pano', night, 'The harbour wall at night with a line of swimmers'),
      }),
    ],
    nextProjects: [],
  }

  // 3. Interiors, Lisbon: commercial, dark overlay text.
  const lisbonProject = {
    _id: 'project-interiors-lisbon',
    _type: 'project',
    title: 'Interiors, Lisbon',
    slug: {_type: 'slug', current: 'interiors-lisbon'},
    subtitle: 'Six apartments in Alfama for a boutique rental group.',
    date: '2026-02-20',
    orderRank: '0|10000g:',
    categories: [refItem('category-commercial')],
    heroTextTone: 'dark',
    hero: {
      mediaType: 'image',
      image: await photo('lisbon-hero', 'landscape', lisbon, 'A sunlit room with terracotta floor tiles'),
    },
    credits: [
      withKey({_type: 'credit', label: 'Client', value: 'Casa Alta'}),
      withKey({_type: 'credit', label: 'Art direction', value: 'Rui Matos'}),
    ],
    blocks: [
      withKey({
        _type: 'imageGrid2x2',
        crop: 'none',
        gap: 'm',
        keepColumnsOnMobile: false,
        images: await Promise.all([
          photo('lisbon-01', 'portrait', lisbon, 'A doorway framing a window'),
          photo('lisbon-02', 'portrait', lisbon, 'A linen chair by a wall'),
          photo('lisbon-03', 'portrait', lisbon, 'A tiled kitchen corner'),
          photo('lisbon-04', 'portrait', lisbon, 'Shutters casting striped light'),
        ]).then((imgs) => imgs.map(withKey)),
      }),
      withKey({
        _type: 'imageSingle',
        width: 'wide',
        align: 'center',
        image: await photo('lisbon-05', 'landscape', lisbon, 'A living room at dusk', 'Apartment 3', 'Rua de São Miguel'),
      }),
      withKey({_type: 'spacer', size: 'm'}),
      withKey({
        _type: 'imageSingle',
        width: 'narrow',
        align: 'right',
        image: await photo('lisbon-06', 'tall', lisbon, 'A spiral staircase from below'),
      }),
    ],
    nextProjects: [refItem('project-salt-flats'), refItem('project-night-swimmers')],
  }

  const siteSettings = {
    _id: 'siteSettings',
    _type: 'siteSettings',
    title: 'Jack Swords',
    description: 'Photographer. Editorial, portrait and personal work.',
    nav: {home: 'Selected', projects: 'Works', about: 'About'},
    contactEmail: 'studio@example.com',
    socialLinks: [withKey({_type: 'socialLink', label: 'Instagram', url: 'https://instagram.com/'})],
    theme: 'light',
    indexPreviewMode: 'cursor',
  }

  const homepage = {
    _id: 'homepage',
    _type: 'homepage',
    featured: [
      withKey({_type: 'featuredItem', project: ref('project-salt-flats')}),
      withKey({_type: 'featuredItem', project: ref('project-night-swimmers')}),
      withKey({_type: 'featuredItem', project: ref('project-interiors-lisbon')}),
    ],
  }

  const about = {
    _id: 'about',
    _type: 'about',
    portrait: await photo('about-portrait', 'portrait', portrait, 'Portrait of the photographer'),
    bio: text(
      'Jack Swords is a photographer working between editorial commissions and long-form personal projects.',
      'This is placeholder copy from the seed script. Replace it in the Studio.',
    ),
    clients: ['Field Quarterly', 'Casa Alta', 'Northern Review', 'Atlas Journal'],
    contact: {email: 'studio@example.com', links: [withKey({_type: 'socialLink', label: 'Instagram', url: 'https://instagram.com/'})]},
    representation: [withKey({_type: 'agent', region: 'Worldwide', agency: 'Example Agency', name: 'Sam Lee', email: 'sam@example.com'})],
  }

  return [...categories, saltFlats, nightSwimmers, lisbonProject, siteSettings, homepage, about]
}

async function main() {
  if (dryRun) await mkdir(outDir, {recursive: true})
  console.log(dryRun ? `Dry run: writing to ${outDir}` : `Seeding ${projectId}/${dataset}…`)

  const documents = await buildDocuments()
  console.log(`Generated ${imageCounter} placeholder images`)

  if (dryRun) {
    await writeFile(join(outDir, 'documents.json'), JSON.stringify(documents, null, 2))
    console.log(`Wrote ${documents.length} documents to seed-output/documents.json`)
    return
  }

  const tx = client.transaction()
  for (const doc of documents) tx.createOrReplace(doc as {_id: string; _type: string})
  await tx.commit()
  console.log(`Wrote ${documents.length} documents. Open /studio to see them.`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
