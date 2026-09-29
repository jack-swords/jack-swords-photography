import {orderRankField, orderRankOrdering} from '@sanity/orderable-document-list'
import {TagIcon} from '@sanity/icons/Tag'
import {defineField, defineType} from 'sanity'

export const category = defineType({
  name: 'category',
  title: 'Category',
  type: 'document',
  icon: TagIcon,
  orderings: [orderRankOrdering],
  fields: [
    defineField({name: 'title', type: 'string', validation: (rule) => rule.required()}),
    defineField({
      name: 'slug',
      type: 'slug',
      options: {source: 'title', maxLength: 64},
      validation: (rule) => rule.required(),
    }),
    orderRankField({type: 'category'}),
  ],
  preview: {select: {title: 'title', subtitle: 'slug.current'}},
})
