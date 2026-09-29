import {defineField} from 'sanity'

export const keepColumnsOnMobileField = defineField({
  name: 'keepColumnsOnMobile',
  title: 'Keep side by side on mobile',
  type: 'boolean',
  description: 'By default multi-image blocks stack to one column on small screens.',
  initialValue: false,
})

export const sizeOptions = [
  {title: 'Small', value: 's'},
  {title: 'Medium', value: 'm'},
  {title: 'Large', value: 'l'},
]

/** Short preview subtitle helper: "Pair · 2 images". */
export function countImages(...images: unknown[]) {
  const n = images.filter(Boolean).length
  return `${n} image${n === 1 ? '' : 's'}`
}
