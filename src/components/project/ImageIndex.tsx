'use client'

import {useEffect, useRef, useState} from 'react'

import {useReducedMotion} from '@/lib/useReducedMotion'

/**
 * Fixed column of image numbers (desktop) or a compact "4 / 24" counter (mobile).
 * The highlighted number is the image crossing the middle of the viewport.
 */
export function ImageIndex({total}: {total: number}) {
  const [active, setActive] = useState<number | null>(null)
  // The number last clicked stays highlighted while its image is on the centre line,
  // even when a side-by-side neighbour with a lower number is there too.
  const pinned = useRef<number | null>(null)
  const pinnedArrived = useRef(false)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    const figures = Array.from(document.querySelectorAll<HTMLElement>('[data-image-index]'))
    const visible = new Set<number>()
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const n = Number((entry.target as HTMLElement).dataset.imageIndex)
          if (entry.isIntersecting) visible.add(n)
          else visible.delete(n)
        }
        if (pinned.current !== null) {
          // Hold the clicked number during the smooth scroll there, and until its image leaves.
          if (visible.has(pinned.current)) pinnedArrived.current = true
          if (visible.has(pinned.current) || !pinnedArrived.current) {
            setActive(pinned.current)
            return
          }
          pinned.current = null
        }
        // Side-by-side images share the centre line: highlight the first.
        setActive(visible.size ? Math.min(...visible) : null)
      },
      {rootMargin: '-50% 0px -50% 0px'},
    )
    figures.forEach((figure) => observer.observe(figure))
    // Scrolling by hand cancels a pending jump.
    const unpin = () => {
      pinned.current = null
    }
    window.addEventListener('wheel', unpin, {passive: true})
    window.addEventListener('touchmove', unpin, {passive: true})
    return () => {
      observer.disconnect()
      window.removeEventListener('wheel', unpin)
      window.removeEventListener('touchmove', unpin)
    }
  }, [])

  if (total === 0) return null

  const goTo = (n: number) => {
    pinned.current = n
    pinnedArrived.current = false
    setActive(n)
    document.getElementById(`image-${n}`)?.scrollIntoView({behavior: reducedMotion ? 'auto' : 'smooth', block: 'center'})
  }

  return (
    <>
      <nav
        aria-label="Images"
        className="fixed top-1/2 right-gutter z-20 hidden max-h-[80svh] -translate-y-1/2 flex-col overflow-y-auto text-white mix-blend-difference md:flex"
      >
        {Array.from({length: total}, (_, i) => i + 1).map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => goTo(n)}
            aria-label={`Image ${n} of ${total}`}
            aria-current={active === n ? 'true' : undefined}
            className={`px-1 py-px text-right tabular-nums transition-opacity duration-300 hover:opacity-100 ${active === n ? 'opacity-100' : 'opacity-35'}`}
          >
            {n}
          </button>
        ))}
      </nav>

      <p
        aria-hidden="true"
        className={`fixed right-gutter bottom-4 z-20 text-white tabular-nums mix-blend-difference transition-opacity duration-300 md:hidden ${active ? 'opacity-100' : 'opacity-0'}`}
      >
        {active ?? 1} / {total}
      </p>
    </>
  )
}
