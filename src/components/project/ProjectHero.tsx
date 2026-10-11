import Link from 'next/link'

import {focalPoint, SanityImage, viewportCoverSizes, type ImageValue} from '@/components/SanityImage'

import {HeroVideo} from './HeroVideo'

type Props = {
  siteTitle: string
  title: string
  tone: 'light' | 'dark'
  hero: {mediaType: string; image: ImageValue; poster: ImageValue; videoUrl: string | null}
  credits: {_key: string; label: string | null; value: string | null}[]
  /** data-sanity attribute for the hero media (draft mode only). */
  edit?: string
}

export function ProjectHero({siteTitle, title, tone, hero, credits, edit}: Props) {
  const isVideo = hero.mediaType === 'video' && Boolean(hero.videoUrl)
  const still = isVideo ? hero.poster : hero.image

  return (
    <section
      aria-label={title}
      className={`relative h-svh w-full overflow-hidden ${tone === 'dark' ? 'bg-[#e9e7e2] text-[#161616]' : 'bg-[#161616] text-white'}`}
    >
      <div className="absolute inset-0" data-sanity={edit}>
        <SanityImage image={still} sizes={viewportCoverSizes(still)} cover preload />
      </div>
      {isVideo && hero.videoUrl && still ? <HeroVideo src={hero.videoUrl} objectPosition={focalPoint(still)} /> : null}

      <div className="absolute inset-0 flex flex-col justify-between px-gutter py-4">
        <Link href="/" className="self-start hover:opacity-60">
          {siteTitle}
        </Link>

        <div className="flex flex-col gap-4 pb-8 sm:flex-row sm:items-end sm:justify-between">
          <h1>{title}</h1>
          {credits.length > 0 ? (
            <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-0.5 sm:text-right">
              {credits.map((credit) => (
                <div key={credit._key} className="contents">
                  <dt className="opacity-60">{credit.label}</dt>
                  <dd>{credit.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}
        </div>
      </div>

      <a
        href="#main"
        className="absolute bottom-4 left-1/2 -translate-x-1/2 px-2 py-1 opacity-70 hover:opacity-100"
        aria-label="Scroll to the story"
      >
        <span aria-hidden="true" className="block motion-safe:animate-[nudge_2.4s_var(--ease-quiet)_infinite]">
          ↓
        </span>
      </a>
    </section>
  )
}
