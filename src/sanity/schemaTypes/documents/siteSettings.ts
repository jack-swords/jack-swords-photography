import {CogIcon} from '@sanity/icons/Cog'
import {defineArrayMember, defineField, defineType} from 'sanity'

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Site settings',
  type: 'document',
  icon: CogIcon,
  fields: [
    defineField({name: 'title', title: 'Site title', type: 'string', validation: (rule) => rule.required()}),
    defineField({name: 'description', type: 'text', rows: 2, description: 'Default meta description.'}),
    defineField({
      name: 'nav',
      title: 'Navigation labels',
      type: 'object',
      fields: [
        defineField({name: 'home', type: 'string', initialValue: 'Selected'}),
        defineField({name: 'projects', type: 'string', initialValue: 'Works'}),
        defineField({name: 'about', type: 'string', initialValue: 'About'}),
      ],
    }),
    defineField({name: 'contactEmail', type: 'string', validation: (rule) => rule.email()}),
    defineField({name: 'socialLinks', type: 'array', of: [defineArrayMember({type: 'socialLink'})]}),
    defineField({name: 'ogImage', title: 'Default social share image', type: 'image'}),
    defineField({
      name: 'theme',
      type: 'string',
      options: {
        list: [
          {title: 'Light', value: 'light'},
          {title: 'Dark', value: 'dark'},
        ],
        layout: 'radio',
        direction: 'horizontal',
      },
      initialValue: 'light',
    }),
    defineField({
      name: 'indexPreviewMode',
      title: 'Projects index hover preview',
      type: 'string',
      options: {
        list: [
          {title: 'Follow the cursor', value: 'cursor'},
          {title: 'Fixed position', value: 'fixed'},
        ],
        layout: 'radio',
        direction: 'horizontal',
      },
      initialValue: 'cursor',
    }),
  ],
  preview: {prepare: () => ({title: 'Site settings'})},
})
