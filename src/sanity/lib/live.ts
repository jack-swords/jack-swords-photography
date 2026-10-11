import 'server-only'

import {defineLive} from 'next-sanity/live'

import {isSanityConfigured} from '../env'
import {client} from './client'

// Viewer (read-only) token: lets draft mode show unpublished changes.
// It reaches the browser only in draft mode, for editors previewing drafts.
const token = process.env.SANITY_API_READ_TOKEN || undefined

const live = defineLive({client, serverToken: token ?? false, browserToken: token ?? false})

/** Render once in the root layout: refreshes pages the moment content is published. */
export const SanityLive = live.SanityLive

/**
 * Fetch content. Published by default; drafts with visual-editing markers in draft mode.
 * Results are cached until Sanity Live (or the publish webhook) says they changed.
 * Every fetch also carries the `sanity` tag, which the webhook revalidates.
 */
export async function sanityFetch<T>({
  query,
  params = {},
  tags = [],
}: {
  query: string
  params?: Record<string, unknown>
  tags?: string[]
}): Promise<T | null> {
  if (!isSanityConfigured) return null
  const {data} = await live.sanityFetch({query, params, tags: ['sanity', ...tags]})
  return data as T
}
