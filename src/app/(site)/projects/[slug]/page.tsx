import type {Metadata} from 'next'
import {draftMode} from 'next/headers'
import {notFound} from 'next/navigation'
import {stegaClean} from 'next-sanity'

import {CloseButton} from '@/components/project/CloseButton'
import {ImageIndex} from '@/components/project/ImageIndex'
import {NextProjects} from '@/components/project/NextProjects'
import {countImages, ProjectBlocks} from '@/components/project/ProjectBlocks'
import {ProjectHero} from '@/components/project/ProjectHero'
import {client} from '@/sanity/lib/client'
import {sanityFetch} from '@/sanity/lib/live'
import {editAttr} from '@/sanity/lib/dataAttribute'
import {urlFor} from '@/sanity/lib/image'
import {projectQuery, projectSlugsQuery} from '@/sanity/lib/queries'
import {DEFAULT_SITE_TITLE, getSettings} from '@/sanity/lib/settings'
import type {ProjectQueryResult} from '@/sanity/types'

type Props = {params: Promise<{slug: string}>}

function getProject(slug: string) {
  return sanityFetch<ProjectQueryResult>({query: projectQuery, params: {slug}, tags: ['project', `project:${slug}`]})
}

export async function generateStaticParams() {
  const slugs = await client.fetch<string[]>(projectSlugsQuery)
  return slugs.map((slug) => ({slug}))
}

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {slug} = await params
  const project = await getProject(slug)
  if (!project) return {}

  const heroImage = project.hero.mediaType === 'video' ? project.hero.poster : project.hero.image
  const ogImage = project.seo?.ogImage
    ? `${project.seo.ogImage}?w=1200&h=630&fit=crop&auto=format`
    : heroImage?.asset
      ? urlFor(heroImage).width(1200).height(630).fit('crop').url()
      : undefined
  const description = stegaClean(project.seo?.description ?? project.subtitle) ?? undefined
  const title = stegaClean(project.seo?.title ?? project.title) ?? undefined

  return {
    title,
    description,
    alternates: {canonical: `/projects/${project.slug}`},
    openGraph: {type: 'article', title, description, images: ogImage ? [{url: ogImage, width: 1200, height: 630}] : undefined},
  }
}

export default async function ProjectPage({params}: Props) {
  const {slug} = await params
  const [project, settings, {isEnabled: isDraftMode}] = await Promise.all([getProject(slug), getSettings(), draftMode()])
  if (!project) notFound()
  const edit = isDraftMode ? {id: project._id, type: 'project'} : null

  const total = countImages(project.blocks)

  return (
    <>
      <CloseButton />
      <ProjectHero
        siteTitle={settings?.title ?? DEFAULT_SITE_TITLE}
        title={project.title ?? ''}
        tone={project.heroTextTone === 'dark' ? 'dark' : 'light'}
        hero={project.hero}
        credits={project.credits ?? []}
        edit={editAttr(edit, project.hero.mediaType === 'video' ? 'hero.poster' : 'hero.image')}
      />

      <main id="story" className="scroll-mt-0">
        <header className="px-gutter pt-block-s pb-block-m">
          <div className="mx-auto max-w-medium">
            <h2 className="text-display">{project.title}</h2>
            {project.subtitle ? <p className="mt-6 max-w-prose font-serif text-lead">{project.subtitle}</p> : null}
          </div>
        </header>

        <ProjectBlocks blocks={project.blocks} edit={edit} />
        <div className="h-block-l" />
        <NextProjects projects={project.nextProjects} />
      </main>

      <ImageIndex total={total} />
    </>
  )
}
