import '../globals.css'

import type {Metadata} from 'next'
import {IBM_Plex_Mono, Newsreader} from 'next/font/google'
import {draftMode} from 'next/headers'
import {stegaClean} from 'next-sanity'
import {VisualEditing} from 'next-sanity/visual-editing'

import {DraftModeBanner} from '@/components/DraftModeBanner'
import {siteUrl} from '@/sanity/env'
import {SanityLive} from '@/sanity/lib/live'
import {DEFAULT_SITE_TITLE, getSettings} from '@/sanity/lib/settings'

const ui = IBM_Plex_Mono({subsets: ['latin'], weight: ['400', '500'], variable: '--font-ui', display: 'swap'})
const story = Newsreader({subsets: ['latin'], style: ['normal', 'italic'], variable: '--font-story', display: 'swap'})

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings()
  const title = stegaClean(settings?.title) ?? DEFAULT_SITE_TITLE
  return {
    metadataBase: new URL(siteUrl),
    title: {default: title, template: `%s — ${title}`},
    description: stegaClean(settings?.description),
  }
}

// Each page renders its own header: the project page overlays it on the hero.
export default async function SiteLayout({children}: {children: React.ReactNode}) {
  const [settings, {isEnabled: isDraftMode}] = await Promise.all([getSettings(), draftMode()])

  return (
    <html lang="en" data-theme={settings?.theme === 'dark' ? 'dark' : 'light'} className={`${ui.variable} ${story.variable}`}>
      <body className="min-h-svh bg-paper text-ink">
        {children}
        <SanityLive />
        {isDraftMode ? (
          <>
            <VisualEditing />
            <DraftModeBanner />
          </>
        ) : null}
      </body>
    </html>
  )
}
