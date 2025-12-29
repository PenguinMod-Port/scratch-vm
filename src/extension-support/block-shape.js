// Use the constants instead of manually redefining them again
const ScratchBlocksConstants = require('../engine/scratch-blocks-constants');

/**
 * Types of block shapes
 * @enum {number}
 */
const BlockShape = {
    /**
     * Output shape: hexagonal (booleans/predicates).
     */
    HEXAGONAL: ScratchBlocksConstants.OUTPUT_SHAPE_HEXAGONAL,

    /**
     * Output shape: rounded (numbers).
     */
    ROUND: ScratchBlocksConstants.OUTPUT_SHAPE_ROUND,

    /**
     * Output shape: squared (arrays).
     */
    SQUARE: ScratchBlocksConstants.OUTPUT_SHAPE_SQUARE,

    /**
     * Output shape: leaf (vectors).
     */
    LEAF: ScratchBlocksConstants.OUTPUT_SHAPE_LEAF,

    /**
     * Output shape: plus (objects/classes or class instances).
     */
    PLUS: ScratchBlocksConstants.OUTPUT_SHAPE_PLUS,

    /**
     * Output shape: octagonal (scratch targets).
     */
    OCTAGONAL: ScratchBlocksConstants.OUTPUT_SHAPE_OCTAGONAL
};

module.exports = BlockShape;
