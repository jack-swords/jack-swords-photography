import '../globals.css'

import type {Metadata} from 'next'
import {IBM_Plex_Mono, Newsreader} from 'next/font/google'
import {draftMode} from 'next/headers'
import {stegaClean} from 'next-sanity'
import {VisualEditing} from 'next-sanity/visual-editing'

import {DraftModeBanner} from '@/components/DraftModeBanner'
import {SiteFooter} from '@/components/SiteFooter'
import {siteUrl} from '@/sanity/env'
import {SanityLive} from '@/sanity/lib/live'
import {DEFAULT_SITE_TITLE, getSettings} from '@/sanity/lib/settings'

const ui = IBM_Plex_Mono({subsets: ['latin'], weight: '400', variable: '--font-ui', display: 'swap'})
// Story text sits below the fold, so it isn't preloaded and doesn't compete with the hero.
const story = Newsreader({subsets: ['latin'], style: ['normal', 'italic'], variable: '--font-story', display: 'swap', preload: false})

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings()
  const title = stegaClean(settings?.title) ?? DEFAULT_SITE_TITLE
  const description = stegaClean(settings?.description) ?? undefined
  const ogImage = settings?.ogImage ? `${settings.ogImage}?w=1200&h=630&fit=crop&auto=format` : undefined
  return {
    metadataBase: new URL(siteUrl),
    title: {default: title, template: `%s — ${title}`},
    description,
    openGraph: {
      siteName: title,
      type: 'website',
      locale: 'en_GB',
      ...(ogImage ? {images: [{url: ogImage, width: 1200, height: 630}]} : {}),
    },
    twitter: {card: 'summary_large_image'},
  }
}

// Each page renders its own header: the project page overlays it on the hero.
export default async function SiteLayout({children}: {children: React.ReactNode}) {
  const [settings, {isEnabled: isDraftMode}] = await Promise.all([getSettings(), draftMode()])

  return (
    <html lang="en" data-theme={settings?.theme === 'dark' ? 'dark' : 'light'} className={`${ui.variable} ${story.variable}`}>
      <body id="top" className="min-h-svh bg-paper text-ink">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-gutter focus:z-50 focus:bg-ink focus:px-3 focus:py-2 focus:text-paper"
        >
          Skip to content
        </a>
        {children}
        <SiteFooter />
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
