const BlockType = require('../../../extension-support/block-type');
const ArgumentType = require('../../../extension-support/argument-type');
const Cast = require('../../../util/cast');
const TargetType = require('../../extension-support/target-type');
const formatMessage = require('format-message');

/**
 * Icon svg to be displayed on the toolbox category, encoded as a data URI.
 * @type {string}
 */
// eslint-disable-next-line max-len
const menuIconURI = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2Ny4zNDMiIGhlaWdodD0iNjcuMzQzIiB2aWV3Qm94PSIwIDAgNjcuMzQzIDY3LjM0MyI+PGcgc3Ryb2tlLW1pdGVybGltaXQ9IjEwIj48cGF0aCBkPSJNMy44NjggMzMuNjcxYzAtMTYuNDYgMTMuMzQzLTI5LjgwMyAyOS44MDMtMjkuODAzczI5LjgwMyAxMy4zNDMgMjkuODAzIDI5LjgwMy0xMy4zNDMgMjkuODAzLTI5LjgwMyAyOS44MDNTMy44NjggNTAuMTMxIDMuODY4IDMzLjY3MXoiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzc3NGRjYiIgc3Ryb2tlLXdpZHRoPSI3LjUiLz48cGF0aCBkPSJNMy44NjggMzMuNjcxYzAtMTYuNDYgMTMuMzQzLTI5LjgwMyAyOS44MDMtMjkuODAzczI5LjgwMyAxMy4zNDMgMjkuODAzIDI5LjgwMy0xMy4zNDMgMjkuODAzLTI5LjgwMyAyOS44MDNTMy44NjggNTAuMTMxIDMuODY4IDMzLjY3MSIgZmlsbD0iIzk2ZiIvPjxwYXRoIGQ9Ik0wIDY3LjM0MlYuMDAxaDY3LjM0MnY2Ny4zNDJ6IiBmaWxsPSJub25lIi8+PHBhdGggZD0iTTEzLjcyNyAzMS40ODFjLS4yMDMtOS45NzggNS41MjgtMTMuMTc0IDkuODQ0LTEzLjE3NCA1LjI1MiAwIDEwLjU4NC0uMzAzIDE5LjUzNCAwIDQuMzcxLjE0OCAxMC43MiAzLjQ2MiAxMC41MSAxMy4xNzQtLjIgOS4xOTItNy4yOTIgMTEuOTktMTAuNTg0IDExLjk5aC03LjM5N2MtMS41MDMgMC01LjcxMyA3LjkzNC0xMi41ODIgNy42OTctNC44Ny0uMTY4IDIuNzctNy42OTcuODE1LTcuNjk3LTUuNzk4IDAtOS45OTktNS4wNDUtMTAuMTQtMTEuOTkiIGZpbGw9IiNmZmYiLz48L2c+PC9zdmc+';

/**
 * Enum for default font families.
 * @readonly
 * @enum {string}
 */
const Font = {
    SANS_SERIF_ID: 'Sans Serif',
    SERIF_ID: 'Serif',
    HANDWRITING_ID: 'Handwriting',
    MARKER_ID: 'Marker',
    CURLY_ID: 'Curly',
    PIXEL_ID: 'Pixel',

    /* PenguinMod Fonts */
    PLAYFUL_ID: 'Playful',
    BUBBLY_ID: 'Bubbly',
    BITSANDBYTES_ID: 'Bits and Bytes',
    TECHNOLOGICAL_ID: 'Technological',
    ARCADE_ID: 'Arcade',
    ARCHIVO_ID: 'Archivo',
    ARCHIVOBLACK_ID: 'Archivo Black',
    SCRATCH_ID: 'Scratch',
    RANDOM_ID: 'Random'
};

