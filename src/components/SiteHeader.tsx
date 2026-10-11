import Link from 'next/link'

import {DEFAULT_SITE_TITLE, getSettings} from '@/sanity/lib/settings'

type Section = 'home' | 'projects' | 'about'

export async function SiteHeader({current}: {current?: Section}) {
  const settings = await getSettings()
  const nav = settings?.nav ?? {}

  return (
    <header className="flex items-baseline justify-between gap-4 px-gutter py-4">
      <Link href="/" className="hover:text-ink-muted">
        {settings?.title ?? DEFAULT_SITE_TITLE}
      </Link>
      <nav aria-label="Main" className="flex gap-3 sm:gap-4">
        <NavLink href="/" active={current === 'home'} label={nav.home ?? 'Selected'} />
        <NavLink href="/projects" active={current === 'projects'} label={nav.projects ?? 'Works'} />
        <NavLink href="/about" active={current === 'about'} label={nav.about ?? 'About'} />
      </nav>
    </header>
  )
}

function NavLink({href, active, label}: {href: string; active: boolean; label: string}) {
  return (
    <Link href={href} aria-current={active ? 'page' : undefined} className={active ? 'text-ink' : 'text-ink-muted hover:text-ink'}>
      [ {label} ]
    </Link>
  )
}
