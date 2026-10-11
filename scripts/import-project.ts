/**
 * Turn a folder of photos into a draft project.
 *
 *   pnpm import:project ./shoots/salt-flats --title "Salt Flats" --category editorial
 *   pnpm import:project ./folder --title "…" --category editorial,personal --hero cover.jpg
 *   pnpm import:project ./folder --title "…" --dry-run      # check files and GPS stripping, upload nothing
 *
 * - Images are ordered by filename, in natural order (2.jpg before 10.jpg).
 * - EXIF is read for the capture date (the earliest becomes the project date).
 * - All EXIF/XMP, including GPS, is removed before upload. JPEGs keep their
 *   pixels untouched when they need no rotation; anything else is re-encoded
 *   at high quality. Colour profiles are kept.
 * - The first image (or --hero) becomes the hero; the rest become single-image
 *   blocks, ready to rearrange in the Studio.
 * - The project is created as a draft at the top of the manual order. Alt text
 *   is left empty: the Studio will ask for it before you can publish.
 *
 * Needs an Editor token: SANITY_API_WRITE_TOKEN in .env.local (or an injected credential).
 */
import {randomUUID} from 'node:crypto'
import {readdir, readFile} from 'node:fs/promises'
import {basename, extname, join, resolve} from 'node:path'
import {parseArgs} from 'node:util'

import {createClient} from '@sanity/client'
import exifr from 'exifr'
import {LexoRank} from 'lexorank'
import sharp from 'sharp'

// HEIC isn't supported by the bundled image library: export those as JPEG first.
const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.tif', '.tiff'])
const CONCURRENCY = 4

const {values: args, positionals} = parseArgs({
  allowPositionals: true,
  options: {
    title: {type: 'string'},
    category: {type: 'string'},
    hero: {type: 'string'},
    subtitle: {type: 'string'},
    'dry-run': {type: 'boolean', default: false},
  },
})

const folder = positionals[0]
if (!folder || !args.title) {
  console.error('Usage: pnpm import:project <folder> --title "Project title" [--category slug[,slug]] [--hero file.jpg] [--subtitle "…"] [--dry-run]')
  process.exit(1)
}
const dryRun = args['dry-run']

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'byr3hdce',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  token: process.env.SANITY_API_WRITE_TOKEN,
  apiVersion: '2026-09-01',
  useCdn: false,
  // See drafts as well as published documents, so slugs and order account for both.
  perspective: 'raw',
})

// ---------------------------------------------------------------------------
// Metadata stripping
// ---------------------------------------------------------------------------

/**
 * Remove APP1 (EXIF/XMP, where GPS lives) and APP13 (IPTC/Photoshop) segments from
 * a JPEG without decoding it, so the image data is byte-for-byte unchanged.
 * APP2 (ICC colour profile) and everything else is kept.
 */
function stripJpegMetadata(input: Buffer): Buffer {
  if (input[0] !== 0xff || input[1] !== 0xd8) throw new Error('Not a JPEG')
  const parts: Buffer[] = [input.subarray(0, 2)]
  let offset = 2
  while (offset < input.length) {
    if (input[offset] !== 0xff) throw new Error(`Corrupt JPEG marker at byte ${offset}`)
    const marker = input[offset + 1]
    // Start of scan: the rest is image data.
    if (marker === 0xda) {
      parts.push(input.subarray(offset))
      break
    }
    const length = input.readUInt16BE(offset + 2)
    const segment = input.subarray(offset, offset + 2 + length)
    if (marker !== 0xe1 && marker !== 0xed) parts.push(segment)
    offset += 2 + length
  }
  return Buffer.concat(parts)
}

type Prepared = {file: string; buffer: Buffer; filename: string; date: Date | null; reencoded: boolean}

async function prepare(path: string): Promise<Prepared> {
  const original = await readFile(path)
  const ext = extname(path).toLowerCase()
  const exif = await exifr
    .parse(original, {pick: ['DateTimeOriginal', 'CreateDate', 'Orientation'], translateValues: false})
    .catch(() => null)
  const date: Date | null = exif?.DateTimeOriginal ?? exif?.CreateDate ?? null
  const orientation = exif?.Orientation
  const upright = orientation === undefined || orientation === 1

  let buffer: Buffer
  let filename = basename(path)
  let reencoded = false
  if ((ext === '.jpg' || ext === '.jpeg') && upright) {
    buffer = stripJpegMetadata(original)
  } else {
    // Rotate to match the EXIF orientation, then write without EXIF (sharp drops it by default).
    const pipeline = sharp(original).rotate().keepIccProfile()
    if (ext === '.png') {
      buffer = await pipeline.png({compressionLevel: 9}).toBuffer()
    } else if (ext === '.webp') {
      buffer = await pipeline.webp({quality: 95}).toBuffer()
    } else {
      buffer = await pipeline.jpeg({quality: 95, mozjpeg: true, chromaSubsampling: '4:4:4'}).toBuffer()
      filename = filename.replace(/\.[^.]+$/, '.jpg')
    }
    reencoded = true
  }

  // Belt and braces: refuse to upload anything that still carries a location.
  const gps = await exifr.gps(buffer).catch(() => undefined)
  if (gps && (gps.latitude || gps.longitude)) throw new Error(`GPS data survived stripping in ${filename}`)

  return {file: path, buffer, filename, date, reencoded}
}

