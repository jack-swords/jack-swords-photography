import '../globals.css'

import type {Metadata} from 'next'
import {IBM_Plex_Mono, Newsreader} from 'next/font/google'
import Link from 'next/link'

import {isSanityConfigured, siteUrl} from '@/sanity/env'
import {sanityFetch} from '@/sanity/lib/client'
import {settingsQuery} from '@/sanity/lib/queries'
import type {SettingsQueryResult} from '@/sanity/types'

const ui = IBM_Plex_Mono({subsets: ['latin'], weight: ['400', '500'], variable: '--font-ui', display: 'swap'})
const story = Newsreader({subsets: ['latin'], style: ['normal', 'italic'], variable: '--font-story', display: 'swap'})

async function getSettings() {
  return sanityFetch<SettingsQueryResult>({query: settingsQuery, tags: ['siteSettings']})
}

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings()
  const title = settings?.title ?? 'Jack Swords'
  return {
    metadataBase: new URL(siteUrl),
    title: {default: title, template: `%s — ${title}`},
    description: settings?.description,
  }
}

export default async function SiteLayout({children}: {children: React.ReactNode}) {
  const settings = await getSettings()
  const nav = settings?.nav ?? {}

  return (
    <html lang="en" data-theme={settings?.theme === 'dark' ? 'dark' : 'light'} className={`${ui.variable} ${story.variable}`}>
      <body className="min-h-svh bg-paper text-ink">
        <header className="flex items-baseline justify-between px-gutter py-4">
          <Link href="/" className="hover:text-ink-muted">
            {settings?.title ?? 'Jack Swords'}
          </Link>
          <nav aria-label="Main" className="flex gap-4">
            <Link href="/">[ {nav.home ?? 'Selected'} ]</Link>
            <Link href="/projects">[ {nav.projects ?? 'Works'} ]</Link>
            <Link href="/about">[ {nav.about ?? 'About'} ]</Link>
          </nav>
        </header>
        {isSanityConfigured ? children : <SetupNotice />}
      </body>
    </html>
  )
}

function SetupNotice() {
  return (
    <main className="px-gutter py-block-m">
      <p className="max-w-prose">
        Sanity isn&apos;t connected yet. Copy <code>.env.example</code> to <code>.env.local</code>, set{' '}
        <code>NEXT_PUBLIC_SANITY_PROJECT_ID</code>, then run <code>pnpm seed</code>. See the README.
      </p>
    </main>
  )
}
