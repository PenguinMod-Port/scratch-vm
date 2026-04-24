const BlockType = require('../../../extension-support/block-type');
const BlockShape = require('../../../extension-support/block-shape');
const ArgumentType = require('../../../extension-support/argument-type');
const Cast = require('../../../util/cast');

let dogeiscutObject = {
    Type: class {},
    Block: {},
    Argument: {}
};

class Extension {
    constructor() {
        vm.extensionManager.addExtensionDependency("jwUnit", "https://extensions.penguinmod.com/extensions/DogeisCut/dogeiscutObject.js", () => dogeiscutObject = vm.dogeiscutObject);
    }

    getInfo() {
        return {
            id: "jwUnit",
            name: "Unit",
            blocks: [
                {
                    opcode: "unit",
                    text: "define test [NAME]",
                    blockType: BlockType.EVENT,
                    arguments: {
                        NAME: {
                            type: ArgumentType.STRING,
                            defaultValue: "name"
                        }
                    }
                },
                {
                    opcode: "succeed",
                    text: "succeed",
                    blockType: BlockType.COMMAND,
                    isTerminal: true
                },
                {
                    opcode: "fail",
                    text: "fail [REASON]",
                    blockType: BlockType.COMMAND,
                    isTerminal: true,
                    arguments: {
                        REASON: {
                            type: ArgumentType.STRING,
                            defaultValue: "reason"
                        }
                    }
                },
                "---",
                {
                    opcode: "runAll",
                    text: "run all tests",
                    blockType: BlockType.COMMAND
                },
                {
                    opcode: "runOne",
                    text: "run test [NAME]",
                    blockType: BlockType.COMMAND,
                    arguments: {
                        NAME: {
                            type: ArgumentType.STRING,
                            defaultValue: "name"
                        }
                    }
                },
                {
                    opcode: "results",
                    text: "results",
                    ...dogeiscutObject.Block
                }
            ]
        };
    }
}

module.exports = Extension