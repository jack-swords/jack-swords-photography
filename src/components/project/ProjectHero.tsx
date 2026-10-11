import {Inter_Tight} from 'next/font/google'
import Link from 'next/link'

import {focalPoint, SanityImage, viewportCoverSizes, type ImageValue} from '@/components/SanityImage'

import {HeroVideo} from './HeroVideo'

// Display face for big hero titles. Loaded here, so only project pages fetch it.
const display = Inter_Tight({subsets: ['latin'], weight: '400', display: 'swap'})

export type HeroText = {
  showTitle?: boolean | null
  title?: string | null
  titleSize?: 'medium' | 'large' | 'xl' | null
  titlePosition?: 'center' | 'bottom' | null
  titleFont?: 'sans' | 'serif' | 'mono' | null
  details?: {_key: string; text: string | null; href: string | null}[] | null
  statement?: string | null
  showStatement?: boolean | null
} | null

const titleSize = {
  medium: 'text-[clamp(2.25rem,1rem+4.5vw,5rem)]',
  large: 'text-[clamp(2.75rem,1rem+6.5vw,8rem)]',
  xl: 'text-[clamp(3.25rem,0.5rem+10vw,12rem)]',
} as const

type Props = {
  siteTitle: string
  title: string
  /** Subtitle: the default statement when none is set. */
  subtitle?: string | null
  heroText?: HeroText
  tone: 'light' | 'dark'
  hero: {mediaType: string; image: ImageValue; poster: ImageValue; videoUrl: string | null}
  credits: {_key: string; label: string | null; value: string | null}[]
  /** data-sanity attribute for the hero media (draft mode only). */
  edit?: string
}

export function ProjectHero({siteTitle, title, subtitle, heroText, tone, hero, credits, edit}: Props) {
  const isVideo = hero.mediaType === 'video' && Boolean(hero.videoUrl)
  const still = isVideo ? hero.poster : hero.image

  const showTitle = heroText?.showTitle !== false
  const bigTitle = heroText?.title?.trim() || title
  const titleFont = heroText?.titleFont === 'serif' ? 'font-serif' : heroText?.titleFont === 'mono' ? 'font-sans' : display.className
  const statement = heroText?.showStatement === false ? null : heroText?.statement?.trim() || subtitle?.trim() || null
  const details = (heroText?.details ?? []).filter((d) => d.text)
  const centred = heroText?.titlePosition !== 'bottom'

  return (
    <section
      data-project-hero
      aria-label={title}
      className={`relative h-svh w-full overflow-hidden ${tone === 'dark' ? 'bg-[#e9e7e2] text-[#161616]' : 'bg-[#161616] text-white'}`}
    >
      <div className="absolute inset-0" data-sanity={edit}>
        <SanityImage image={still} sizes={viewportCoverSizes(still)} cover preload />
      </div>
      {isVideo && hero.videoUrl && still ? <HeroVideo src={hero.videoUrl} objectPosition={focalPoint(still)} /> : null}

      {/* Soft shading behind the overlay text (top and bottom edges only) so it stays readable over any image or footage. */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 ${
          tone === 'dark'
            ? 'bg-[linear-gradient(to_bottom,rgb(255_255_255/0.35),transparent_18%,transparent_70%,rgb(255_255_255/0.45))]'
            : 'bg-[linear-gradient(to_bottom,rgb(0_0_0/0.3),transparent_18%,transparent_70%,rgb(0_0_0/0.4))]'
        }`}
      />

      {showTitle ? (
        <h1
          className={`pointer-events-none absolute inset-x-gutter leading-[0.95] tracking-[-0.02em] text-balance ${titleFont} ${
            titleSize[heroText?.titleSize ?? 'large']
          } ${centred ? 'top-1/2 -translate-y-1/2 text-center' : 'bottom-[calc(var(--spacing-block-s)+4.5rem)] text-left'}`}
        >
          {bigTitle}
        </h1>
      ) : (
        <h1 className="sr-only">{title}</h1>
      )}

      <div className="absolute inset-0 flex flex-col justify-between px-gutter py-4">
        <div className="flex items-start justify-between gap-6">
          <Link href="/" className="hover:opacity-60">
            {siteTitle}
          </Link>
          {/* Sits below the fixed [ close ] control. */}
          {details.length > 0 ? (
            <ul className="mt-9 text-right">
              {details.map((d) => (
                <li key={d._key}>
                  {d.href ? (
                    <a
                      href={d.href}
                      className="underline decoration-1 underline-offset-[3px] hover:opacity-60"
                      {...(/^https?:/.test(d.href) ? {target: '_blank', rel: 'noopener noreferrer'} : {})}
                    >
                      {d.text}
                    </a>
                  ) : (
                    d.text
                  )}
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <div className="flex flex-col gap-4 pb-8 sm:flex-row sm:items-end sm:justify-between">
          {statement ? <p className="max-w-[28rem] whitespace-pre-line">{statement}</p> : <span />}
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
