'use client'

import {useSyncExternalStore} from 'react'

const query = '(prefers-reduced-motion: reduce)'

function subscribe(onChange: () => void) {
  const mql = window.matchMedia(query)
  mql.addEventListener('change', onChange)
  return () => mql.removeEventListener('change', onChange)
}

/**
 * True when the visitor prefers reduced motion. Returns `null` during server
 * rendering and hydration, so callers can hold back motion until they know.
 */
export function useReducedMotion(): boolean | null {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => null,
  )
}
