import {defineDocuments, defineLocations, type PresentationPluginOptions} from 'sanity/presentation'

/**
 * Tells the Presentation tool which page shows which document (mainDocuments),
 * and where each document appears on the site (locations).
 */
export const resolve: PresentationPluginOptions['resolve'] = {
  mainDocuments: defineDocuments([
    {route: '/', filter: `_id == "homepage"`},
    {route: '/about', filter: `_id == "about"`},
    {route: '/projects/:slug', filter: `_type == "project" && slug.current == $slug`},
    {route: '/journal/:slug', filter: `_type == "post" && slug.current == $slug`},
  ]),
  locations: {
    project: defineLocations({
      select: {title: 'title', slug: 'slug.current'},
      resolve: (doc) => ({
        locations: [
          ...(doc?.slug ? [{title: doc.title || 'Untitled', href: `/projects/${doc.slug}`}] : []),
          {title: 'Works', href: '/projects'},
          {title: 'Homepage', href: '/'},
        ],
      }),
    }),
    category: defineLocations({
      select: {title: 'title', slug: 'slug.current'},
      resolve: (doc) => ({
        locations: [{title: `Works: ${doc?.title ?? ''}`, href: doc?.slug ? `/projects?category=${doc.slug}` : '/projects'}],
      }),
    }),
    post: defineLocations({
      select: {title: 'title', slug: 'slug.current'},
      resolve: (doc) => ({
        locations: [
          ...(doc?.slug ? [{title: doc.title || 'Untitled', href: `/journal/${doc.slug}`}] : []),
          {title: 'Journal', href: '/journal'},
        ],
      }),
    }),
    homepage: defineLocations({locations: [{title: 'Homepage', href: '/'}]}),
    about: defineLocations({locations: [{title: 'About', href: '/about'}]}),
    siteSettings: defineLocations({
      message: 'Used on every page',
      tone: 'positive',
      locations: [
        {title: 'Homepage', href: '/'},
        {title: 'Works', href: '/projects'},
        {title: 'Journal', href: '/journal'},
        {title: 'About', href: '/about'},
      ],
    }),
  },
}
