import Link from 'next/link'

import {DEFAULT_SITE_TITLE, getSettings} from '@/sanity/lib/settings'

export async function SiteFooter() {
  const settings = await getSettings()
  const title = settings?.title ?? DEFAULT_SITE_TITLE
  const nav = settings?.nav ?? {}
  const statement = settings?.footer?.statement?.trim() || settings?.description
  const copyright = (settings?.footer?.copyright?.trim() || `© {year} ${title}. All rights reserved.`).replace(
    '{year}',
    String(new Date().getFullYear()),
  )
  const links = (settings?.socialLinks ?? []).filter((l) => l.url)
  const agents = (settings?.representation ?? []).filter((a) => a.agency)

  return (
    <footer className="mt-block-m border-t border-rule px-gutter pt-8 pb-6">
      <div className="grid gap-x-6 gap-y-8 md:grid-cols-12">
        <div className="md:col-span-5">
          <Link href="/" className="inline-block py-1 hover:text-ink-muted">
            {title}
          </Link>
          {statement ? <p className="mt-2 max-w-[26rem] whitespace-pre-line text-ink-muted">{statement}</p> : null}
        </div>

        <FooterColumn title="Index" className="md:col-span-2">
          <FooterLink href="/">{nav.home ?? 'Selected'}</FooterLink>
          <FooterLink href="/projects">{nav.projects ?? 'Works'}</FooterLink>
          {settings?.hasJournal ? <FooterLink href="/journal">{nav.journal ?? 'Journal'}</FooterLink> : null}
          <FooterLink href="/about">{nav.about ?? 'About'}</FooterLink>
        </FooterColumn>

        {settings?.contactEmail || links.length ? (
          <FooterColumn title="Contact" className="md:col-span-2">
            {settings?.contactEmail ? <FooterLink href={`mailto:${settings.contactEmail}`}>{settings.contactEmail}</FooterLink> : null}
            {links.map((l) => (
              <FooterLink key={l._key} href={l.url!} external>
                {l.label}
              </FooterLink>
            ))}
          </FooterColumn>
        ) : null}

        {agents.length ? (
          <FooterColumn title="Representation" className="md:col-span-3">
            {agents.map((a) => (
              <li key={a._key}>
                {a.region ? <span className="text-ink-muted">{a.region}: </span> : null}
                {a.url ? (
                  <a href={a.url} target="_blank" rel="noopener noreferrer" className="inline-block py-1 hover:text-ink-muted">
                    {a.agency}
                  </a>
                ) : (
                  <span className="inline-block py-1">{a.agency}</span>
                )}
              </li>
            ))}
          </FooterColumn>
        ) : null}
      </div>

      <div className="mt-10 flex flex-col gap-2 text-ink-muted sm:flex-row sm:items-baseline sm:justify-between">
        <p>{copyright}</p>
        <a href="#top" className="inline-block py-1 hover:text-ink">
          [ Back to top ↑ ]
        </a>
      </div>
    </footer>
  )
}

function FooterColumn({title, className = '', children}: {title: string; className?: string; children: React.ReactNode}) {
  return (
    <nav aria-label={title} className={className}>
      <h2 className="mb-2 text-ink-muted">{title}</h2>
      <ul>{children}</ul>
    </nav>
  )
}

function FooterLink({href, external = false, children}: {href: string; external?: boolean; children: React.ReactNode}) {
  const className = 'inline-block py-1 hover:text-ink-muted'
  return (
    <li>
      {external ? (
        <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
          {children}
        </a>
      ) : (
        <Link href={href} className={className}>
          {children}
        </Link>
      )}
    </li>
  )
}
