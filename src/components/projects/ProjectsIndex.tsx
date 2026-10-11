'use client'

import Link from 'next/link'
import {useSearchParams} from 'next/navigation'
import {useEffect, useMemo, useState} from 'react'

import {PROJECTS_RETURN_KEY} from '@/components/project/CloseButton'
import {SanityImage} from '@/components/SanityImage'
import type {CategoriesQueryResult, ProjectsIndexQueryResult} from '@/sanity/types'

import {PreviewLayer} from './PreviewLayer'

type Props = {
  projects: ProjectsIndexQueryResult
  categories: CategoriesQueryResult
  previewMode: 'cursor' | 'fixed'
}

/** Reads the filter from ?category=… (client only: the page itself is static). */
export function ProjectsIndexFromUrl(props: Props) {
  const searchParams = useSearchParams()
  const requested = searchParams.get('category')
  const category = props.categories.some((c) => c.slug === requested) ? requested : null

  // Remember where we are, so a project's [ close ] comes back to this filter.
  useEffect(() => {
    try {
      window.sessionStorage.setItem(PROJECTS_RETURN_KEY, category ? `/projects?category=${category}` : '/projects')
    } catch {
      // Storage unavailable (private mode etc.): close falls back to /projects.
    }
  }, [category])

  const select = (slug: string | null) => {
    // Integrates with the Next.js router: useSearchParams updates, no reload or refetch.
    window.history.replaceState(null, '', slug ? `/projects?category=${slug}` : '/projects')
  }

  return <ProjectsIndex {...props} category={category} onSelect={select} />
}

/** The list itself. Also rendered on the server, unfiltered, as the static fallback. */
export function ProjectsIndex({
  projects,
  categories,
  previewMode,
  category,
  onSelect,
}: Props & {category: string | null; onSelect?: (slug: string | null) => void}) {
  const [hovered, setHovered] = useState<string | null>(null)

  const counts = useMemo(() => {
    const map = new Map<string, number>()
    for (const project of projects) {
      for (const c of project.categories ?? []) if (c.slug) map.set(c.slug, (map.get(c.slug) ?? 0) + 1)
    }
    return map
  }, [projects])

  const filters = categories.filter((c) => c.slug && counts.get(c.slug))
  const activeTitle = categories.find((c) => c.slug === category)?.title
  const visible = category ? projects.filter((p) => p.categories?.some((c) => c.slug === category)) : projects

  const filterLink = (slug: string | null, label: string, count: number) => {
    const active = category === slug
    return (
      <li key={slug ?? 'all'}>
        <a
          href={slug ? `/projects?category=${slug}` : '/projects'}
          aria-current={active ? 'true' : undefined}
          onClick={(event) => {
            if (!onSelect || event.metaKey || event.ctrlKey || event.shiftKey) return
            event.preventDefault()
            onSelect(slug)
          }}
          className={active ? 'text-ink' : 'text-ink-muted hover:text-ink'}
        >
          {label} <span className="tabular-nums">({count})</span>
        </a>
      </li>
    )
  }

  return (
    <>
      <nav aria-label="Filter by category" className="px-gutter pt-block-s pb-6">
        <ul className="flex flex-wrap gap-x-6 gap-y-1">
          {filterLink(null, 'All projects', projects.length)}
          {filters.map((c) => filterLink(c.slug, c.title ?? c.slug ?? '', counts.get(c.slug ?? '') ?? 0))}
        </ul>
      </nav>

      <div className="px-gutter pb-block-m">
        <div
          aria-hidden="true"
          className="hidden grid-cols-[minmax(0,2fr)_minmax(0,1fr)_5rem] gap-6 border-b border-rule pb-2 text-ink-muted md:grid"
        >
          <span>Project</span>
          <span>Category</span>
          <span className="text-right">Images</span>
        </div>

        <p role="status" className="sr-only">
          {`Showing ${visible.length} ${visible.length === 1 ? 'project' : 'projects'}${activeTitle ? ` in ${activeTitle}` : ''}`}
        </p>
        <ul onMouseLeave={() => setHovered(null)}>
          {visible.map((project) => {
            const categoryNames = project.categories?.map((c) => c.title).filter(Boolean).join(', ')
            return (
              <li key={project._id} className="border-b border-rule">
                <Link
                  href={`/projects/${project.slug}`}
                  onMouseEnter={() => setHovered(project._id)}
                  onFocus={() => setHovered(project._id)}
                  onBlur={() => setHovered(null)}
                  className="flex items-center gap-4 py-2.5 hover:text-ink-muted md:grid md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_5rem] md:gap-6 md:py-2"
                >
                  <span className="flex min-w-0 flex-1 items-center gap-3">
                    {/* Touch devices get a small inline thumbnail instead of the hover preview. */}
                    <span className="relative hidden aspect-[4/5] w-10 shrink-0 overflow-hidden bg-rule pointer-coarse:block">
                      <SanityImage image={project.image} sizes="80px" cover />
                    </span>
                    <span className="min-w-0">
                      <span className="block">{project.title}</span>
                      <span className="block text-ink-muted md:hidden">{categoryNames}</span>
                    </span>
                  </span>
                  <span className="hidden text-ink-muted md:block">{categoryNames}</span>
                  <span className="text-right tabular-nums">{project.imageCount ?? 0}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </div>

      <PreviewLayer items={visible} activeId={hovered} mode={previewMode} />
    </>
  )
}
