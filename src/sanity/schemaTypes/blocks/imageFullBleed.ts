import {ExpandIcon} from '@sanity/icons/Expand'
import {defineField, defineType} from 'sanity'

export const imageFullBleed = defineType({
  name: 'imageFullBleed',
  title: 'Full-bleed image',
  type: 'object',
  icon: ExpandIcon,
  fields: [
    defineField({name: 'image', type: 'photo', validation: (rule) => rule.required()}),
    defineField({
      name: 'fullHeight',
      title: 'Fill the screen height',
      type: 'boolean',
      description: 'Crops to 100% of the viewport height, centred on the hotspot.',
      initialValue: false,
    }),
  ],
  preview: {
    select: {media: 'image', caption: 'image.caption', alt: 'image.alt', fullHeight: 'fullHeight'},
    prepare: ({media, caption, alt, fullHeight}) => ({
      title: caption || alt || 'Full-bleed image',
      subtitle: `Full bleed${fullHeight ? ' · full height' : ''}`,
      media,
    }),
  },
})
