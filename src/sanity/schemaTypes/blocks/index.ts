import {imageFullBleed} from './imageFullBleed'
import {imageGrid2x2} from './imageGrid2x2'
import {imageOffset} from './imageOffset'
import {imagePair} from './imagePair'
import {imageRow} from './imageRow'
import {imageSingle} from './imageSingle'
import {spacer} from './spacer'
import {textBlock} from './textBlock'

// Row first: it covers pairs, triples and grids; the presets after it remain for existing content.
export const blockTypes = [imageRow, imageSingle, imageFullBleed, imageOffset, imagePair, imageGrid2x2, textBlock, spacer]

/** Names in the order they appear in the "Add item" menu. */
export const blockTypeNames = blockTypes.map((t) => t.name)
