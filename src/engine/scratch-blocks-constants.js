/**
 * These constants are copied from scratch-blocks/core/constants.js
 * @TODO find a way to require() these straight from scratch-blocks... maybe make a scratch-blocks/dist/constants.js?
 * @readonly
 * @enum {int}
 */
const ScratchBlocksConstants = {
    /**
     * ENUM for output shape: hexagonal (booleans/predicates).
     * @const
     */
    OUTPUT_SHAPE_HEXAGONAL: 1,

    /**
     * ENUM for output shape: rounded (numbers/strings/any).
     * @const
     */
    OUTPUT_SHAPE_ROUND: 2,

    /**
     * ENUM for output shape: squared (arrays).
     * @const
     */
    OUTPUT_SHAPE_SQUARE: 3,

    /**
     * ENUM for output shape: leaf (vectors).
     * @const
     */
    OUTPUT_SHAPE_LEAF: 4,

    /**
     * ENUM for output shape: plus (objects/classes or class instances).
     * @const
     */
    OUTPUT_SHAPE_PLUS: 5,

    /**
     * ENUM for output shape: octagonal (scratch targets).
     * @const
     */
    OUTPUT_SHAPE_OCTAGONAL: 6,

    /**
     * ENUM for output shape: bumped (BigInt).
     * @const
     */
    OUTPUT_SHAPE_BUMPED: 7,

    /**
     * ENUM for output shape: indented (XML / html elements).
     * @const
     */
    OUTPUT_SHAPE_INDENTED: 8,

    /**
     * ENUM for output shape: scrapped (maps).
     */
    OUTPUT_SHAPE_SCRAPPED: 9,

    /**
     * ENUM for output shape: arrow (sets).
     * @const
     */
    OUTPUT_SHAPE_ARROW: 10,

    /**
     * ENUM for output shape: ticket (dates).
     * @const
     */
    OUTPUT_SHAPE_TICKET: 11,

    /**
     * ENUM for output shape: slanted (regex).
     * @const
     */
    OUTPUT_SHAPE_SLANTED: 12
};

module.exports = ScratchBlocksConstants;
