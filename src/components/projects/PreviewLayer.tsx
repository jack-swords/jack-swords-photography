'use client'

import {useEffect, useRef} from 'react'

import {SanityImage, type ImageValue} from '@/components/SanityImage'

type Item = {_id: string; image: ImageValue}

const WIDTH = 'w-[min(24vw,360px)]'

/**
 * Hover previews for the projects index (mouse/trackpad devices only).
 * All previews are stacked and cross-faded so switching rows is instant.
 * `cursor` follows the pointer; `fixed` sits at the right edge, vertically centred.
 */
export function PreviewLayer({items, activeId, mode}: {items: Item[]; activeId: string | null; mode: 'cursor' | 'fixed'}) {
  const layer = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (mode !== 'cursor') return
    const el = layer.current
    if (!el) return
    let frame = 0
    const onMove = (event: PointerEvent) => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const gap = 24
        const width = el.offsetWidth
        // Sit to the right of the pointer, flipping left near the edge of the window.
        const x = event.clientX + gap + width > window.innerWidth ? event.clientX - gap - width : event.clientX + gap
        const y = Math.min(event.clientY + gap, window.innerHeight - el.offsetHeight - gap)
        el.style.transform = `translate3d(${x}px, ${Math.max(gap, y)}px, 0)`
      })
    }
    window.addEventListener('pointermove', onMove, {passive: true})
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('pointermove', onMove)
    }
  }, [mode])

  const position = mode === 'cursor' ? 'top-0 left-0' : 'top-1/2 right-[calc(var(--spacing-gutter)+7rem)] -translate-y-1/2'

  return (
    <div
      ref={layer}
      aria-hidden="true"
      className={`pointer-events-none fixed z-40 hidden pointer-fine:block ${position} ${WIDTH}`}
    >
      {items.map((item) =>
        item.image?.asset ? (
          <div
            key={item._id}
            className={`absolute top-0 left-0 w-full transition-opacity duration-200 motion-reduce:transition-none ${activeId === item._id ? 'opacity-100' : 'opacity-0'}`}
          >
            <SanityImage image={item.image} sizes="360px" />
          </div>
        ) : null,
      )}
    </div>
  )
}
