import {defineQuery} from 'next-sanity'

export const settingsQuery = defineQuery(`*[_id == "siteSettings"][0]{
  title, description, nav, contactEmail, socialLinks, theme, indexPreviewMode
}`)

/**
 * Number of images in a project, derived from its blocks (never typed in).
 * Kept as a fragment so the index, project page and numbered index agree.
 */
export const imageCountFragment = `
  count(blocks[_type in ["imageSingle", "imageFullBleed"]])
  + 2 * count(blocks[_type in ["imagePair", "imageOffset"]])
  + coalesce(math::sum(blocks[_type == "imageGrid2x2"]{"n": count(images)}.n), 0)
`

export const projectsIndexQuery = defineQuery(`*[_type == "project" && defined(slug.current)]
  | order(orderRank asc, date desc){
    _id,
    title,
    "slug": slug.current,
    date,
    "categories": categories[]->{title, "slug": slug.current},
    "imageCount": ${imageCountFragment}
  }`)
