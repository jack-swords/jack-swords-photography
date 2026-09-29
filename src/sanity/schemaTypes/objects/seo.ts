import {defineField, defineType} from 'sanity'

export const seo = defineType({
  name: 'seo',
  title: 'SEO',
  type: 'object',
  options: {collapsible: true, collapsed: true},
  fields: [
    defineField({name: 'title', type: 'string', description: 'Overrides the page title in search results.'}),
    defineField({name: 'description', type: 'text', rows: 3, validation: (rule) => rule.max(200)}),
    defineField({name: 'ogImage', title: 'Social share image', type: 'image', description: 'Defaults to the project hero.'}),
  ],
})
