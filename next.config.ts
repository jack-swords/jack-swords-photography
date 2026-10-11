import type {NextConfig} from 'next'

const nextConfig: NextConfig = {
  images: {
    // Sanity's CDN does resizing/format negotiation itself; see src/sanity/lib/image-loader.ts.
    loader: 'custom',
    loaderFile: './src/sanity/lib/image-loader.ts',
    qualities: [75],
    deviceSizes: [640, 828, 1080, 1440, 1920, 2560, 3200],
  },
}

export default nextConfig
