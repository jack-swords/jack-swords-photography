import {HomeIcon} from '@sanity/icons/Home'
import {defineArrayMember, defineField, defineType} from 'sanity'

/**
 * Minimal until the homepage layout is confirmed (milestone 4):
 * an ordered list of featured projects, each optionally with a specific image.
 */
export const homepage = defineType({
  name: 'homepage',
  title: 'Homepage',
  type: 'document',
  icon: HomeIcon,
  fields: [
    defineField({
      name: 'featured',
      title: 'Featured',
      description: 'What appears on the homepage, in this order.',
      type: 'array',
      of: [
        defineArrayMember({
          name: 'featuredItem',
          type: 'object',
          fields: [
            defineField({
              name: 'project',
              type: 'reference',
              to: [{type: 'project'}],
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'image',
              type: 'photo',
              description: "Optional. Defaults to the project's hero image.",
            }),
          ],
          preview: {
            select: {title: 'project.title', image: 'image', hero: 'project.hero.image', poster: 'project.hero.poster'},
            prepare: ({title, image, hero, poster}) => ({
              title: title || 'Featured item',
              media: image?.asset ? image : hero?.asset ? hero : poster,
            }),
          },
        }),
      ],
    }),
  ],
  preview: {prepare: () => ({title: 'Homepage'})},
})
