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
        defineField({name: 'journal', type: 'string', initialValue: 'Journal', description: 'Shown once at least one journal entry is published.'}),
        defineField({name: 'about', type: 'string', initialValue: 'About'}),
      ],
    }),
    defineField({name: 'contactEmail', type: 'string', validation: (rule) => rule.email()}),
    defineField({name: 'socialLinks', type: 'array', of: [defineArrayMember({type: 'socialLink'})]}),
    defineField({name: 'ogImage', title: 'Default social share image', type: 'image'}),
    defineField({
      name: 'footer',
      type: 'object',
      options: {collapsible: true, collapsed: false},
      fields: [
        defineField({
          name: 'statement',
          type: 'text',
          rows: 3,
          description: 'A line or two beside your name in the footer. Leave empty to use the site description.',
        }),
        defineField({
          name: 'copyright',
          title: 'Copyright line',
          type: 'string',
          description: 'Use {year} for the current year.',
          initialValue: '© {year} Jack Swords. All images © Jack Swords — please ask before using them.',
        }),
      ],
    }),
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
