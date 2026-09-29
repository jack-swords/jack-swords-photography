import {createClient} from 'next-sanity'

import {apiVersion, dataset, isSanityConfigured, projectId} from '../env'

export const client = createClient({
  // A placeholder keeps the client constructible before the project exists;
  // fetches are skipped in that case (see sanityFetch).
  projectId: projectId || 'unconfigured',
  dataset,
  apiVersion,
  useCdn: true,
  perspective: 'published',
})

/**
 * Fetch published content, tagged for on-demand revalidation.
 * Every query carries the `sanity` tag plus any document-type tags passed in,
 * so the webhook route (milestone 5) can revalidate precisely.
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
  return client.fetch<T>(query, params, {
    next: {tags: ['sanity', ...tags], revalidate: 3600},
  })
}
