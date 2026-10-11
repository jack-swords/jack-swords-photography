export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'byr3hdce'
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
export const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2026-09-01'

/** False until a Sanity project ID is set; the site renders a setup notice instead of crashing. */
export const isSanityConfigured = projectId.length > 0

// Explicit setting first, then the production domain Vercel provides at build time.
const vercelProductionHost = process.env.VERCEL_PROJECT_PRODUCTION_URL
export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  (vercelProductionHost ? `https://${vercelProductionHost}` : 'http://localhost:3000')
).replace(/\/$/, '')
