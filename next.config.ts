import type {NextConfig} from 'next'

const nextConfig: NextConfig = {
  images: {
    // Sanity's CDN does resizing/format negotiation itself; see src/sanity/lib/image.ts.
    remotePatterns: [{protocol: 'https', hostname: 'cdn.sanity.io'}],
  },
}

export default nextConfig
