import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'

const config = [
  ...nextVitals,
  ...nextTs,
  {ignores: ['.next/**', 'node_modules/**', 'seed-output/**', 'next-env.d.ts', 'src/sanity/types.ts']},
]

export default config
