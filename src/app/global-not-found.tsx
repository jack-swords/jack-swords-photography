import './globals.css'

import type {Metadata} from 'next'
import {IBM_Plex_Mono, Newsreader} from 'next/font/google'
import Link from 'next/link'

import {NotFoundContent} from '@/components/NotFoundContent'

const ui = IBM_Plex_Mono({subsets: ['latin'], weight: '400', variable: '--font-ui', display: 'swap'})
const story = Newsreader({subsets: ['latin'], style: ['normal'], variable: '--font-story', display: 'swap', preload: false})

export const metadata: Metadata = {
  title: 'Not found — Jack Swords',
  robots: {index: false},
}

// Unknown addresses anywhere on the site. Rendered without the site layout, so it carries its own shell.
export default function GlobalNotFound() {
  return (
    <html lang="en" data-theme="light" className={`${ui.variable} ${story.variable}`}>
      <body className="min-h-svh bg-paper text-ink">
        <header className="px-gutter py-3">
          <Link href="/" className="inline-block py-1 hover:text-ink-muted">
            Jack Swords
          </Link>
        </header>
        <NotFoundContent />
      </body>
    </html>
  )
}
