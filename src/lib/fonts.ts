import {Inter_Tight} from 'next/font/google'

/** Display face for large titles (project heroes, journal). Only pages that use it load it. */
export const display = Inter_Tight({subsets: ['latin'], weight: '400', display: 'swap'})
