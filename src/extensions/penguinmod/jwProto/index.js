const BlockType = require('../../../extension-support/block-type');
const ArgumentType = require('../../../extension-support/argument-type');

class jwProto {
    constructor(runtime) {
        this.runtime = runtime;
        // register compiled blocks
        this.runtime.registerCompiledExtensionBlocks('jwProto', this.getCompileInfo());
    }

    getInfo() {
        return {
            id: 'jwProto',
            name: 'Labels',
            color: '#969696',
            menuIconURI: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMCAyMCI+CiAgPGVsbGlwc2Ugc3R5bGU9InN0cm9rZTogcmdiKDEyMCwgMTIwLCAxMjApOyBmaWxsOiByZ2IoMTUwLCAxNTAsIDE1MCk7IiBjeD0iMTAiIGN5PSIxMCIgcng9IjkuNSIgcnk9IjkuNSI+PC9lbGxpcHNlPgogIDxsaW5lIHN0eWxlPSJzdHJva2UtbGluZWNhcDogcm91bmQ7IHN0cm9rZS1saW5lam9pbjogcm91bmQ7IHN0cm9rZS13aWR0aDogMjsgZmlsbDogbm9uZTsgc3Ryb2tlOiByZ2IoMjU1LCAyNTUsIDI1NSk7IiB4MT0iOS44ODQiIHkxPSI2LjIzMiIgeDI9IjYuMTE2IiB5Mj0iMTMuNzY4Ij48L2xpbmU+CiAgPGxpbmUgc3R5bGU9InN0cm9rZS1saW5lY2FwOiByb3VuZDsgc3Ryb2tlLWxpbmVqb2luOiByb3VuZDsgc3Ryb2tlLXdpZHRoOiAyOyBmaWxsOiBub25lOyBzdHJva2U6IHJnYigyNTUsIDI1NSwgMjU1KTsiIHgxPSIxMy44ODQiIHkxPSI2LjIzMiIgeDI9IjEwLjExNiIgeTI9IjEzLjc2OCI+PC9saW5lPgo8L3N2Zz4=',
            blocks: [
                {
                    opcode: 'labelHat',
                    text: '// [LABEL]',
                    blockType: BlockType.HAT,
                    arguments: {
                        LABEL: {
                            type: ArgumentType.STRING,
                            defaultValue: "label"
                        }
                    }
                },
                {
                    opcode: 'labelFunction',
                    text: '// [LABEL]',
                    blockType: BlockType.COMMAND,
                    branchCount: 1,
                    arguments: {
                        LABEL: {
                            type: ArgumentType.STRING,
                            defaultValue: "label"
                        }
                    }
                },
                {
                    opcode: 'labelCommand',
                    text: '// [LABEL]',
                    blockType: BlockType.COMMAND,
                    arguments: {
                        LABEL: {
                            type: ArgumentType.STRING,
                            defaultValue: "label"
                        }
                    }
                },
                {
                    opcode: 'labelReporter',
                    text: '[VALUE] // [LABEL]',
                    blockType: BlockType.REPORTER,
                    allowDropAnywhere: true,
                    disableMonitor: true,
                    arguments: {
                        LABEL: {
                            type: ArgumentType.STRING,
                            defaultValue: "label"
                        },
                        VALUE: {
                            type: ArgumentType.STRING,
                            defaultValue: "value"
                        }
                    }
                },
                {
                    opcode: 'labelBoolean',
                    text: '[VALUE] // [LABEL]',
                    blockType: BlockType.BOOLEAN,
                    hideFromPalette: true,
                    arguments: {
                        LABEL: {
                            type: ArgumentType.STRING,
                            defaultValue: "label"
                        },
                        VALUE: {
                            type: ArgumentType.BOOLEAN
                        }
                    }
                },
                "---",
                {
                    opcode: 'placeholderCommand',
                    text: '...',
                    blockType: BlockType.COMMAND,
                    hideFromPalette: true
                },
                {
                    opcode: 'placeholderReporter',
                    text: '...',
                    blockType: BlockType.REPORTER,
                    dualBlock: true,
                    allowDropAnywhere: true,
                    disableMonitor: true,
                },
                {
                    opcode: 'placeholderBoolean',
                    text: '...',
                    blockType: BlockType.BOOLEAN,
                    hideFromPalette: true
                },
            ]
        };
    }
    /**
     * This function is used for any compiled blocks in the extension if they exist.
     * Data in this function is given to the IR & JS generators.
     * Data must be valid otherwise errors may occur.
     * @returns {object} functions that create data for compiled blocks.
     */
    getCompileInfo() {
        return {
            ir: {
                labelFunction: (generator, block) => ({
                    kind: 'stack',
                    branch: generator.descendSubstack(block, 'SUBSTACK')
                })
            },
            js: {
                labelFunction: (node, compiler, imports) => {
                    compiler.descendStack(node.branch, new imports.Frame(false));
                }
            }
        };
    }

    labelHat() {
        return false;
    }
    labelFunction(_, util) {
        util.startBranch(1, false);
    }
    labelCommand() {
        return;
    }
    labelReporter(args) {
        return args.VALUE;
    }
    labelBoolean(args) {
        return args.VALUE;
    }

    placeholderCommand() {
        return;
    }
    placeholderReporter() {
        return null;
    }
    placeholderBoolean() {
        return false;
    }
}

module.exports = jwProto;
