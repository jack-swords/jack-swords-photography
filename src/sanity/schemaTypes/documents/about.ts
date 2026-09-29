import {UserIcon} from '@sanity/icons/User'
import {defineArrayMember, defineField, defineType} from 'sanity'

export const about = defineType({
  name: 'about',
  title: 'About',
  type: 'document',
  icon: UserIcon,
  fields: [
    defineField({name: 'portrait', type: 'photo'}),
    defineField({name: 'bio', type: 'richText'}),
    defineField({
      name: 'clients',
      type: 'array',
      of: [defineArrayMember({type: 'string'})],
      options: {layout: 'tags'},
    }),
    defineField({
      name: 'contact',
      type: 'object',
      fields: [
        defineField({name: 'email', type: 'string', validation: (rule) => rule.email()}),
        defineField({name: 'phone', type: 'string'}),
        defineField({name: 'links', type: 'array', of: [defineArrayMember({type: 'socialLink'})]}),
      ],
    }),
    defineField({
      name: 'representation',
      type: 'array',
      of: [
        defineArrayMember({
          name: 'agent',
          type: 'object',
          fields: [
            defineField({name: 'region', type: 'string', description: 'e.g. Worldwide, Europe'}),
            defineField({name: 'agency', type: 'string', validation: (rule) => rule.required()}),
            defineField({name: 'name', title: 'Agent name', type: 'string'}),
            defineField({name: 'email', type: 'string', validation: (rule) => rule.email()}),
            defineField({name: 'phone', type: 'string'}),
            defineField({name: 'url', title: 'Website', type: 'url'}),
          ],
          preview: {select: {title: 'agency', subtitle: 'region'}},
        }),
      ],
    }),
  ],
  preview: {prepare: () => ({title: 'About'})},
})
