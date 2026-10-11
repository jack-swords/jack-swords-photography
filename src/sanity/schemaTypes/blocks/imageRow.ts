import {InlineIcon} from '@sanity/icons/Inline'
import {defineArrayMember, defineField, defineType} from 'sanity'

import {RowPreview} from '../../components/RowPreview'
import {sizeOptions} from './shared'

export const ROW_SOFT_MAX = 4

/**
 * A row of any number of images, side by side. Stack rows to build any grid.
 */
export const imageRow = defineType({
  name: 'imageRow',
  title: 'Row',
  type: 'object',
  icon: InlineIcon,
  fields: [
    defineField({
      name: 'images',
      type: 'array',
      description: 'Images in this row, left to right. Drag to reorder; add as many as you like (4 or fewer reads best).',
      of: [defineArrayMember({type: 'photo'})],
      options: {layout: 'grid'},
      validation: (rule) => [
        rule.required().min(1).error('Add at least one image'),
        rule.max(ROW_SOFT_MAX).warning(`More than ${ROW_SOFT_MAX} images makes each one small on a laptop screen`),
      ],
    }),
    defineField({
      name: 'layout',
      type: 'string',
      description:
        'Equal height: images share one height and keep their proportions, so portrait and landscape sit together uncropped. Equal columns: same width each, heights vary.',
      options: {
        list: [
          {title: 'Equal height', value: 'height'},
          {title: 'Equal columns', value: 'columns'},
        ],
        layout: 'radio',
        direction: 'horizontal',
      },
      initialValue: 'height',
    }),
    defineField({
      name: 'width',
      title: 'Row width',
      type: 'string',
      options: {
        list: [
          {title: 'Medium', value: 'medium'},
          {title: 'Wide', value: 'wide'},
          {title: 'Full width', value: 'full'},
        ],
        layout: 'radio',
        direction: 'horizontal',
      },
      initialValue: 'wide',
    }),
    defineField({
      name: 'gap',
      type: 'string',
      options: {list: sizeOptions, layout: 'radio', direction: 'horizontal'},
      initialValue: 'm',
    }),
    defineField({
      name: 'verticalAlign',
      title: 'Vertical alignment',
      type: 'string',
      description: 'Only matters for equal columns, where heights differ.',
      options: {
        list: [
          {title: 'Top', value: 'top'},
          {title: 'Middle', value: 'center'},
          {title: 'Bottom', value: 'bottom'},
        ],
        layout: 'radio',
        direction: 'horizontal',
      },
      initialValue: 'top',
      hidden: ({parent}) => parent?.layout !== 'columns',
    }),
    defineField({
      name: 'mobile',
      title: 'On phones',
      type: 'string',
      options: {
        list: [
          {title: 'One per line', value: 'stack'},
          {title: 'Two per line', value: 'two'},
          {title: 'Keep the row', value: 'keep'},
        ],
        layout: 'radio',
        direction: 'horizontal',
      },
      initialValue: 'stack',
    }),
  ],
  components: {preview: RowPreview},
  preview: {
    select: {images: 'images', layout: 'layout', width: 'width'},
    prepare: ({images, layout = 'height', width = 'wide'}) => {
      const list = images ?? []
      const n = list.filter((i: {asset?: unknown}) => i?.asset).length
      return {
        title: `Row · ${n} image${n === 1 ? '' : 's'}`,
        subtitle: `${layout === 'columns' ? 'Equal columns' : 'Equal height'} · ${width}`,
        media: list[0],
        // Passed through to RowPreview for the thumbnail strip.
        images: list,
      }
    },
  },
})
