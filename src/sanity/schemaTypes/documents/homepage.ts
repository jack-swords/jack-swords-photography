import {HomeIcon} from '@sanity/icons/Home'
import {defineArrayMember, defineField, defineType} from 'sanity'

/**
 * "Selected works": an ordered list of featured projects, each shown as a
 * near-full-width image row that links to the project.
 */
export const homepage = defineType({
  name: 'homepage',
  title: 'Homepage',
  type: 'document',
  icon: HomeIcon,
  fields: [
    defineField({
      name: 'featured',
      title: 'Selected works',
      description: 'Projects shown on the homepage, in this order. Drag to reorder.',
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
            defineField({
              name: 'format',
              type: 'string',
              description: 'How the image is cropped in its row. Wide and panorama crop around the hotspot.',
              options: {
                list: [
                  {title: 'Wide (16:9)', value: 'wide'},
                  {title: 'Panorama (2:1)', value: 'panorama'},
                  {title: 'Original ratio (no crop)', value: 'original'},
                ],
                layout: 'radio',
                direction: 'horizontal',
              },
              initialValue: 'wide',
            }),
          ],
          preview: {
            select: {title: 'project.title', image: 'image', hero: 'project.hero.image', poster: 'project.hero.poster', format: 'format'},
            prepare: ({title, image, hero, poster, format = 'wide'}) => ({
              title: title || 'Featured item',
              subtitle: {wide: 'Wide 16:9', panorama: 'Panorama 2:1', original: 'Original ratio'}[format as string],
              media: image?.asset ? image : hero?.asset ? hero : poster,
            }),
          },
        }),
      ],
    }),
  ],
  preview: {prepare: () => ({title: 'Homepage'})},
})
