import {draftMode} from 'next/headers'
import Link from 'next/link'

import {SanityImage} from '@/components/SanityImage'
import {SiteHeader} from '@/components/SiteHeader'
import {editAttr} from '@/sanity/lib/dataAttribute'
import {sanityFetch} from '@/sanity/lib/live'
import {homepageQuery} from '@/sanity/lib/queries'
import type {HomepageQueryResult} from '@/sanity/types'

const formatBox = {
  wide: 'aspect-video',
  panorama: 'aspect-[2/1]',
} as const

export default async function HomePage() {
  const [data, {isEnabled: isDraftMode}] = await Promise.all([
    sanityFetch<HomepageQueryResult>({query: homepageQuery, tags: ['homepage', 'project', 'category']}),
    draftMode(),
  ])
  const featured = data?.featured ?? []
  const isFeatured = featured.length > 0
  const rows = isFeatured ? featured : (data?.fallback ?? [])
  const edit = isDraftMode && isFeatured ? {id: 'homepage', type: 'homepage'} : null

  return (
    <>
      <SiteHeader current="home" />
      <main className="px-gutter pt-block-s pb-block-m">
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
