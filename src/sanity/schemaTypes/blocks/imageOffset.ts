import {StackCompactIcon} from '@sanity/icons/StackCompact'
import {defineField, defineType} from 'sanity'

import {countImages, keepColumnsOnMobileField, sizeOptions} from './shared'

export const imageOffset = defineType({
  name: 'imageOffset',
  title: 'Offset pair',
  type: 'object',
  icon: StackCompactIcon,
  description: 'Two images staggered: one higher on one side, one lower on the other.',
  fields: [
    defineField({name: 'first', title: 'Leading image (higher)', type: 'photo', validation: (rule) => rule.required()}),
    defineField({name: 'second', title: 'Trailing image (lower)', type: 'photo', validation: (rule) => rule.required()}),
    defineField({
      name: 'leadSide',
      title: 'Leading side',
      type: 'string',
      options: {
        list: [
          {title: 'Left leads', value: 'left'},
          {title: 'Right leads', value: 'right'},
        ],
        layout: 'radio',
        direction: 'horizontal',
      },
      initialValue: 'left',
    }),
    defineField({
      name: 'offset',
      title: 'Offset amount',
      type: 'string',
      options: {list: sizeOptions, layout: 'radio', direction: 'horizontal'},
      initialValue: 'm',
    }),
    keepColumnsOnMobileField,
  ],
  preview: {
    select: {first: 'first', second: 'second', caption: 'first.caption', leadSide: 'leadSide'},
    prepare: ({first, second, caption, leadSide = 'left'}) => ({
      title: caption || 'Offset pair',
      subtitle: `Offset · ${leadSide} leads · ${countImages(first?.asset, second?.asset)}`,
      media: first,
    }),
  },
})
