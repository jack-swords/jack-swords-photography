import type {Metadata} from 'next'
import {draftMode} from 'next/headers'
import Link from 'next/link'
import {notFound} from 'next/navigation'
import {stegaClean} from 'next-sanity'

import {formatDate, PostCard} from '@/components/journal/PostCard'
import {JsonLd} from '@/components/JsonLd'
import {ProjectBlocks, type Block} from '@/components/project/ProjectBlocks'
import {SanityImage} from '@/components/SanityImage'
import {SiteHeader} from '@/components/SiteHeader'
import {display} from '@/lib/fonts'
import {ogImages} from '@/lib/ogImage'
import {personRef} from '@/lib/structuredData'
import {siteUrl} from '@/sanity/env'
import {client} from '@/sanity/lib/client'
import {editAttr} from '@/sanity/lib/dataAttribute'
import {urlFor} from '@/sanity/lib/image'
import {sanityFetch} from '@/sanity/lib/live'
import {postQuery, postSlugsQuery} from '@/sanity/lib/queries'
import {getSettings} from '@/sanity/lib/settings'
import type {PostQueryResult} from '@/sanity/types'

type Props = {params: Promise<{slug: string}>}

function getPost(slug: string) {
  return sanityFetch<PostQueryResult>({query: postQuery, params: {slug}, tags: ['post', `post:${slug}`]})
}

export async function generateStaticParams() {
  const slugs = await client.fetch<string[]>(postSlugsQuery)
  return slugs.map((slug) => ({slug}))
}

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {slug} = await params
  const post = await getPost(slug)
  if (!post) return {}
  const title = stegaClean(post.seo?.title ?? post.title) ?? undefined
  const description = stegaClean(post.seo?.description ?? post.excerpt) ?? undefined
  const images = post.seo?.ogImage
    ? [{url: `${post.seo.ogImage}?w=1200&h=630&fit=crop&auto=format`, width: 1200, height: 630}]
    : ogImages(post.cover)
  return {
    title,
    description,
    alternates: {canonical: `/journal/${post.slug}`},
    openGraph: {type: 'article', title, description, publishedTime: post.date ?? undefined, images},
  }
}

export default async function PostPage({params}: Props) {
  const {slug} = await params
  const [post, settings, {isEnabled: isDraftMode}] = await Promise.all([getPost(slug), getSettings(), draftMode()])
  if (!post) notFound()

  const edit = isDraftMode ? {id: post._id, type: 'post'} : null
  const coverLayout = post.coverLayout === 'full' || post.coverLayout === 'none' ? post.coverLayout : 'wide'
  const journalLabel = settings?.nav?.journal ?? 'Journal'

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    url: `${siteUrl}/journal/${post.slug}`,
    ...(post.date ? {datePublished: post.date} : {}),
    ...(post.excerpt ? {description: post.excerpt} : {}),
    ...(post.cover?.asset ? {image: urlFor(post.cover).width(1600).url()} : {}),
    ...(post.tags?.length ? {keywords: post.tags.join(', ')} : {}),
    author: personRef,
  }

  return (
    <>
      <JsonLd data={structuredData} />
      <SiteHeader current="journal" />
      <main id="main">
        <article>
          <header className="px-gutter pt-block-s">
            <div className="mx-auto max-w-medium">
              <p className="text-ink-muted">
                <Link href="/journal" className="hover:text-ink">
                  {journalLabel}
                </Link>
                {' · '}
                <time dateTime={post.date ?? undefined}>{formatDate(post.date)}</time>
                {post.tags?.length ? <span> · {post.tags.join(', ')}</span> : null}
              </p>
              <h1 className={`${display.className} mt-4 text-[clamp(2.25rem,1rem+4vw,4.5rem)] leading-[1] tracking-[-0.02em] text-balance`}>
                {post.title}
              </h1>
              {post.excerpt ? <p className="mt-6 max-w-prose font-serif text-lead">{post.excerpt}</p> : null}
            </div>
          </header>

          {post.cover?.asset && coverLayout !== 'none' ? (
            <div className="px-gutter pt-block-s" data-sanity={editAttr(edit, 'cover')}>
              <div className={coverLayout === 'wide' ? 'mx-auto max-w-wide' : ''}>
                <SanityImage image={post.cover} preload sizes={coverLayout === 'wide' ? '(min-width: 1280px) 1216px, 100vw' : '100vw'} />
              </div>
            </div>
          ) : null}

          <div className="pt-block-m">
            <ProjectBlocks blocks={post.blocks as Block[] | null} edit={edit} />
          </div>

          {post.relatedProject?.slug ? (
            <p className="px-gutter pt-block-s">
              <span className="mx-auto block max-w-prose">
                <span className="text-ink-muted">From the project </span>
                <Link href={`/projects/${post.relatedProject.slug}`} className="underline decoration-1 underline-offset-[3px] hover:text-ink-muted">
                  {post.relatedProject.title}
                </Link>
              </span>
            </p>
          ) : null}
        </article>

        {post.more?.length ? (
          <section aria-labelledby="more-heading" className="mt-block-m border-t border-rule px-gutter pt-6">
            <div className="mb-6 flex items-baseline justify-between">
              <h2 id="more-heading" className="text-ink-muted">
                More from the {journalLabel.toLowerCase()}
              </h2>
              <Link href="/journal" className="text-ink-muted hover:text-ink">
                [ All entries ]
              </Link>
            </div>
            <div className="grid gap-x-6 gap-y-block-s md:grid-cols-2">
              {post.more.map((p) => (
                <PostCard key={p._id} post={p} sizes="(min-width: 768px) 50vw, 100vw" />
              ))}
            </div>
          </section>
        ) : null}
      </main>
    </>
  )
}
