import type {MetadataRoute} from 'next'

import {siteUrl} from '@/sanity/env'

export default function robots(): MetadataRoute.Robots {
  // Only the production domain is indexed; preview deployments ask not to be.
  const isProduction = process.env.VERCEL_ENV ? process.env.VERCEL_ENV === 'production' : true
  return {
    rules: isProduction ? {userAgent: '*', allow: '/', disallow: ['/studio', '/api/']} : {userAgent: '*', disallow: '/'},
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}
