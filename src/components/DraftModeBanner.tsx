'use client'

import {useSyncExternalStore} from 'react'

const noop = () => () => {}

/**
 * Shown in draft mode when the site is open on its own (not inside the Studio's
 * Presentation tool), so editors don't mistake drafts for the live site.
 */
export function DraftModeBanner() {
  const standalone = useSyncExternalStore(
    noop,
    () => window.self === window.top,
    () => false,
  )
  if (!standalone) return null

  return (
    <div className="fixed bottom-4 left-gutter z-50 flex gap-3 bg-ink px-3 py-2 text-paper">
      <span>Previewing drafts</span>
      <a href={`/api/draft-mode/disable?redirect=${encodeURIComponent('/')}`} className="underline underline-offset-2">
        Exit
      </a>
    </div>
  )
}
