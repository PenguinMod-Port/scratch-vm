const BlockType = require('../../../extension-support/block-type');
const ArgumentType = require('../../../extension-support/argument-type');
const Cast = require('../../../util/cast');

const template = {
    extensions: ["colours_control"]
}

class Extension {
    getInfo() {
        return {
            id: "pmControlsExpansion",
            name: "Controls Expansion",
            color1: "#ffab19",
            color2: "#ec9c13",
            color3: "#cf8b17",
            blocks: [
                {
                    opcode: 'asNewBroadcast',
                    text: "new thread",
                    blockType: BlockType.COMMAND,
                    branches: [{}],
                    ...template
                    /*alignments: [
                        null, // text
                        null, // SUBSTACK
                        ArgumentAlignment.RIGHT // ICON
                    ],
                    arguments: {
                        ICON: {
                            type: ArgumentType.IMAGE,
                            dataURI: AsyncIcon
                        }
                    }*/
                },
                {
                    opcode: 'asNewBroadcastArgs',
                    text: "new thread with data [DATA] [SHADOW]",
                    blockType: BlockType.COMMAND,
                    branches: [{}],
                    arguments: {
                        DATA: {
                            type: ArgumentType.STRING,
                            defaultValue: "foo",
                            exemptFromNormalization: true
                        },
                        SHADOW: {
                            fillIn: 'asNewBroadcastArgBlock'
                        }
                    },
                    ...template
                },
                {
                    opcode: 'asNewBroadcastArgBlock',
                    text: 'thread data',
                    blockType: BlockType.REPORTER,
                    hideFromPalette: true,
                    allowDropAnywhere: true,
                    canDragDuplicate: true
                }
            ]
        };
    }

    // CubesterYT code probably
    asNewBroadcast(_, util) {
        if (util.thread.target.blocks.getBranch(util.thread.peekStack(), 0)) {
            util.sequencer.runtime._pushThread(
                util.thread.target.blocks.getBranch(util.thread.peekStack(), 0),
                util.target,
                {fromThread: util.thread}
            );
        }
    }

    asNewBroadcastArgs(args, util) {
        const data = args.DATA;
        if (util.thread.target.blocks.getBranch(util.thread.peekStack(), 0)) {
            const thread = util.sequencer.runtime._pushThread(
                util.thread.target.blocks.getBranch(util.thread.peekStack(), 0),
                util.target,
                {fromThread: util.thread}
            );

            thread._pmControlsExpansionThreadData = data;
        }
    }

    asNewBroadcastArgBlock(_, util) {
        return util.thread._pmControlsExpansionThreadData ?? null;
    }
}

module.exports = Extension