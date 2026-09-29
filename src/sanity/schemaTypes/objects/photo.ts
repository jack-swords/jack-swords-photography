import {ImageIcon} from '@sanity/icons/Image'
import {defineField, defineType} from 'sanity'

/**
 * The one image type used everywhere on the site: hotspot/crop enabled,
 * required alt text, and an optional two-line caption.
 */
export const photo = defineType({
  name: 'photo',
  title: 'Photo',
  type: 'image',
  icon: ImageIcon,
  options: {
    hotspot: true,
    // Never extract GPS into asset metadata; lqip + palette drive the blur-up placeholders.
    metadata: ['lqip', 'palette', 'blurhash'],
  },
  fields: [
    defineField({
      name: 'alt',
      title: 'Alt text',
      type: 'string',
      description: 'Describe the image for people who cannot see it. Required.',
      validation: (rule) =>
        rule.custom((alt, context) => {
          const parent = context.parent as {asset?: unknown} | undefined
          if (parent?.asset && !alt?.trim()) return 'Alt text is required'
          return true
        }),
    }),
    defineField({
      name: 'caption',
      title: 'Caption',
      type: 'string',
      description: 'Line 1: subject or description.',
    }),
    defineField({
      name: 'captionSecondary',
      title: 'Caption (secondary)',
      type: 'string',
      description: 'Line 2, lighter type: publication, location, etc.',
    }),
  ],
  preview: {
    select: {title: 'caption', subtitle: 'alt', media: 'asset'},
    prepare: ({title, subtitle, media}) => ({title: title || subtitle || 'Photo', subtitle: title ? subtitle : undefined, media}),
  },
})
