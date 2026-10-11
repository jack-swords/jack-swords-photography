import {cache} from 'react'

import {sanityFetch} from './client'
import {settingsQuery} from './queries'
import type {SettingsQueryResult} from '../types'

/** Site settings, fetched once per request however many components ask. */
export const getSettings = cache(() => sanityFetch<SettingsQueryResult>({query: settingsQuery, tags: ['siteSettings']}))

export const DEFAULT_SITE_TITLE = 'Jack Swords'
