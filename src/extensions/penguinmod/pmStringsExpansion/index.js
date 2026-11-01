const BlockType = require('../../../extension-support/block-type');
const ArgumentType = require('../../../extension-support/argument-type');
const Cast = require('../../../util/cast');

const template = {
    extensions: ["colours_operators_strings"]
};

class Extension {
    constructor() {
        this.replacers = Object.create(null);
    }

    getInfo() {
        return {
            id: "pmStringsExpansion",
            name: "Strings Expansion",
            color: "#47c18a",
            blocks: [
                {
                    blockType: BlockType.XML,
                    xml: `
                    <block type="operator_textIncludesLetterFrom">
                        <value name="TEXT1">
                            <shadow type="text">
                                <field name="TEXT">abcdef</field>
                            </shadow>
                        </value>
                        <value name="TEXT2">
                            <shadow type="text">
                                <field name="TEXT">fgh</field>
                            </shadow>
                        </value>
                    </block>
                    `
                },
                "---",
                {
                    opcode: "reverseChars",
                    text: "reverse [TEXT]",
                    blockType: BlockType.REPORTER,
                    arguments: {
                        TEXT: {
                            type: ArgumentType.STRING,
                            defaultValue: "Hello!"
                        }
                    },
                    ...template
                },
                {
                    opcode: "shuffleChars",
                    text: "shuffle [TEXT]",
                    blockType: BlockType.REPORTER,
                    arguments: {
                        TEXT: {
                            type: ArgumentType.STRING,
                            defaultValue: "Hello!"
                        }
                    },
                    ...template
                },
                "---",
                {
                    opcode: "textAfter",
                    text: "text after [TEXT] in [BASE]",
                    blockType: BlockType.REPORTER,
                    arguments: {
                        TEXT: {
                            type: ArgumentType.STRING,
                            defaultValue: "Hello"
                        },
                        BASE: {
                            type: ArgumentType.STRING,
                            defaultValue: "Hello world!"
                        }
                    },
                    ...template
                },
                {
                    opcode: "textBefore",
                    text: "text before [TEXT] in [BASE]",
                    blockType: BlockType.REPORTER,
                    arguments: {
                        TEXT: {
                            type: ArgumentType.STRING,
                            defaultValue: "world"
                        },
                        BASE: {
                            type: ArgumentType.STRING,
                            defaultValue: "Hello world!"
                        }
                    },
                    ...template
                },
                "---",
                {
                    opcode: "setReplacer",
                    text: "set replacer [REPLACER] to [TEXT]",
                    blockType: BlockType.COMMAND,
                    arguments: {
                        REPLACER: {
                            type: ArgumentType.STRING,
                            defaultValue: "${replacer}"
                        },
                        TEXT: {
                            type: ArgumentType.STRING,
                            defaultValue: "world"
                        }
                    },
                    ...template
                },
                {
                    opcode: "resetReplacers",
                    text: "reset replacers",
                    blockType: BlockType.COMMAND,
                    ...template
                },
                {
                    opcode: "applyReplacers",
                    text: "apply replacers to [TEXT]",
                    blockType: BlockType.REPORTER,
                    arguments: {
                        TEXT: {
                            type: ArgumentType.STRING,
                            defaultValue: "Hello ${replacer}!"
                        }
                    },
                    ...template
                },
            ],
        };
    }

    reverseChars({TEXT}) {
        return Cast.toString(TEXT).split("").reverse().join("");
    }

    shuffleChars({TEXT}) {
        return Cast.toString(TEXT).split("").sort(_ => Math.random() - 0.5).join("");
    }

    textAfter({TEXT, BASE}) {
        TEXT = Cast.toString(TEXT);
        BASE = Cast.toString(BASE);

        const idx = BASE.indexOf(TEXT);
        if (idx < 0) return "";
        return BASE.substring(idx + TEXT.length);
    }

    textBefore({TEXT, BASE}) {
        TEXT = Cast.toString(TEXT);
        BASE = Cast.toString(BASE);

        const idx = BASE.indexOf(TEXT);
        if (idx < 0) return "";
        return BASE.substring(0, idx);
    }

    setReplacer({REPLACER, TEXT}) {
        this.replacers[Cast.toString(REPLACER)] = Cast.toString(TEXT);
    }

    resetReplacers() {
        this.replacers = Object.create(null);
    }

    applyReplacers({TEXT}) {
        TEXT = Cast.toString(TEXT);
        for (const [replacer, replacement] of Object.entries(this.replacers)) {
            TEXT = TEXT.replaceAll(replacer, replacement);
        }
        return TEXT;
    }
}

module.exports = Extension