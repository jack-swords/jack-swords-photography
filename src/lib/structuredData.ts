import {stegaClean} from 'next-sanity'

import {siteUrl} from '@/sanity/env'
import type {SettingsQueryResult} from '@/sanity/types'

/** The photographer, referenced from every page's structured data by its @id. */
export function personSchema(settings: SettingsQueryResult | null) {
  const name = stegaClean(settings?.title) ?? 'Jack Swords'
  const sameAs = (settings?.socialLinks ?? []).map((l) => stegaClean(l.url)).filter((u): u is string => Boolean(u?.startsWith('http')))
  return {
    '@type': 'Person',
    '@id': `${siteUrl}/#person`,
    name,
    url: siteUrl,
    jobTitle: 'Photographer',
    ...(settings?.contactEmail ? {email: `mailto:${stegaClean(settings.contactEmail)}`} : {}),
    ...(sameAs.length ? {sameAs} : {}),
  }
}

export const personRef = {'@id': `${siteUrl}/#person`}
