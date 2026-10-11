import {siteUrl} from '@/sanity/env'
import {client} from '@/sanity/lib/client'
import {urlFor} from '@/sanity/lib/image'
import {postsIndexQuery, settingsQuery} from '@/sanity/lib/queries'
import type {PostsIndexQueryResult, SettingsQueryResult} from '@/sanity/types'

export const revalidate = 3600

const escape = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

/** RSS feed of journal entries, for feed readers and newsletter tools. */
export async function GET() {
  const fetchOptions = {next: {tags: ['sanity', 'post'], revalidate: 3600}}
  const [posts, settings] = await Promise.all([
    client.fetch<PostsIndexQueryResult>(postsIndexQuery, {}, fetchOptions),
    client.fetch<SettingsQueryResult>(settingsQuery, {}, fetchOptions),
  ])
  const title = `${settings?.title ?? 'Jack Swords'} — ${settings?.nav?.journal ?? 'Journal'}`
  const items = posts
    .filter((p) => p.slug)
    .map((p) => {
      const url = `${siteUrl}/journal/${p.slug}`
      const image = p.cover?.asset ? `<enclosure url="${escape(urlFor(p.cover).width(1200).url())}" type="image/jpeg" />` : ''
      return `<item>
  <title>${escape(p.title ?? '')}</title>
  <link>${url}</link>
  <guid isPermaLink="true">${url}</guid>
  ${p.date ? `<pubDate>${new Date(p.date).toUTCString()}</pubDate>` : ''}
  ${p.excerpt ? `<description>${escape(p.excerpt)}</description>` : ''}
  ${image}
</item>`
    })
    .join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>${escape(title)}</title>
  <link>${siteUrl}/journal</link>
  <description>${escape(settings?.description ?? title)}</description>
  <language>en-gb</language>
  <atom:link href="${siteUrl}/journal/rss.xml" rel="self" type="application/rss+xml" />
${items}
</channel>
</rss>`
  return new Response(xml, {headers: {'content-type': 'application/rss+xml; charset=utf-8'}})
}
