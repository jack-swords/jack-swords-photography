import {ExpandIcon} from '@sanity/icons/Expand'
import {defineField, defineType} from 'sanity'

export const imageFullBleed = defineType({
  name: 'imageFullBleed',
  title: 'Full-width image',
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
    defineField({
      name: 'edgeToEdge',
      title: 'Edge to edge',
      type: 'boolean',
      description: 'Off: the image keeps the page margin either side. On: it runs to the edges of the screen.',
      initialValue: false,
    }),
  ],
  preview: {
    select: {media: 'image', caption: 'image.caption', alt: 'image.alt', fullHeight: 'fullHeight', edgeToEdge: 'edgeToEdge'},
    prepare: ({media, caption, alt, fullHeight, edgeToEdge}) => ({
      title: caption || alt || 'Full-width image',
      subtitle: `Full width${edgeToEdge ? ' · edge to edge' : ''}${fullHeight ? ' · full height' : ''}`,
      media,
    }),
  },
})
