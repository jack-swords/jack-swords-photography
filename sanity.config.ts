'use client'

import {visionTool} from '@sanity/vision'
import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'

import {apiVersion, dataset, projectId} from './src/sanity/env'
import {schemaTypes, singletonTypes} from './src/sanity/schemaTypes'
import {structure} from './src/sanity/structure'

const singletonActions = new Set(['publish', 'discardChanges', 'restore'])

export default defineConfig({
  name: 'default',
  title: 'Jack Swords Photography',
  basePath: '/studio',
  projectId: projectId || 'unconfigured',
  dataset,
  plugins: [structureTool({structure}), visionTool({defaultApiVersion: apiVersion})],
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
