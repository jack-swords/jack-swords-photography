import Link from 'next/link'

import {SanityImage, type ImageValue} from '@/components/SanityImage'
import {display} from '@/lib/fonts'

export type PostTeaser = {
  _id: string
  title: string | null
  slug: string | null
  date: string | null
  excerpt: string | null
  tags?: string[] | null
  cover: ImageValue
}

export function formatDate(date: string | null | undefined) {
  if (!date) return null
  return new Intl.DateTimeFormat('en-GB', {day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC'}).format(new Date(date))
}

export function PostCard({post, sizes, preload = false}: {post: PostTeaser; sizes: string; preload?: boolean}) {
  if (!post.slug) return null
  return (
    <article>
      <Link href={`/journal/${post.slug}`} className="group block">
        <div className="relative aspect-[4/3] overflow-hidden bg-rule">
          {post.cover?.asset ? (
            <SanityImage image={post.cover} sizes={sizes} cover preload={preload} className="transition-opacity duration-300 group-hover:opacity-90" />
          ) : null}
        </div>
        <p className="mt-3 text-ink-muted">
          <time dateTime={post.date ?? undefined}>{formatDate(post.date)}</time>
          {post.tags?.length ? <span> · {post.tags.join(', ')}</span> : null}
        </p>
        <h2 className={`${display.className} mt-1 text-[1.625rem] leading-tight tracking-[-0.01em] group-hover:text-ink-muted`}>{post.title}</h2>
        {post.excerpt ? <p className="mt-2 line-clamp-3 max-w-prose font-serif text-body text-ink-muted">{post.excerpt}</p> : null}
      </Link>
    </article>
  )
}
