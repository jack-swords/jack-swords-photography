import {defineQuery} from 'next-sanity'

export const settingsQuery = defineQuery(`*[_id == "siteSettings"][0]{
  title, description, nav, contactEmail, socialLinks, theme, indexPreviewMode, footer,
  "ogImage": ogImage.asset->url,
  "hasJournal": count(*[_type == "post" && defined(slug.current)]) > 0,
  "representation": *[_id == "about"][0].representation[]{_key, region, agency, url}
}`)

export const sitemapQuery = defineQuery(`{
  "projects": *[_type == "project" && defined(slug.current)]{"slug": slug.current, _updatedAt},
  "posts": *[_type == "post" && defined(slug.current)]{"slug": slug.current, _updatedAt},
  "latest": *[_type in ["homepage", "about", "siteSettings", "project", "category", "post"]] | order(_updatedAt desc)[0]._updatedAt
}`)

/**
 * Number of images in a project, derived from its blocks (never typed in).
 * Kept as a fragment so the index, project page and numbered index agree.
 */
export const imageCountFragment = `
  count(blocks[_type in ["imageSingle", "imageFullBleed"]])
  + 2 * count(blocks[_type in ["imagePair", "imageOffset"]])
  + coalesce(math::sum(blocks[_type in ["imageGrid2x2", "imageRow"]]{"n": count(images)}.n), 0)
`

/** Everything an image needs to render without layout shift: dimensions, LQIP, crop and hotspot. */
const imageFields = `{
  _key, alt, caption, captionSecondary, crop, hotspot,
  "asset": asset->{_id, url, "lqip": metadata.lqip, "width": metadata.dimensions.width, "height": metadata.dimensions.height}
}`

export const projectsIndexQuery = defineQuery(`*[_type == "project" && defined(slug.current)]
  | order(orderRank asc, date desc){
    _id,
    title,
    "slug": slug.current,
    date,
    "categories": categories[]->{title, "slug": slug.current},
    "imageCount": ${imageCountFragment},
    "image": coalesce(hero.image, hero.poster) ${imageFields}
  }`)

export const categoriesQuery = defineQuery(`*[_type == "category" && defined(slug.current)]
  | order(orderRank asc, title asc){_id, title, "slug": slug.current}`)

/** Story blocks, shared by projects and journal entries so both render with the same components. */
const blocksProjection = `{
    _key,
    _type,
    _type == "imageSingle" => {width, align, "image": image ${imageFields}},
    _type == "imageFullBleed" => {fullHeight, edgeToEdge, "image": image ${imageFields}},
    _type == "imagePair" => {verticalAlign, gap, keepColumnsOnMobile, "left": left ${imageFields}, "right": right ${imageFields}},
    _type == "imageGrid2x2" => {crop, gap, keepColumnsOnMobile, "images": images[] ${imageFields}},
    _type == "imageRow" => {layout, width, gap, verticalAlign, mobile, "images": images[] ${imageFields}},
    _type == "imageOffset" => {leadSide, offset, keepColumnsOnMobile, "first": first ${imageFields}, "second": second ${imageFields}},
    _type == "textBlock" => {body},
    _type == "spacer" => {size}
  }`

const projectTeaserFields = `_id, title, "slug": slug.current, subtitle,
  "image": coalesce(hero.image, hero.poster) ${imageFields}`

export const projectSlugsQuery = defineQuery(`*[_type == "project" && defined(slug.current)].slug.current`)

export const projectQuery = defineQuery(`*[_type == "project" && slug.current == $slug][0]{
  _id,
  title,
  "slug": slug.current,
  subtitle,
  date,
  heroTextTone,
  heroText{showTitle, title, titleSize, titlePosition, titleFont, details[]{_key, text, href}, statement, showStatement},
  "hero": {
    "mediaType": coalesce(hero.mediaType, "image"),
    "image": hero.image ${imageFields},
    "poster": hero.poster ${imageFields},
    "videoUrl": coalesce(hero.videoFile.asset->url, hero.videoUrl)
  },
  credits[]{_key, label, value},
  "categories": categories[]->{title, "slug": slug.current},
  "blocks": blocks[]${blocksProjection},
  "nextProjects": select(
    count(nextProjects) > 0 => nextProjects[]->{${projectTeaserFields}},
    // Fallback: the next project in the manual order, wrapping round to the first.
    [coalesce(
      *[_type == "project" && defined(slug.current) && orderRank > ^.orderRank] | order(orderRank asc)[0],
      *[_type == "project" && defined(slug.current) && _id != ^._id] | order(orderRank asc)[0]
    )]{${projectTeaserFields}}
  ),
  seo{title, description, "ogImage": ogImage.asset->url}
}`)

export const homepageQuery = defineQuery(`{
  "featured": *[_id == "homepage"][0].featured[defined(project->slug.current)]{
    _key,
    format,
    "image": select(
      defined(image.asset) => image,
      defined(project->hero.image.asset) => project->hero.image,
      project->hero.poster
    ) ${imageFields},
    "project": project->{_id, title, "slug": slug.current, date, "categories": categories[]->title}
  },
  // Used only while nothing is featured yet: the first few projects in the manual order.
  "fallback": *[_type == "project" && defined(slug.current)] | order(orderRank asc, date desc)[0...4]{
    "_key": _id,
    "format": "wide",
    "image": coalesce(hero.image, hero.poster) ${imageFields},
    "project": {_id, title, "slug": slug.current, date, "categories": categories[]->title}
  }
}`)

export const aboutQuery = defineQuery(`*[_id == "about"][0]{
  _id,
  _type,
  "portrait": portrait ${imageFields},
  bio,
  clients,
  contact{email, phone, links[]{_key, label, url}},
  representation[]{_key, region, agency, name, email, phone, url}
}`)

/** Images already used in projects, for the /preview layout showcase. */
export const previewImagesQuery = defineQuery(`*[_type == "sanity.imageAsset" && count(*[_type == "project" && references(^._id)]) > 0]
  | order(_createdAt asc)[0...60]{
    _id, url, "lqip": metadata.lqip, "width": metadata.dimensions.width, "height": metadata.dimensions.height
  }`)

const postTeaserFields = `_id, title, "slug": slug.current, date, excerpt, tags, "cover": cover ${imageFields}`

export const postsIndexQuery = defineQuery(`*[_type == "post" && defined(slug.current)] | order(date desc, _createdAt desc){${postTeaserFields}}`)

export const postSlugsQuery = defineQuery(`*[_type == "post" && defined(slug.current)].slug.current`)

export const postQuery = defineQuery(`*[_type == "post" && slug.current == $slug][0]{
  _id,
  _type,
  title,
  "slug": slug.current,
  date,
  excerpt,
  tags,
  coverLayout,
  "cover": cover ${imageFields},
  "blocks": blocks[]${blocksProjection},
  "relatedProject": relatedProject->{title, "slug": slug.current},
  "more": *[_type == "post" && defined(slug.current) && slug.current != $slug] | order(date desc)[0...2]{${postTeaserFields}},
  seo{title, description, "ogImage": ogImage.asset->url}
}`)
