import Link from 'next/link'

import {DEFAULT_SITE_TITLE, getSettings} from '@/sanity/lib/settings'

export async function SiteHeader() {
  const settings = await getSettings()
  const nav = settings?.nav ?? {}

  return (
    <header className="flex items-baseline justify-between gap-4 px-gutter py-4">
      <Link href="/" className="hover:text-ink-muted">
        {settings?.title ?? DEFAULT_SITE_TITLE}
      </Link>
      <nav aria-label="Main" className="flex gap-3 sm:gap-4">
        <Link href="/" className="hover:text-ink-muted">[ {nav.home ?? 'Selected'} ]</Link>
        <Link href="/projects" className="hover:text-ink-muted">[ {nav.projects ?? 'Works'} ]</Link>
        <Link href="/about" className="hover:text-ink-muted">[ {nav.about ?? 'About'} ]</Link>
      </nav>
    </header>
  )
}
