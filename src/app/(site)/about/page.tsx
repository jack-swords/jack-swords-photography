import type {PortableTextBlock} from '@portabletext/types'
import type {Metadata} from 'next'
import {draftMode} from 'next/headers'

import {RichText} from '@/components/RichText'
import {SanityImage} from '@/components/SanityImage'
import {SiteHeader} from '@/components/SiteHeader'
import {editAttr} from '@/sanity/lib/dataAttribute'
import {sanityFetch} from '@/sanity/lib/live'
import {aboutQuery} from '@/sanity/lib/queries'
import {getSettings} from '@/sanity/lib/settings'
import type {AboutQueryResult} from '@/sanity/types'

export const metadata: Metadata = {
  title: 'About',
  alternates: {canonical: '/about'},
}

export default async function AboutPage() {
  const [about, settings, {isEnabled: isDraftMode}] = await Promise.all([
    sanityFetch<AboutQueryResult>({query: aboutQuery, tags: ['about']}),
    getSettings(),
    draftMode(),
  ])
  const edit = isDraftMode && about ? {id: about._id, type: about._type} : null

  // Contact falls back to the site-wide details in Site settings.
  const email = about?.contact?.email ?? settings?.contactEmail
  const links = about?.contact?.links?.length ? about.contact.links : (settings?.socialLinks ?? [])
  const representation = about?.representation ?? []
  const clients = (about?.clients ?? []).filter(Boolean)

  return (
    <>
      <SiteHeader current="about" />
      <main className="grid gap-y-block-s px-gutter pt-block-s pb-block-m md:grid-cols-12 md:gap-x-6">
        <h1 className="sr-only">About</h1>

        {about?.portrait?.asset ? (
          <div className="md:col-span-5 lg:col-span-4" data-sanity={editAttr(edit, 'portrait')}>
            <div className="md:sticky md:top-8">
              <SanityImage image={about.portrait} sizes="(min-width: 1024px) 33vw, (min-width: 768px) 42vw, 100vw" preload />
            </div>
          </div>
        ) : null}

        <div className="flex flex-col gap-block-s md:col-span-6 md:col-start-7">
          <RichText value={about?.bio as PortableTextBlock[] | null} className="max-w-prose" />

          {email || about?.contact?.phone || links.length ? (
            <Section title="Contact">
              <ul>
                {email ? (
                  <li>
                    <a href={`mailto:${email}`} className="hover:text-ink-muted">
                      {email}
                    </a>
                  </li>
                ) : null}
                {about?.contact?.phone ? (
                  <li>
                    <a href={`tel:${about.contact.phone.replace(/\s+/g, '')}`} className="hover:text-ink-muted">
                      {about.contact.phone}
                    </a>
                  </li>
                ) : null}
                {links.map((link) =>
                  link.url ? (
                    <li key={link._key}>
                      <a href={link.url} target="_blank" rel="noopener noreferrer" className="hover:text-ink-muted">
                        {link.label}
                      </a>
                    </li>
                  ) : null,
                )}
              </ul>
            </Section>
          ) : null}

          {representation.length ? (
            <Section title="Representation">
              <ul className="grid gap-6 sm:grid-cols-2">
                {representation.map((agent) => (
                  <li key={agent._key}>
                    {agent.region ? <span className="block text-ink-muted">{agent.region}</span> : null}
                    {agent.url ? (
                      <a href={agent.url} target="_blank" rel="noopener noreferrer" className="block hover:text-ink-muted">
                        {agent.agency}
                      </a>
                    ) : (
                      <span className="block">{agent.agency}</span>
                    )}
                    {agent.name ? <span className="block">{agent.name}</span> : null}
                    {agent.email ? (
                      <a href={`mailto:${agent.email}`} className="block hover:text-ink-muted">
                        {agent.email}
                      </a>
                    ) : null}
                    {agent.phone ? (
                      <a href={`tel:${agent.phone.replace(/\s+/g, '')}`} className="block hover:text-ink-muted">
                        {agent.phone}
                      </a>
                    ) : null}
                  </li>
                ))}
              </ul>
            </Section>
          ) : null}

          {clients.length ? (
            <Section title="Selected clients">
              <ul className="columns-2 gap-6 sm:columns-3">
                {clients.map((client, i) => (
                  <li key={`${client}-${i}`} className="break-inside-avoid">
                    {client}
                  </li>
                ))}
              </ul>
            </Section>
          ) : null}
        </div>
      </main>
    </>
  )
}

function Section({title, children}: {title: string; children: React.ReactNode}) {
  return (
    <section>
      <h2 className="mb-3 text-ink-muted">{title}</h2>
      {children}
    </section>
  )
}
