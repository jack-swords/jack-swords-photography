import {SplitHorizontalIcon} from '@sanity/icons/SplitHorizontal'
import {defineField, defineType} from 'sanity'

import {countImages, keepColumnsOnMobileField, sizeOptions} from './shared'

export const imagePair = defineType({
  name: 'imagePair',
  title: 'Image pair',
  type: 'object',
  icon: SplitHorizontalIcon,
  fields: [
    defineField({name: 'left', type: 'photo', validation: (rule) => rule.required()}),
    defineField({name: 'right', type: 'photo', validation: (rule) => rule.required()}),
    defineField({
      name: 'verticalAlign',
      title: 'Vertical alignment',
      type: 'string',
      options: {
        list: [
          {title: 'Align tops', value: 'top'},
          {title: 'Align bottoms', value: 'bottom'},
        ],
        layout: 'radio',
        direction: 'horizontal',
      },
      initialValue: 'top',
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
    select: {left: 'left', right: 'right', caption: 'left.caption'},
    prepare: ({left, right, caption}) => ({
      title: caption || 'Image pair',
      subtitle: `Pair · ${countImages(left?.asset, right?.asset)}`,
      media: left,
    }),
  },
})
