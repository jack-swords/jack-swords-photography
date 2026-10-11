import type {Metadata} from 'next'
import {Suspense} from 'react'

import {ProjectsIndex, ProjectsIndexFromUrl} from '@/components/projects/ProjectsIndex'
import {JsonLd} from '@/components/JsonLd'
import {SiteHeader} from '@/components/SiteHeader'
import {ogImages} from '@/lib/ogImage'
import {personRef} from '@/lib/structuredData'
import {siteUrl} from '@/sanity/env'
import {sanityFetch} from '@/sanity/lib/live'
import {categoriesQuery, projectsIndexQuery} from '@/sanity/lib/queries'
import {getSettings} from '@/sanity/lib/settings'
import type {CategoriesQueryResult, ProjectsIndexQueryResult} from '@/sanity/types'

function getProjects() {
  return sanityFetch<ProjectsIndexQueryResult>({query: projectsIndexQuery, tags: ['project', 'category']})
}

export async function generateMetadata(): Promise<Metadata> {
  const [projects, settings] = await Promise.all([getProjects(), getSettings()])
  return {
    title: 'Projects',
    alternates: {canonical: '/projects'},
    ...(settings?.ogImage ? {} : {openGraph: {images: ogImages(projects?.[0]?.image)}}),
  }
}

export default async function ProjectsPage() {
  const [projects, categories, settings] = await Promise.all([
    getProjects(),
    sanityFetch<CategoriesQueryResult>({query: categoriesQuery, tags: ['category']}),
    getSettings(),
  ])
  const props = {
    projects: projects ?? [],
    categories: categories ?? [],
    previewMode: settings?.indexPreviewMode === 'fixed' ? ('fixed' as const) : ('cursor' as const),
  }

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Projects',
    url: `${siteUrl}/projects`,
    author: personRef,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: props.projects.map((p, i) => ({'@type': 'ListItem', position: i + 1, url: `${siteUrl}/projects/${p.slug}`, name: p.title})),
    },
  }

  return (
    <>
      <JsonLd data={structuredData} />
      <SiteHeader current="projects" />
      <main id="main">
        <h1 className="sr-only">Projects</h1>
        {/* The static HTML is the full, unfiltered list; ?category= is applied in the browser. */}
        <Suspense fallback={<ProjectsIndex {...props} category={null} />}>
          <ProjectsIndexFromUrl {...props} />
        </Suspense>
      </main>
    </>
  )
}
