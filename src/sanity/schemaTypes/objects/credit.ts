import {defineField, defineType} from 'sanity'

export const credit = defineType({
  name: 'credit',
  title: 'Credit',
  type: 'object',
  fields: [
    defineField({name: 'label', type: 'string', description: 'e.g. Client, Styling', validation: (rule) => rule.required()}),
    defineField({name: 'value', type: 'string', description: 'e.g. Vogue, Jane Doe', validation: (rule) => rule.required()}),
  ],
  preview: {
    select: {title: 'label', subtitle: 'value'},
  },
})
