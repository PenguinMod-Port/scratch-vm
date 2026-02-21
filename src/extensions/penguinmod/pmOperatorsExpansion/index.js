const BlockType = require('../../../extension-support/block-type');
const ArgumentType = require('../../../extension-support/argument-type');
const Cast = require('../../../util/cast');

function generateJoin(inputs) {
    return {
        opcode: `join${inputs}`,
        func: 'joinMultiple',
        text: `join${Array(inputs).fill().map((_, i) => ` [STRING${i+1}]`).join("")}`,
        blockType: BlockType.REPORTER,
        arguments: Object.fromEntries(Array(inputs).fill().map((_, i) => [`STRING${i+1}`, {
            type: ArgumentType.STRING
        }])),
        hideFromPalette: true
    };
}

const template = {
    extensions: ["colours_operators"]
};

class Extension {
    getInfo() {
        return {
            id: "pmOperatorsExpansion",
            name: "Operators Expansion",
            color1: "#59c059",
            color2: "#46b946",
            color3: "#389438",
            blocks: [
                //legacy joins
                generateJoin(4),
                generateJoin(5),
                generateJoin(6),
                generateJoin(7),
                generateJoin(8),
                generateJoin(9),

                {
                    opcode: "typeOfValue",
                    text: "type of [INPUT]",
                    blockType: BlockType.REPORTER,
                    arguments: {
                        INPUT: {
                            type: ArgumentType.STRING,
                            defaultValue: "foo"
                        }
                    },
                    ...template
                }
            ]
        };
    }

    joinMultiple(args) {
        return Object.values(args).map(Cast.toString).join("");
    }

    typeOfValue({INPUT}) {
        if (INPUT === null || INPUT === undefined) return 'null';
        if (typeof INPUT === 'boolean') return 'boolean';
        if (typeof INPUT === 'number') return 'number';
        if (typeof INPUT === 'string') return 'string';
        if (INPUT instanceof Array) return 'array';
        if (typeof INPUT === 'object') {
            const prototype = Object.getPrototypeOf(INPUT);
            if (prototype === null || prototype === Object.prototype) return 'object';
            else if (INPUT.customId) return INPUT.customId;
        }
        return 'unknown';
    }
}

module.exports = Extension