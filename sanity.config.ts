'use client'

import {visionTool} from '@sanity/vision'
import {defineConfig} from 'sanity'
import {presentationTool} from 'sanity/presentation'
import {structureTool} from 'sanity/structure'

import {apiVersion, dataset, projectId} from './src/sanity/env'
import {schemaTypes, singletonTypes} from './src/sanity/schemaTypes'
import {resolve} from './src/sanity/presentation/resolve'
import {structure} from './src/sanity/structure'

const singletonActions = new Set(['publish', 'discardChanges', 'restore'])

export default defineConfig({
  name: 'default',
  title: 'Jack Swords Photography',
  basePath: '/studio',
  projectId: projectId || 'unconfigured',
  dataset,
  plugins: [
    structureTool({structure}),
    // Visual editing: the site in an iframe, click anything to edit it, drafts previewed live.
    presentationTool({
      title: 'Visual editing',
      resolve,
      previewUrl: {previewMode: {enable: '/api/draft-mode/enable'}},
    }),
    visionTool({defaultApiVersion: apiVersion}),
  ],
  schema: {
    types: schemaTypes,
    // Singletons can't be created from the "new document" menu...
    templates: (templates) => templates.filter(({schemaType}) => !singletonTypes.has(schemaType)),
  },
  document: {
    // ...nor duplicated or deleted.
    actions: (input, {schemaType}) =>
      singletonTypes.has(schemaType) ? input.filter(({action}) => action && singletonActions.has(action)) : input,
  },
})