// ---------------------------------------------------------------------------
// Sanity helpers
// ---------------------------------------------------------------------------

const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 96)

async function uniqueSlug(base: string) {
  const taken = new Set(
    await client.fetch<string[]>(`*[_type == "project" && string::startsWith(slug.current, $base)].slug.current`, {base}),
  )
  if (!taken.has(base)) return base
  let n = 2
  while (taken.has(`${base}-${n}`)) n++
  return `${base}-${n}`
}

async function resolveCategories(input: string | undefined) {
  if (!input) return []
  const wanted = input.split(',').map((s) => s.trim()).filter(Boolean)
  const existing = await client.fetch<{_id: string; title: string; slug: string}[]>(
    `*[_type == "category"]{_id, title, "slug": slug.current}`,
  )
  const refs: {_type: 'reference'; _ref: string; _key: string}[] = []
  for (const name of wanted) {
    const match = existing.find((c) => c.slug === slugify(name) || c.title.toLowerCase() === name.toLowerCase())
    if (!match) {
      throw new Error(`Unknown category "${name}". Existing: ${existing.map((c) => c.slug).join(', ') || '(none)'}. Create it in the Studio first.`)
    }
    refs.push({_type: 'reference', _ref: match._id, _key: randomUUID().slice(0, 12)})
  }
  return refs
}

/** A rank that sorts before every existing project, so the import appears first. */
async function topRank() {
  const first = await client.fetch<string | null>(`*[_type == "project" && defined(orderRank)] | order(orderRank asc)[0].orderRank`)
  return first ? LexoRank.parse(first).genPrev().toString() : LexoRank.middle().toString()
}

async function mapLimit<T, R>(items: T[], limit: number, fn: (item: T, index: number) => Promise<R>) {
  const results: R[] = new Array(items.length)
  let next = 0
  await Promise.all(
    Array.from({length: Math.min(limit, items.length)}, async () => {
      while (next < items.length) {
        const i = next++
        results[i] = await fn(items[i], i)
      }
    }),
  )
  return results
}

// ---------------------------------------------------------------------------

async function main() {
  const dir = resolve(folder)
  const files = (await readdir(dir))
    .filter((f) => IMAGE_EXTENSIONS.has(extname(f).toLowerCase()) && !f.startsWith('.'))
    .sort((a, b) => a.localeCompare(b, undefined, {numeric: true, sensitivity: 'base'}))
  if (!files.length) throw new Error(`No images found in ${dir}`)

  const heroName = args.hero ?? files[0]
  if (!files.includes(heroName)) throw new Error(`--hero "${heroName}" is not in ${dir}`)

  console.log(`${files.length} images in ${dir}${dryRun ? ' (dry run)' : ''}`)
  const categories = dryRun ? [] : await resolveCategories(args.category)

  let done = 0
  const prepared = await mapLimit(files, CONCURRENCY, async (file) => {
    const p = await prepare(join(dir, file))
    done++
    process.stdout.write(`\r  prepared ${done}/${files.length}`)
    return p
  })
  process.stdout.write('\n')
  const reencoded = prepared.filter((p) => p.reencoded).length
  console.log(`  metadata stripped from all; ${files.length - reencoded} JPEGs untouched, ${reencoded} re-encoded (rotation or format)`)

  const dates = prepared.map((p) => p.date).filter((d): d is Date => d instanceof Date && !Number.isNaN(+d))
  const date = (dates.length ? new Date(Math.min(...dates.map(Number))) : new Date()).toISOString().slice(0, 10)

  if (dryRun) {
    console.log(`  would create draft "${args.title}" dated ${date}, hero ${heroName}, ${files.length - 1} blocks`)
    return
  }

  done = 0
  const assets = await mapLimit(prepared, CONCURRENCY, async (p) => {
    // Only derived metadata is extracted; never EXIF or location.
    const asset = await client.assets.upload('image', p.buffer, {filename: p.filename, extract: ['lqip', 'palette', 'blurhash']})
    done++
    process.stdout.write(`\r  uploaded ${done}/${prepared.length}`)
    return asset
  })
  process.stdout.write('\n')

  const photo = (assetId: string) => ({_type: 'photo' as const, asset: {_type: 'reference' as const, _ref: assetId}})
  const heroIndex = files.indexOf(heroName)
  const slug = await uniqueSlug(slugify(args.title!))
  const id = `drafts.project-${slug}`

  await client.create({
    _id: id,
    _type: 'project',
    title: args.title,
    slug: {_type: 'slug', current: slug},
    ...(args.subtitle ? {subtitle: args.subtitle} : {}),
    date,
    categories,
    orderRank: await topRank(),
    heroTextTone: 'light',
    hero: {mediaType: 'image', image: photo(assets[heroIndex]._id)},
    blocks: assets
      .filter((_, i) => i !== heroIndex)
      .map((asset) => ({_type: 'imageSingle', _key: randomUUID().slice(0, 12), width: 'medium', align: 'center', image: photo(asset._id)})),
  })

  console.log(`Created draft "${args.title}" (${slug}), dated ${date}, ${files.length} images.`)
  console.log('It is at the top of Projects in the Studio. Add alt text to each image, then publish.')
}

main().catch((err) => {
  console.error(`\n${err instanceof Error ? err.message : err}`)
  process.exit(1)
})
