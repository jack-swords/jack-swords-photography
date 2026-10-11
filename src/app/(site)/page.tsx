import type {Metadata} from 'next'
import {draftMode} from 'next/headers'
import Link from 'next/link'

import {JsonLd} from '@/components/JsonLd'
import {SanityImage} from '@/components/SanityImage'
import {SiteHeader} from '@/components/SiteHeader'
import {ogImages} from '@/lib/ogImage'
import {personSchema} from '@/lib/structuredData'
import {siteUrl} from '@/sanity/env'
import {editAttr} from '@/sanity/lib/dataAttribute'
import {sanityFetch} from '@/sanity/lib/live'
import {homepageQuery} from '@/sanity/lib/queries'
import {getSettings} from '@/sanity/lib/settings'
import type {HomepageQueryResult} from '@/sanity/types'

const formatBox = {
  wide: 'aspect-video',
  panorama: 'aspect-[2/1]',
} as const

function getHomepage() {
  return sanityFetch<HomepageQueryResult>({query: homepageQuery, tags: ['homepage', 'project', 'category']})
}

export async function generateMetadata(): Promise<Metadata> {
  const [data, settings] = await Promise.all([getHomepage(), getSettings()])
  // A share image set in Site settings wins (from the layout); otherwise the first selected work.
  if (settings?.ogImage) return {alternates: {canonical: '/'}}
  const first = data?.featured?.[0] ?? data?.fallback?.[0]
  return {alternates: {canonical: '/'}, openGraph: {images: ogImages(first?.image)}}
}

export default async function HomePage() {
  const [data, settings, {isEnabled: isDraftMode}] = await Promise.all([
    getHomepage(),
    getSettings(),
    draftMode(),
  ])
  const featured = data?.featured ?? []
  const isFeatured = featured.length > 0
  const rows = isFeatured ? featured : (data?.fallback ?? [])
  const edit = isDraftMode && isFeatured ? {id: 'homepage', type: 'homepage'} : null

  const person = personSchema(settings)
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {'@type': 'WebSite', '@id': `${siteUrl}/#website`, url: siteUrl, name: person.name, publisher: {'@id': person['@id']}},
      person,
      {
        '@type': 'ItemList',
        name: 'Selected works',
        itemListElement: rows
          .filter((row) => row.project?.slug)
          .map((row, i) => ({'@type': 'ListItem', position: i + 1, url: `${siteUrl}/projects/${row.project?.slug}`, name: row.project?.title})),
      },
    ],
  }

  return (
    <>
      <JsonLd data={structuredData} />
      <SiteHeader current="home" />
      <main id="main" className="px-gutter pt-block-s pb-block-m">
        <h1 className="sr-only">Selected works</h1>
        <ol className="flex flex-col gap-block-m">
          {rows.map((row, i) => {
            const project = row.project
            if (!project?.slug) return null
            const format = row.format === 'original' || row.format === 'panorama' ? row.format : 'wide'
            const year = project.date?.slice(0, 4)
            return (
              <li key={row._key} data-sanity={editAttr(edit, `featured[_key=="${row._key}"]`)}>
                <Link href={`/projects/${project.slug}`} className="group block">
                  {format === 'original' ? (
                    <SanityImage image={row.image} sizes="100vw" preload={i === 0} className="transition-opacity duration-300 group-hover:opacity-90" />
                  ) : (
                    <div className={`relative w-full overflow-hidden bg-rule ${formatBox[format]}`}>
                      <SanityImage
                        image={row.image}
                        sizes="100vw"
                        cover
                        preload={i === 0}
                        className="transition-opacity duration-300 group-hover:opacity-90"
                      />
                    </div>
                  )}
                  <div className="mt-3 grid grid-cols-[2.5rem_minmax(0,1fr)_auto] gap-x-4 md:grid-cols-[3rem_minmax(0,2fr)_minmax(0,1fr)_auto] md:gap-x-6">
                    <span className="text-ink-muted tabular-nums">{String(i + 1).padStart(2, '0')}</span>
                    <span>
                      <span className="group-hover:text-ink-muted">{project.title}</span>
                      <span className="block text-ink-muted md:hidden">{project.categories?.filter(Boolean).join(', ')}</span>
                    </span>
                    <span className="hidden text-ink-muted md:block">{project.categories?.filter(Boolean).join(', ')}</span>
                    <span className="text-ink-muted tabular-nums">{year}</span>
                  </div>
                </Link>
              </li>
            )
          })}
        </ol>
        <p className="mt-block-m">
          <Link href="/projects" className="text-ink-muted hover:text-ink">
            [ All works ]
          </Link>
        </p>
      </main>
    </>
  )
}
