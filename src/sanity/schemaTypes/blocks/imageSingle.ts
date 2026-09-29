import {ImageIcon} from '@sanity/icons/Image'
import {defineField, defineType} from 'sanity'

export const imageSingle = defineType({
  name: 'imageSingle',
  title: 'Single image',
  type: 'object',
  icon: ImageIcon,
  fields: [
    defineField({name: 'image', type: 'photo', validation: (rule) => rule.required()}),
    defineField({
      name: 'width',
      type: 'string',
      options: {
        list: [
          {title: 'Narrow', value: 'narrow'},
          {title: 'Medium', value: 'medium'},
          {title: 'Wide', value: 'wide'},
        ],
        layout: 'radio',
        direction: 'horizontal',
      },
      initialValue: 'medium',
    }),
    defineField({
      name: 'align',
      title: 'Alignment',
      type: 'string',
      options: {
        list: [
          {title: 'Left', value: 'left'},
          {title: 'Centre', value: 'center'},
          {title: 'Right', value: 'right'},
        ],
        layout: 'radio',
        direction: 'horizontal',
      },
      initialValue: 'center',
    }),
  ],
  preview: {
    select: {media: 'image', caption: 'image.caption', alt: 'image.alt', width: 'width', align: 'align'},
    prepare: ({media, caption, alt, width = 'medium', align = 'center'}) => ({
      title: caption || alt || 'Single image',
      subtitle: `Single image · ${width} · ${align}`,
      media,
    }),
  },
})
