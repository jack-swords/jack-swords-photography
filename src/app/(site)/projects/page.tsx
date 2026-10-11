import type {Metadata} from 'next'
import {Suspense} from 'react'

import {ProjectsIndex, ProjectsIndexFromUrl} from '@/components/projects/ProjectsIndex'
import {SiteHeader} from '@/components/SiteHeader'
import {sanityFetch} from '@/sanity/lib/live'
import {categoriesQuery, projectsIndexQuery} from '@/sanity/lib/queries'
import {getSettings} from '@/sanity/lib/settings'
import type {CategoriesQueryResult, ProjectsIndexQueryResult} from '@/sanity/types'

export const metadata: Metadata = {
  title: 'Projects',
  alternates: {canonical: '/projects'},
}

export default async function ProjectsPage() {
  const [projects, categories, settings] = await Promise.all([
    sanityFetch<ProjectsIndexQueryResult>({query: projectsIndexQuery, tags: ['project', 'category']}),
    sanityFetch<CategoriesQueryResult>({query: categoriesQuery, tags: ['category']}),
    getSettings(),
  ])
  const props = {
    projects: projects ?? [],
    categories: categories ?? [],
    previewMode: settings?.indexPreviewMode === 'fixed' ? ('fixed' as const) : ('cursor' as const),
  }

  return (
    <>
      <SiteHeader current="projects" />
      <main>
        <h1 className="sr-only">Projects</h1>
        {/* The static HTML is the full, unfiltered list; ?category= is applied in the browser. */}
        <Suspense fallback={<ProjectsIndex {...props} category={null} />}>
          <ProjectsIndexFromUrl {...props} />
        </Suspense>
      </main>
    </>
  )
}
