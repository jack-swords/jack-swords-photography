import Link from 'next/link'

import {DEFAULT_SITE_TITLE, getSettings} from '@/sanity/lib/settings'

type Section = 'home' | 'projects' | 'journal' | 'about'

export async function SiteHeader({current}: {current?: Section}) {
  const settings = await getSettings()
  const nav = settings?.nav ?? {}

  return (
    <header className="flex flex-wrap items-baseline justify-between gap-x-4 px-gutter py-3">
      <Link href="/" className="inline-block py-1 hover:text-ink-muted">
        {settings?.title ?? DEFAULT_SITE_TITLE}
      </Link>
      <nav aria-label="Main" className="flex flex-wrap gap-x-3 sm:gap-x-4">
        <NavLink href="/" active={current === 'home'} label={nav.home ?? 'Selected'} />
        <NavLink href="/projects" active={current === 'projects'} label={nav.projects ?? 'Works'} />
        {settings?.hasJournal ? <NavLink href="/journal" active={current === 'journal'} label={nav.journal ?? 'Journal'} /> : null}
        <NavLink href="/about" active={current === 'about'} label={nav.about ?? 'About'} />
      </nav>
    </header>
  )
}

function NavLink({href, active, label}: {href: string; active: boolean; label: string}) {
  return (
    <Link href={href} aria-current={active ? 'page' : undefined} className={`inline-block py-1 ${active ? 'text-ink' : 'text-ink-muted hover:text-ink'}`}>
      [ {label} ]
    </Link>
  )
}
