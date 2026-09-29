import {ThLargeIcon} from '@sanity/icons/ThLarge'
import {defineArrayMember, defineField, defineType} from 'sanity'

import {countImages, keepColumnsOnMobileField, sizeOptions} from './shared'

export const imageGrid2x2 = defineType({
  name: 'imageGrid2x2',
  title: 'Image grid (2×2)',
  type: 'object',
  icon: ThLargeIcon,
  fields: [
    defineField({
      name: 'images',
      type: 'array',
      of: [defineArrayMember({type: 'photo'})],
      options: {layout: 'grid'},
      validation: (rule) => rule.required().length(4).error('A 2×2 grid needs exactly four images'),
    }),
    defineField({
      name: 'crop',
      title: 'Crop to equal cells',
      type: 'string',
      description: 'Images keep their original ratio unless you choose a crop.',
      options: {
        list: [
          {title: 'No crop (original ratio)', value: 'none'},
          {title: 'Square', value: 'square'},
          {title: 'Portrait 4:5', value: 'portrait'},
          {title: 'Landscape 3:2', value: 'landscape'},
        ],
      },
      initialValue: 'none',
    }),
    defineField({
      name: 'gap',
      type: 'string',
      options: {list: sizeOptions, layout: 'radio', direction: 'horizontal'},
      initialValue: 'm',
    }),
    keepColumnsOnMobileField,
  ],
  preview: {
    select: {images: 'images', first: 'images.0', caption: 'images.0.caption'},
    prepare: ({images, first, caption}) => ({
      title: caption || 'Image grid',
      subtitle: `Grid 2×2 · ${countImages(...(images ?? []))}`,
      media: first,
    }),
  },
})
