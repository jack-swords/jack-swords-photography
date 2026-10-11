import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'byr3hdce',
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  },
  typegen: {
    path: './src/**/*.{ts,tsx}',
    schema: './src/sanity/extract.json',
    generates: './src/sanity/types.ts',
  },
})
