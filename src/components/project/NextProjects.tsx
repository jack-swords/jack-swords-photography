import Link from 'next/link'

import {SanityImage} from '@/components/SanityImage'
import type {ProjectQueryResult} from '@/sanity/types'

type Teaser = NonNullable<NonNullable<ProjectQueryResult>['nextProjects']>[number]

export function NextProjects({projects}: {projects: Teaser[] | null | undefined}) {
  const items = (projects ?? []).filter((p): p is NonNullable<Teaser> => Boolean(p?.slug))
  if (!items.length) return null

  return (
    <section aria-labelledby="next-heading" className="border-t border-rule px-gutter pt-6 pb-block-s">
      <h2 id="next-heading" className="mb-6 text-ink-muted">
        Next
      </h2>
      <ul className="grid gap-x-6 gap-y-10 md:grid-cols-2">
        {items.map((project) => (
          <li key={project._id}>
            <Link href={`/projects/${project.slug}`} className="group grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] items-start gap-4">
              <div className="relative aspect-[4/3] overflow-hidden bg-rule">
                <SanityImage
                  image={project.image}
                  sizes="(min-width: 768px) 20vw, 40vw"
                  cover
                  className="transition-opacity duration-300 group-hover:opacity-80"
                />
              </div>
              <div>
                <p className="group-hover:text-ink-muted">{project.title}</p>
                {project.subtitle ? <p className="mt-1 line-clamp-3 text-ink-muted">{project.subtitle}</p> : null}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
