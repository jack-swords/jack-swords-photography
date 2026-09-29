import {ArrowDownIcon} from '@sanity/icons/ArrowDown'
import {defineField, defineType} from 'sanity'

import {sizeOptions} from './shared'

export const spacer = defineType({
  name: 'spacer',
  title: 'Spacer',
  type: 'object',
  icon: ArrowDownIcon,
  fields: [
    defineField({
      name: 'size',
      type: 'string',
      options: {list: sizeOptions, layout: 'radio', direction: 'horizontal'},
      initialValue: 'm',
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: {size: 'size'},
    prepare: ({size = 'm'}) => ({title: `Spacer · ${size.toUpperCase()}`, media: ArrowDownIcon}),
  },
})
