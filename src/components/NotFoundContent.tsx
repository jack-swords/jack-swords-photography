import Link from 'next/link'

import {display} from '@/lib/fonts'

/** Shared body of both 404 pages. */
export function NotFoundContent() {
  return (
    <main id="main" className="flex min-h-[60svh] flex-col justify-center px-gutter py-block-m">
      <p className="text-ink-muted">404</p>
      <h1 className={`${display.className} mt-2 text-[clamp(2.75rem,1rem+6vw,7rem)] leading-[0.95] tracking-[-0.02em]`}>
        Nothing here.
      </h1>
      <p className="mt-6 max-w-prose font-serif text-lead">The page may have moved, or the link may be mistyped.</p>
      <nav aria-label="Suggestions" className="mt-8 flex flex-wrap gap-x-4">
        <Link href="/" className="inline-block py-1 hover:text-ink-muted">
          [ Selected works ]
        </Link>
        <Link href="/projects" className="inline-block py-1 hover:text-ink-muted">
          [ All projects ]
        </Link>
        <Link href="/about" className="inline-block py-1 hover:text-ink-muted">
          [ About ]
        </Link>
      </nav>
    </main>
  )
}
