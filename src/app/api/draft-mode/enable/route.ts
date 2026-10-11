import {defineEnableDraftMode} from 'next-sanity/draft-mode'

import {client} from '@/sanity/lib/client'

// Called by the Studio's Presentation tool with a one-time secret, which is
// checked against the dataset before draft mode is switched on.
export const {GET} = defineEnableDraftMode({
  client: client.withConfig({token: process.env.SANITY_API_READ_TOKEN}),
})
