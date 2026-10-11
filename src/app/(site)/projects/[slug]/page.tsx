import type {Metadata} from 'next'
import {draftMode} from 'next/headers'
import {notFound} from 'next/navigation'
import {stegaClean} from 'next-sanity'

import {JsonLd} from '@/components/JsonLd'
import type {ImageValue} from '@/components/SanityImage'
import {CloseButton} from '@/components/project/CloseButton'
import {ImageIndex} from '@/components/project/ImageIndex'
import {NextProjects} from '@/components/project/NextProjects'
import {countImages, ProjectBlocks} from '@/components/project/ProjectBlocks'
import {ProjectHero} from '@/components/project/ProjectHero'
import {personRef} from '@/lib/structuredData'
import {siteUrl} from '@/sanity/env'
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
  const heroStill = project.hero.mediaType === 'video' ? project.hero.poster : project.hero.image
  const images = ([heroStill, ...(project.blocks ?? []).flatMap((b): ImageValue[] => {
    if (b._type === 'imageSingle' || b._type === 'imageFullBleed') return [b.image]
    if (b._type === 'imagePair') return [b.left, b.right]
    if (b._type === 'imageOffset') return [b.first, b.second]
    if (b._type === 'imageGrid2x2' || b._type === 'imageRow') return b.images ?? []
    return []
  })] as ImageValue[]).filter((i): i is NonNullable<ImageValue> => Boolean(i?.asset))
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    '@id': `${siteUrl}/projects/${project.slug}#work`,
    name: project.title,
    url: `${siteUrl}/projects/${project.slug}`,
    ...(project.subtitle ? {description: project.subtitle} : {}),
    ...(project.date ? {dateCreated: project.date} : {}),
    ...(project.categories?.length ? {genre: project.categories.map((c) => c.title)} : {}),
    author: personRef,
    creator: personRef,
    image: images.slice(0, 30).map((image) => ({
      '@type': 'ImageObject',
      contentUrl: urlFor(image).width(1600).url(),
      ...(image.alt ? {description: image.alt} : {}),
      ...(image.caption ? {caption: [image.caption, image.captionSecondary].filter(Boolean).join(', ')} : {}),
      creator: personRef,
    })),
  }

  return (
    <>
      <JsonLd data={structuredData} />
      <CloseButton />
      <ProjectHero
        siteTitle={settings?.title ?? DEFAULT_SITE_TITLE}
        title={project.title ?? ''}
        subtitle={project.subtitle}
        heroText={project.heroText}
        tone={project.heroTextTone === 'dark' ? 'dark' : 'light'}
        hero={project.hero}
        credits={project.credits ?? []}
        edit={editAttr(edit, project.hero.mediaType === 'video' ? 'hero.poster' : 'hero.image')}
      />

      <main id="main">
        {/* The title and statement now live on the hero; the story starts here. */}
        <div className="pt-block-m" />

        <ProjectBlocks blocks={project.blocks} edit={edit} />
        <div className="h-block-l" />
        <NextProjects projects={project.nextProjects} />
      </main>

      <ImageIndex total={total} />
    </>
  )
}
