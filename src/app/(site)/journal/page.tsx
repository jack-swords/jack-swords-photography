import type {Metadata} from 'next'

import {PostCard} from '@/components/journal/PostCard'
import {SiteHeader} from '@/components/SiteHeader'
import {ogImages} from '@/lib/ogImage'
import {sanityFetch} from '@/sanity/lib/live'
import {postsIndexQuery} from '@/sanity/lib/queries'
import {getSettings} from '@/sanity/lib/settings'
import type {PostsIndexQueryResult} from '@/sanity/types'

function getPosts() {
  return sanityFetch<PostsIndexQueryResult>({query: postsIndexQuery, tags: ['post']})
}

export async function generateMetadata(): Promise<Metadata> {
  const [posts, settings] = await Promise.all([getPosts(), getSettings()])
  return {
    title: settings?.nav?.journal ?? 'Journal',
    alternates: {canonical: '/journal', types: {'application/rss+xml': '/journal/rss.xml'}},
    ...(settings?.ogImage ? {} : {openGraph: {images: ogImages(posts?.[0]?.cover)}}),
  }
}

export default async function JournalPage() {
  const [posts, settings] = await Promise.all([getPosts(), getSettings()])
  const list = posts ?? []

  return (
    <>
      <SiteHeader current="journal" />
      <main id="main" className="px-gutter pt-block-s pb-block-m">
        <h1 className="sr-only">{settings?.nav?.journal ?? 'Journal'}</h1>
        {list.length ? (
          <div className="grid gap-x-6 gap-y-block-s md:grid-cols-2 xl:grid-cols-3">
            {list.map((post, i) => (
              <PostCard key={post._id} post={post} preload={i === 0} sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw" />
            ))}
          </div>
        ) : (
          <p className="text-ink-muted">Nothing here yet.</p>
        )}
      </main>
    </>
  )
}
