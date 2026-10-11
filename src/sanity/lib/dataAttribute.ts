import {createDataAttribute} from 'next-sanity'

import {dataset, projectId} from '../env'

export type EditTarget = {id: string; type: string} | null

/**
 * `data-sanity` attribute that makes a non-text element (an image) clickable in
 * the Presentation tool. Text is handled automatically by stega markers.
 * Returns undefined outside draft mode, so the public site carries no extra markup.
 */
export function editAttr(target: EditTarget, path: string): string | undefined {
  if (!target) return undefined
  return createDataAttribute({baseUrl: '/studio', projectId, dataset, id: target.id, type: target.type, path}).toString()
}
