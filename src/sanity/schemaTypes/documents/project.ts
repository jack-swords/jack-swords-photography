import {orderRankField, orderRankOrdering} from '@sanity/orderable-document-list'
import {DocumentsIcon} from '@sanity/icons/Documents'
import {defineArrayMember, defineField, defineType} from 'sanity'

import {blockTypeNames} from '../blocks'

export const project = defineType({
  name: 'project',
  title: 'Project',
  type: 'document',
  icon: DocumentsIcon,
  groups: [
    {name: 'content', title: 'Content', default: true},
    {name: 'hero', title: 'Hero'},
    {name: 'meta', title: 'Details'},
    {name: 'seo', title: 'SEO'},
  ],
  orderings: [
    orderRankOrdering,
    {title: 'Date, newest first', name: 'dateDesc', by: [{field: 'date', direction: 'desc'}]},
  ],
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
      name: 'subtitle',
      title: 'Subtitle / standfirst',
      type: 'text',
      rows: 3,
      group: 'content',
    }),
    defineField({
      name: 'blocks',
      title: 'Story',
      description: 'The body of the project. Drag to reorder.',
      type: 'array',
      group: 'content',
      of: blockTypeNames.map((type) => defineArrayMember({type})),
    }),

    // Hero
    defineField({
      name: 'hero',
      type: 'object',
      group: 'hero',
      options: {collapsible: false},
      fields: [
        defineField({
          name: 'mediaType',
          title: 'Media',
          type: 'string',
          options: {
            list: [
              {title: 'Image', value: 'image'},
              {title: 'Video', value: 'video'},
            ],
            layout: 'radio',
            direction: 'horizontal',
          },
          initialValue: 'image',
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: 'image',
          type: 'photo',
          description: 'Set the hotspot: it becomes the focal point when the hero is cropped to the screen.',
          hidden: ({parent}) => parent?.mediaType === 'video',
          validation: (rule) =>
            rule.custom((value: {asset?: unknown} | undefined, context) => {
              const parent = context.parent as {mediaType?: string} | undefined
              return parent?.mediaType !== 'video' && !value?.asset ? 'Add a hero image' : true
            }),
        }),
        defineField({
          name: 'videoFile',
          title: 'Video file',
          type: 'file',
          options: {accept: 'video/mp4,video/webm'},
          description: 'Muted, looping, autoplaying. Keep it short and compressed (under ~10 MB).',
          hidden: ({parent}) => parent?.mediaType !== 'video',
        }),
        defineField({
          name: 'videoUrl',
          title: 'Video URL',
          type: 'url',
          description: 'Alternative to uploading: a direct link to an .mp4/.webm file (e.g. from Mux or a CDN).',
          hidden: ({parent}) => parent?.mediaType !== 'video',
        }),
        defineField({
          name: 'poster',
          title: 'Poster image',
          type: 'photo',
          description: 'Shown before the video loads, and instead of it when reduced motion is preferred.',
          hidden: ({parent}) => parent?.mediaType !== 'video',
          validation: (rule) =>
            rule.custom((value: {asset?: unknown} | undefined, context) => {
              const parent = context.parent as {mediaType?: string} | undefined
              return parent?.mediaType === 'video' && !value?.asset ? 'A video hero needs a poster image' : true
            }),
        }),
      ],
      validation: (rule) =>
        rule.custom((hero: {mediaType?: string; videoFile?: {asset?: unknown}; videoUrl?: string} | undefined) => {
          if (hero?.mediaType === 'video' && !hero.videoFile?.asset && !hero.videoUrl) {
            return 'Upload a video file or add a video URL'
          }
          return true
        }),
    }),
    defineField({
      name: 'heroTextTone',
      title: 'Overlay text colour',
      type: 'string',
      group: 'hero',
      description: 'Pick whichever stays readable over the hero.',
      options: {
        list: [
          {title: 'Light text', value: 'light'},
          {title: 'Dark text', value: 'dark'},
        ],
        layout: 'radio',
        direction: 'horizontal',
      },
      initialValue: 'light',
    }),
    defineField({
      name: 'credits',
      type: 'array',
      group: 'hero',
      of: [defineArrayMember({type: 'credit'})],
    }),

    // Details
    defineField({
      name: 'categories',
      type: 'array',
      group: 'meta',
      of: [defineArrayMember({type: 'reference', to: [{type: 'category'}]})],
      validation: (rule) => rule.unique(),
    }),
    defineField({
      name: 'date',
      type: 'date',
      group: 'meta',
      description: 'Used as the fallback sort order.',
    }),
    defineField({
      name: 'nextProjects',
      title: 'Next projects',
      type: 'array',
      group: 'meta',
      description: 'Up to two teasers at the end of the page. Leave empty to show the next project in order.',
      of: [defineArrayMember({type: 'reference', to: [{type: 'project'}]})],
      validation: (rule) => rule.max(2).unique(),
    }),
    orderRankField({type: 'project', newItemPosition: 'before'}),

    defineField({name: 'seo', title: 'SEO', type: 'seo', group: 'seo'}),
  ],
  preview: {
    select: {
      title: 'title',
      date: 'date',
      category: 'categories.0.title',
      image: 'hero.image',
      poster: 'hero.poster',
    },
    prepare: ({title, date, category, image, poster}) => ({
      title,
      subtitle: [category, date?.slice(0, 4)].filter(Boolean).join(' · '),
      media: image?.asset ? image : poster,
    }),
  },
})
