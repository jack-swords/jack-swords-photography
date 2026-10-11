'use client'

import {useReducedMotion} from '@/lib/useReducedMotion'

/**
 * Muted, looping background video. The poster image is rendered underneath by the
 * server (it is the LCP element), and the video is only added once we know the
 * visitor hasn't asked for reduced motion.
 */
export function HeroVideo({src, objectPosition}: {src: string; objectPosition: string}) {
  const reducedMotion = useReducedMotion()
  if (reducedMotion !== false) return null

  return (
    <video
      className="absolute inset-0 h-full w-full object-cover"
      style={{objectPosition}}
      src={src}
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      aria-hidden="true"
    />
  )
}
