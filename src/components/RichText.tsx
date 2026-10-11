import {PortableText, type PortableTextComponents} from '@portabletext/react'
import type {PortableTextBlock} from '@portabletext/types'

const components: PortableTextComponents = {
  block: {
    normal: ({children}) => <p className="mb-5 last:mb-0">{children}</p>,
    h2: ({children}) => <h2 className="mt-12 mb-4 text-lead first:mt-0">{children}</h2>,
    h3: ({children}) => <h3 className="mt-10 mb-3 font-sans text-ui tracking-wider uppercase first:mt-0">{children}</h3>,
    blockquote: ({children}) => (
      <blockquote className="my-10 text-lead italic first:mt-0 last:mb-0 md:-mx-12">{children}</blockquote>
    ),
  },
  marks: {
    em: ({children}) => <em>{children}</em>,
    strong: ({children}) => <strong className="font-semibold">{children}</strong>,
    link: ({value, children}) => {
      const href: string = value?.href ?? '#'
      const external = /^https?:\/\//.test(href)
      return (
        <a
          href={href}
          className="underline decoration-1 underline-offset-[3px] hover:text-ink-muted"
          {...(external ? {target: '_blank', rel: 'noopener noreferrer'} : {})}
        >
          {children}
        </a>
      )
    },
  },
}

export function RichText({value, className = ''}: {value: PortableTextBlock[] | null | undefined; className?: string}) {
  if (!value?.length) return null
  return (
    <div className={`font-serif text-body ${className}`}>
      <PortableText value={value} components={components} />
    </div>
  )
}
