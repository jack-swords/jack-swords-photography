'use client'

import Link from 'next/link'
import {useSyncExternalStore} from 'react'

/** Key the projects index writes its current URL to (including ?category=…), see milestone 3. */
export const PROJECTS_RETURN_KEY = 'projects:return'

function readReturnHref() {
  try {
    const href = window.sessionStorage.getItem(PROJECTS_RETURN_KEY)
    return href?.startsWith('/projects') ? href : '/projects'
  } catch {
    return '/projects'
  }
}

export function CloseButton() {
  const href = useSyncExternalStore(
    () => () => {},
    readReturnHref,
    () => '/projects',
  )

  return (
    <Link
      href={href}
      aria-label="Close project and return to the list"
      className="fixed top-4 right-gutter z-30 text-white mix-blend-difference hover:opacity-60"
    >
      [ close ]
    </Link>
  )
}
