import Link from 'next/link'

import {sanityFetch} from '@/sanity/lib/client'
import {projectsIndexQuery} from '@/sanity/lib/queries'
import type {ProjectsIndexQueryResult} from '@/sanity/types'

// Placeholder until milestone 4 (homepage layout is pending the reference review).
export default async function HomePage() {
  const projects = (await sanityFetch<ProjectsIndexQueryResult>({query: projectsIndexQuery, tags: ['project', 'category']})) ?? []

  return (
    <main className="px-gutter py-block-s">
      <ul className="divide-y divide-rule border-y border-rule">
        {projects.map((project) => (
          <li key={project._id}>
            <Link href={`/projects/${project.slug}`} className="grid grid-cols-[1fr_auto_auto] gap-6 py-2 hover:text-ink-muted">
              <span>{project.title}</span>
              <span className="text-ink-muted">{project.categories?.map((c) => c.title).join(', ')}</span>
              <span className="tabular-nums">{project.imageCount}</span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  )
}
