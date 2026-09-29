import {blockTypes} from './blocks'
import {about} from './documents/about'
import {category} from './documents/category'
import {homepage} from './documents/homepage'
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
