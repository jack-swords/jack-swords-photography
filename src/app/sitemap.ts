import type {MetadataRoute} from 'next'

import {siteUrl} from '@/sanity/env'
import {client} from '@/sanity/lib/client'
import {sitemapQuery} from '@/sanity/lib/queries'
import type {SitemapQueryResult} from '@/sanity/types'

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const {projects, posts, latest} = await client.fetch<SitemapQueryResult>(sitemapQuery, {}, {next: {tags: ['sanity'], revalidate: 3600}})
  const lastModified = latest ? new Date(latest) : new Date()
  return [
    {url: `${siteUrl}/`, lastModified, priority: 1},
    {url: `${siteUrl}/projects`, lastModified, priority: 0.8},
    {url: `${siteUrl}/about`, lastModified, priority: 0.5},
    ...projects.map((p) => ({url: `${siteUrl}/projects/${p.slug}`, lastModified: new Date(p._updatedAt), priority: 0.7})),
    ...(posts.length ? [{url: `${siteUrl}/journal`, lastModified, priority: 0.6}] : []),
    ...posts.map((p) => ({url: `${siteUrl}/journal/${p.slug}`, lastModified: new Date(p._updatedAt), priority: 0.5})),
  ]
}