class Extension {
    constructor(runtime) {
        this.runtime = runtime;

        this.ext_looks = this.runtime.ext_scratch3_looks;
    }
    getInfo() {
        return {
            id: 'SPspeechBubbles',
            name: formatMessage({
                id: 'pm.SPspeechBubbles.categoryName',
                default: 'Speech Bubbles',
                description: 'Label for the speech bubble extension category'
            }),
            menuIconURI: menuIconURI,
            blocks: [
                {
                    opcode: 'setSpeechDirection',
                    blockType: BlockType.REPORTER,
                    text: formatMessage({
                        id: 'pm.SPspeechBubbles.setSpeechDirection',
                        default: 'show speech on [SIDE]',
                        description: 'Displays the speech bubble on the left/right side of the sprite'
                    }),
                    arguments: {
                        SIDE: {
                            type: ArgumentType.STRING,
                            menu: 'SPEECH_DIRECTION'
                        }
                    },
                    extensions: ['colours_looks']
                },
                {
                    opcode: 'spokenValue',
                    blockType: BlockType.REPORTER,
                    text: formatMessage({
                        id: 'pm.SPspeechBubbles.spokenValue',
                        default: 'speech',
                        description: 'Returns the spoken text of the sprite'
                    }),
                    extensions: ['colours_looks']
                },
                '---',
                {
                    blockType: BlockType.XML,
                    xml: `<block type="looks_setFont">
                      <value name="font">
                        <shadow type="SPspeechBubbles_menu_FONT">
                          <field name="FONT">Helvetica</field>
                        </shadow>
                      </value>
                      <value name="size">
                        <shadow type="math_number">
                          <field name="NUM">14</field>
                        </shadow>
                      </value>
                    </block>`,
                    filter: [TargetType.STAGE]
                },
                {
                    blockType: BlockType.XML,
                    xml: `<block type="looks_setColor">
                      <value name="color">
                        <shadow type="colour_picker">
                          <field name="COLOUR"></field>
                        </shadow>
                      </value>
                      <field name="prop">BUBBLE_STROKE</field>
                    </block>`,
                    filter: [TargetType.STAGE]
                },
                {
                    blockType: BlockType.XML,
                    xml: `<block type="looks_setShape">
                      <value name="color">
                        <shadow type="math_number">
                          <field name="NUM">0</field>
                        </shadow>
                      </value>
                      <field name="prop">STROKE_WIDTH</field>
                    </block>`,
                    filter: [TargetType.STAGE]
                },
                {
                    blockType: BlockType.XML,
                    xml: `<block id="${_getBlockSpecificId('sayWidth')}" type="looks_sayWidth"></block>`,
                    filter: [TargetType.STAGE]
                },
                {
                    blockType: BlockType.XML,
                    xml: `<block id="${_getBlockSpecificId('sayHeight')}" type="looks_sayHeight"></block>`,
                    filter: [TargetType.STAGE]
                },
            ],
            menus: {
                SPEECH_DIRECTION: {
                    acceptReporters: false,
                    items: [
                        {
                            text: 'left',
                            value: 'left',
                        },
                        {
                            text: 'right',
                            value: 'right',
                        },
                        {
                            text: 'auto',
                            value: 'auto',
                        },
                    ]
                },
                FONT: {
                    acceptReporters: true, items: '_getFonts'
                },
            },
        };
    }

    /**
     * Initialize font selection menu.
     * @returns {array} of text and values for each menu element.
     * @private
     */
    _getFonts () {
        return [
            {
                text: 'Sans Serif',
                value: Font.SANS_SERIF_ID
            },
            {
                text: 'Serif',
                value: Font.SERIF_ID
            },
            {
                text: 'Handwriting',
                value: Font.HANDWRITING_ID
            },
            {
                text: 'Marker',
                value: Font.MARKER_ID
            },
            {
                text: 'Curly',
                value: Font.CURLY_ID
            },
            {
                text: 'Pixel',
                value: Font.PIXEL_ID
            },
            {
                text: 'Playful',
                value: Font.PLAYFUL_ID
            },
            {
                text: 'Bubbly',
                value: Font.BUBBLY_ID
            },
            {
                text: 'Arcade',
                value: Font.ARCADE_ID
            },
            {
                text: 'Bits and Bytes',
                value: Font.BITSANDBYTES_ID
            },
            {
                text: 'Technological',
                value: Font.TECHNOLOGICAL_ID
            },
            {
                text: 'Scratch',
                value: Font.SCRATCH_ID
            },
            {
                text: 'Archivo',
                value: Font.ARCHIVO_ID
            },
            {
                text: 'Archivo Black',
                value: Font.ARCHIVOBLACK_ID
            },
            ...this.runtime.fontManager.getFonts().map(i => ({
                text: i.name,
                value: i.family
            })),
            {
                text: 'random font',
                value: Font.RANDOM_ID
            }
        ];
    }

    /**
     * Creates a unique block id for sprite-specific, xml-based blocks.
     * @param {string} opcode Opcode of block to append.
     * @returns {string} block id.
     * @private
     */
    _getBlockSpecificId(opcode) {
        if (this.runtime._editingTarget) {
            return this.runtime._editingTarget.id + '_' + opcode;
        }

        return opcode;
    }

    setSpeechDirection(args, util) {
        const state = this.ext_looks._getBubbleState(util.target);
        if (!state) return; // Shouldn't happen.

        const oldDirectionState = state.onSpriteRight;
        const oldAutoState = state._forceSide;

        const side = Cast.toString(args.SIDE).toLowerCase();
        state.onSpriteRight = side  === 'right';
        state._forceSide = side !== 'auto';

        if (
            oldDirectionState !== state.onSpriteRight ||
            oldAutoState !== state._forceSide
        ) {
            this.ext_looks._renderBubble(util.target);
        }
    }

    spokenValue(_, util) {
        const state = this.ext_looks._getBubbleState(util.target);

        if (state) return state.text;
        else return '';
    }
}

module.exports = Extension;