import {defineQuery} from 'next-sanity'

export const settingsQuery = defineQuery(`*[_id == "siteSettings"][0]{
  title, description, nav, contactEmail, socialLinks, theme, indexPreviewMode,
  "ogImage": ogImage.asset->url
}`)

export const sitemapQuery = defineQuery(`{
  "projects": *[_type == "project" && defined(slug.current)]{"slug": slug.current, _updatedAt},
  "latest": *[_type in ["homepage", "about", "siteSettings", "project", "category"]] | order(_updatedAt desc)[0]._updatedAt
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
  "hero": {
    "mediaType": coalesce(hero.mediaType, "image"),
    "image": hero.image ${imageFields},
    "poster": hero.poster ${imageFields},
    "videoUrl": coalesce(hero.videoFile.asset->url, hero.videoUrl)
  },
  credits[]{_key, label, value},
  "categories": categories[]->{title, "slug": slug.current},
  blocks[]{
    _key,
    _type,
    _type == "imageSingle" => {width, align, "image": image ${imageFields}},
    _type == "imageFullBleed" => {fullHeight, "image": image ${imageFields}},
    _type == "imagePair" => {verticalAlign, gap, keepColumnsOnMobile, "left": left ${imageFields}, "right": right ${imageFields}},
    _type == "imageGrid2x2" => {crop, gap, keepColumnsOnMobile, "images": images[] ${imageFields}},
    _type == "imageRow" => {layout, width, gap, verticalAlign, mobile, "images": images[] ${imageFields}},
    _type == "imageOffset" => {leadSide, offset, keepColumnsOnMobile, "first": first ${imageFields}, "second": second ${imageFields}},
    _type == "textBlock" => {body},
    _type == "spacer" => {size}
  },
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
