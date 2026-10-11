import {blockTypes} from './blocks'
import {about} from './documents/about'
import {category} from './documents/category'
import {homepage} from './documents/homepage'
import {post} from './documents/post'
import {project} from './documents/project'
import {siteSettings} from './documents/siteSettings'
import {credit} from './objects/credit'
import {socialLink} from './objects/link'
import {photo} from './objects/photo'
import {richText} from './objects/richText'
import {seo} from './objects/seo'

export const schemaTypes = [
  // documents
  project,
  post,
  category,
  homepage,
  about,
  siteSettings,
  // objects
  photo,
  credit,
  socialLink,
  seo,
  richText,
  ...blockTypes,
]

/** Documents that exist exactly once, with a fixed _id equal to their type name. */
export const singletonTypes = new Set(['siteSettings', 'homepage', 'about'])
