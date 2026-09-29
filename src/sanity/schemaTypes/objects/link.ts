import {defineField, defineType} from 'sanity'

export const socialLink = defineType({
  name: 'socialLink',
  title: 'Link',
  type: 'object',
  fields: [
    defineField({name: 'label', type: 'string', description: 'e.g. Instagram', validation: (rule) => rule.required()}),
    defineField({
      name: 'url',
      type: 'url',
      validation: (rule) => rule.required().uri({scheme: ['http', 'https', 'mailto', 'tel']}),
    }),
  ],
  preview: {select: {title: 'label', subtitle: 'url'}},
})
