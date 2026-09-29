import {imageFullBleed} from './imageFullBleed'
import {imageGrid2x2} from './imageGrid2x2'
import {imageOffset} from './imageOffset'
import {imagePair} from './imagePair'
import {imageSingle} from './imageSingle'
import {spacer} from './spacer'
import {textBlock} from './textBlock'

export const blockTypes = [imageSingle, imageFullBleed, imagePair, imageGrid2x2, imageOffset, textBlock, spacer]

/** Names in the order they appear in the "Add item" menu. */
export const blockTypeNames = blockTypes.map((t) => t.name)
