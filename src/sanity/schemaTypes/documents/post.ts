import {ComposeIcon} from '@sanity/icons/Compose'
import {defineArrayMember, defineField, defineType} from 'sanity'

import {blockTypeNames} from '../blocks'

/** A journal entry: text and images, built from the same blocks as a project story. */
export const post = defineType({
  name: 'post',
  title: 'Journal entry',
  type: 'document',
  icon: ComposeIcon,
  groups: [
    {name: 'content', title: 'Content', default: true},
    {name: 'seo', title: 'SEO'},
  ],
  orderings: [{title: 'Date, newest first', name: 'dateDesc', by: [{field: 'date', direction: 'desc'}]}],
  fields: [
    defineField({name: 'title', type: 'string', group: 'content', validation: (rule) => rule.required()}),
    defineField({
      name: 'slug',
      type: 'slug',
      group: 'content',
      options: {source: 'title', maxLength: 96},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'date',
      type: 'date',
      group: 'content',
      initialValue: () => new Date().toISOString().slice(0, 10),
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'excerpt',
      type: 'text',
      rows: 3,
      group: 'content',
      description: 'A sentence or two: shown under the title, on the journal index and when shared.',
      validation: (rule) => rule.max(300),
    }),
    defineField({
      name: 'cover',
      title: 'Cover image',
      type: 'photo',
      group: 'content',
      description: 'Shown on the journal index and at the top of the entry.',
    }),
    defineField({
      name: 'coverLayout',
      title: 'Cover on the entry',
      type: 'string',
      group: 'content',
      options: {
        list: [
          {title: 'Wide', value: 'wide'},
          {title: 'Full width', value: 'full'},
          {title: 'Hidden (index only)', value: 'none'},
        ],
        layout: 'radio',
        direction: 'horizontal',
      },
      initialValue: 'wide',
    }),
    defineField({
      name: 'tags',
      type: 'array',
      group: 'content',
      of: [defineArrayMember({type: 'string'})],
      options: {layout: 'tags'},
    }),
    defineField({
      name: 'blocks',
      title: 'Entry',
      description: 'Text and images, in order. Drag to reorder.',
      type: 'array',
      group: 'content',
      of: blockTypeNames.map((type) => defineArrayMember({type})),
    }),
    defineField({name: 'relatedProject', title: 'Related project', type: 'reference', to: [{type: 'project'}], group: 'content'}),
    defineField({name: 'seo', title: 'SEO', type: 'seo', group: 'seo'}),
  ],
  preview: {
    select: {title: 'title', date: 'date', media: 'cover'},
    prepare: ({title, date, media}) => ({title, subtitle: date, media}),
  },
})
