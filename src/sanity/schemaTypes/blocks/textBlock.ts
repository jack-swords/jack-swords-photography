import {TextIcon} from '@sanity/icons/Text'
import {defineField, defineType} from 'sanity'

export const textBlock = defineType({
  name: 'textBlock',
  title: 'Text',
  type: 'object',
  icon: TextIcon,
  fields: [defineField({name: 'body', type: 'richText', validation: (rule) => rule.required()})],
  preview: {
    select: {body: 'body'},
    prepare: ({body}) => {
      const first = (body ?? []).find((b: {_type: string}) => b._type === 'block')
      const text = first?.children?.map((c: {text?: string}) => c.text ?? '').join('') ?? ''
      return {title: text || 'Text', subtitle: 'Text', media: TextIcon}
    },
  },
})
