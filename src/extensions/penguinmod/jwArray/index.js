const BlockType = require('../../../extension-support/block-type')
const BlockShape = require('../../../extension-support/block-shape')
const ArgumentType = require('../../../extension-support/argument-type')
const Cast = require('../../../util/cast')

let arrayLimit = 2 ** 32 - 1

/**
* @param {number} x
* @returns {string}
*/
function formatNumber(x) {
    if (x >= 1e6) {
        return x.toExponential(4)
    } else {
        x = Math.floor(x * 1000) / 1000
        return x.toFixed(Math.min(3, (String(x).split('.')[1] || '').length))
    }
}

const escapeHTML = unsafe => {
    return unsafe
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;")
};

function clampIndex(x) {
    return Math.min(Math.max(Math.floor(x), 0), arrayLimit)
}

function span(text) {
    let el = document.createElement('span')
    el.innerHTML = text
    el.style.display = 'hidden'
    el.style.whiteSpace = 'nowrap'
    el.style.width = '100%'
    el.style.textAlign = 'center'
    return el
}

function isObject(x) {
    return x !== null && typeof x === "object" && [null, Object.prototype].includes(Object.getPrototypeOf(x));
}

class ArrayType {
    customId = "jwArray"

    array = []

    constructor(array = [], safe = false) {
        this.array = safe ? array : array.map(ArrayType.forArray)
    }

    static toArray(x, readOnly = false) {
        if (x instanceof ArrayType) return readOnly ? x : new ArrayType([...x.array], true)
        if (x instanceof Array) return readOnly ? new ArrayType(x) : new ArrayType([...x])
        if (x === "" || x === null || x === undefined) return new ArrayType([], true)
        if (typeof x == "object" && typeof x.toJSON == "function") {
            let parsed = x.toJSON()
            if (parsed instanceof Array) return new ArrayType(parsed)
            if (isObject(parsed)) return new ArrayType(Object.values(parsed))
            return new ArrayType([parsed])
        }
        try {
            let parsed = JSON.parse(x)
            if (parsed instanceof Array) return new ArrayType(parsed)
        } catch {}
        return new ArrayType([x], true)
    }

    static forArray(x) {
        if (x instanceof ArrayType) return new ArrayType([...x.array], true)
        if (x instanceof Array) return new ArrayType([...x])
        if (vm.dogeiscutObject && isObject(x)) return new vm.dogeiscutObject.Type({...x})
        return x
    }

    static display(x) {
        try {
            switch (typeof x) {
                case "object":
                    if (x === null) return '<i style="opacity: 0.75;">null</i>'
                    if (typeof x.jwArrayHandler == "function") return x.jwArrayHandler()
                    return "Object"
                case "undefined":
                    return "null"
                case "number":
                    return formatNumber(x)
                case "boolean":
                    return x ? "true" : "false"
                case "string":
                    return `"${escapeHTML(Cast.toString(x))}"`
            }
        } catch {}
        return "?"
    }

    static parseLength(length) {
        return clampIndex(length)
    }

    jwArrayHandler() {
        return `Array<${formatNumber(this.array.length)}>`
    }

    toString(pretty = false) {
        return JSON.stringify(this.toJSON(), null, pretty ? "\t" : null)
    }
    toJSON() {
        return this.array.map(v => {
            if (typeof v == "object" && v !== null) {
                if (v.toJSON && typeof v.toJSON == "function") return v.toJSON()
                if (v.toString && typeof v.toString == "function") return v.toString()
                return JSON.stringify(v)
            }
            return v
        })
    }

    toMonitorContent = () => span(this.toString())

    toReporterContent() {
        let root = document.createElement('div')
        root.style.display = 'flex'
        root.style.flexDirection = 'column'
        root.style.justifyContent = 'center'

        let arrayDisplay = span(`[${this.array.slice(0, 50).map(v => ArrayType.display(v)).join(', ')}]`)
        arrayDisplay.style.overflow = "hidden"
        arrayDisplay.style.whiteSpace = "nowrap"
        arrayDisplay.style.textOverflow = "ellipsis"
        arrayDisplay.style.maxWidth = "256px"
        root.appendChild(arrayDisplay)

        root.appendChild(span(`Length: ${this.array.length}`))

        return root
    }

    flat(depth = 1) {
        depth = Math.floor(depth)
        if (depth < 1) return this
        return new ArrayType(this.array.reduce((o, v) => {
            if (v instanceof ArrayType) return [...o, ...v.flat(depth - 1).array]
            return [...o, v]
        }, []), true)
    }

    get length() {
        return this.array.length
    }

    static range(start, end) {
        let array = Array(this.parseLength(end - start + 1))
            .fill(0)
            .map((v, i) => start + i);
        return new ArrayType(array, true);
    }

    indexOf(value) {
        if (![null, Object.prototype].includes(Object.getPrototypeOf(value)) && value.customId) {
            // custom type
            return this.array.findIndex(v => v.customId == value.customId && Cast.toString(v) == Cast.toString(value)) + 1;
        } else {
            return this.array.indexOf(value) + 1;
        }
    }

    has(value) {
        if (![null, Object.prototype].includes(Object.getPrototypeOf(value)) && value.customId) {
            // custom type
            return this.array.some(v => v.customId == value.customId && Cast.toString(v) == Cast.toString(value));
        } else {
            return this.array.includes(value);
        }
    }

    set(index, value) {
        this.array[index - 1] = ArrayType.forArray(value);
        return this;
    }

    append(value) {
        this.array.push(ArrayType.forArray(value));
        return this;
    }

    concat(other) {
        this.array = this.array.concat(other.array);
        return this;
    }

    fill(value) {
        this.array.fill(ArrayType.forArray(value));
        return this;
    }

    reverse() {
        this.array.reverse();
        return this;
    }

    splice(index, items) {
        this.array.splice(index - 1, items);
        return this;
    }

    repeat(times) {
        this.array = this.array.repeat(times);
        return this;
    }
}

const jwArray = {
    Type: ArrayType,
    Block: {
        blockType: BlockType.REPORTER,
        blockShape: BlockShape.SQUARE,
        outputCheck: "Array",
        disableMonitor: true
    },
    Argument: {
        shape: BlockShape.SQUARE,
        exemptFromNormalization: true,
        check: ["Array"]
    }
}

class Extension {
    constructor() {
        vm.jwArray = jwArray

        vm.runtime.registerSerializer( //this basically copies variable serialization
            "jwArray",
            v => v.array.map(w => {
                if (typeof w == "object" && w != null && w.customId) {
                    return {
                        customType: true,
                        typeId: w.customId,
                        serialized: vm.runtime.serializers[w.customId].serialize(w)
                    };
                }
                return w
            }), 
            v => new jwArray.Type(v.map(w => {
                if (typeof w == "object" && w != null && w.customType) {
                    return vm.runtime.serializers[w.typeId].deserialize(w.serialized)
                }
                return w
            }), true)
        );
        vm.extensionManager.extendCompiler("jwArray", this.extendCompiler.bind(this));
        //vm.runtime.registerCompiledExtensionBlocks('jwArray', this.getCompileInfo());
    }
    getInfo() {
        return {
            id: "jwArray",
            name: "Arrays",
            color1: "#ff513d",
            menuIconURI: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMCAyMCIgeG1sbnM6Yng9Imh0dHBzOi8vYm94eS1zdmcuY29tIj4KICA8Y2lyY2xlIHN0eWxlPSJzdHJva2Utd2lkdGg6IDJweDsgcGFpbnQtb3JkZXI6IHN0cm9rZTsgZmlsbDogcmdiKDI1NSwgODEsIDYxKTsgc3Ryb2tlOiByZ2IoMjA1LCA1OSwgNDQpOyIgY3g9IjEwIiBjeT0iMTAiIHI9IjkiPjwvY2lyY2xlPgogIDxwYXRoIGQ9Ik0gOC4wNzMgNC4yMiBMIDYuMTQ3IDQuMjIgQyA1LjA4MyA0LjIyIDQuMjIgNS4wODMgNC4yMiA2LjE0NyBMIDQuMjIgMTMuODUzIEMgNC4yMiAxNC45MTkgNS4wODMgMTUuNzggNi4xNDcgMTUuNzggTCA4LjA3MyAxNS43OCBMIDguMDczIDEzLjg1MyBMIDYuMTQ3IDEzLjg1MyBMIDYuMTQ3IDYuMTQ3IEwgOC4wNzMgNi4xNDcgTCA4LjA3MyA0LjIyIFogTSAxMS45MjcgMTMuODUzIEwgMTMuODUzIDEzLjg1MyBMIDEzLjg1MyA2LjE0NyBMIDExLjkyNyA2LjE0NyBMIDExLjkyNyA0LjIyIEwgMTMuODUzIDQuMjIgQyAxNC45MTcgNC4yMiAxNS43OCA1LjA4MyAxNS43OCA2LjE0NyBMIDE1Ljc4IDEzLjg1MyBDIDE1Ljc4IDE0LjkxOSAxNC45MTcgMTUuNzggMTMuODUzIDE1Ljc4IEwgMTEuOTI3IDE1Ljc4IEwgMTEuOTI3IDEzLjg1MyBaIiBmaWxsPSIjZmZmIiBzdHlsZT0iIj48L3BhdGg+Cjwvc3ZnPg==",
            blocks: [
                {
                    opcode: 'parse',
                    text: 'parse [INPUT] as array',
                    arguments: {
                        INPUT: {
                            type: ArgumentType.STRING,
                            defaultValue: '["a", "b", "c"]',
                            exemptFromNormalization: true
                        }
                    },
                    ...jwArray.Block
                },
                "---",
                {
                    opcode: 'blank',
                    text: 'blank array',
                    ...jwArray.Block
                },
                {
                    opcode: 'blankLength',
                    text: 'blank array of length [LENGTH]',
                    arguments: {
                        LENGTH: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 1
                        }
                    },
                    ...jwArray.Block
                },
                {
                    opcode: 'fromList',
                    text: 'array from list [LIST]',
                    arguments: {
                        LIST: {
                            menu: "list"
                        }
                    },
                    hideFromPalette: true, //doesn't work for some reason
                    ...jwArray.Block
                },
                {
                    opcode: 'range',
                    text: 'range from [START] to [END]',
                    arguments: {
                        START: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 1
                        },
                        END: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 10
                        }
                    },
                    ...jwArray.Block
                },
                {
                    opcode: 'split',
                    text: 'split [STRING] by [DIVIDER]',
                    arguments: {
                        STRING: {
                            type: ArgumentType.STRING,
                            defaultValue: "foo"
                        },
                        DIVIDER: {
                            type: ArgumentType.STRING
                        }
                    },
                    ...jwArray.Block
                },
                "---",
                {
                    opcode: 'builder',
                    text: 'array builder [SHADOW]',
                    branches: [{}],
                    arguments: {
                        SHADOW: {
                            fillIn: 'builderCurrent'
                        }
                    },
                    ...jwArray.Block
                },
                {
                    opcode: 'builderCurrent',
                    text: 'current array',
                    hideFromPalette: true,
                    canDragDuplicate: true,
                    ...jwArray.Block
                },
                {
                    opcode: 'builderAppend',
                    text: 'append [VALUE] to builder',
                    blockType: BlockType.COMMAND,
                    arguments: {
                        VALUE: {
                            type: ArgumentType.STRING,
                            defaultValue: "foo",
                            exemptFromNormalization: true
                        }
                    }
                },
                {
                    opcode: 'builderSet',
                    text: 'set builder to [ARRAY]',
                    blockType: BlockType.COMMAND,
                    arguments: {
                        ARRAY: jwArray.Argument
                    }
                },
                "---",
                {
                    opcode: 'get',
                    text: 'get [INDEX] in [ARRAY]',
                    blockType: BlockType.REPORTER,
                    allowDropAnywhere: true,
                    arguments: {
                        ARRAY: jwArray.Argument,
                        INDEX: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 1
                        }
                    }
                },
                {
                    opcode: 'items',
                    text: 'items [X] to [Y] in [ARRAY]',
                    arguments: {
                        ARRAY: jwArray.Argument,
                        X: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 1
                        },
                        Y: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 3
                        }
                    },
                    ...jwArray.Block
                },
                {
                    opcode: 'index',
                    text: 'index of [VALUE] in [ARRAY]',
                    blockType: BlockType.REPORTER,
                    arguments: {
                        ARRAY: jwArray.Argument,
                        VALUE: {
                            type: ArgumentType.STRING,
                            defaultValue: "foo",
                            exemptFromNormalization: true
                        }
                    }
                },
                {
                    opcode: 'has',
                    text: '[ARRAY] has [VALUE]',
                    blockType: BlockType.BOOLEAN,
                    arguments: {
                        ARRAY: jwArray.Argument,
                        VALUE: {
                            type: ArgumentType.STRING,
                            exemptFromNormalization: true
                        }
                    }
                },
                {
                    opcode: 'length',
                    text: 'length of [ARRAY]',
                    blockType: BlockType.REPORTER,
                    arguments: {
                        ARRAY: jwArray.Argument
                    }
                },
                "---",
                {
                    opcode: 'set',
                    text: 'set [INDEX] in [ARRAY] to [VALUE]',
                    arguments: {
                        ARRAY: jwArray.Argument,
                        INDEX: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 1
                        },
                        VALUE: {
                            type: ArgumentType.STRING,
                            defaultValue: "foo",
                            exemptFromNormalization: true
                        }
                    },
                    ...jwArray.Block
                },
                {
                    opcode: 'append',
                    text: 'append [VALUE] to [ARRAY]',
                    arguments: {
                        ARRAY: jwArray.Argument,
                        VALUE: {
                            type: ArgumentType.STRING,
                            defaultValue: "foo",
                            exemptFromNormalization: true
                        }
                    },
                    ...jwArray.Block
                },
                {
                    opcode: 'concat',
                    text: 'merge [ONE] with [TWO]',
                    arguments: {
                        ONE: jwArray.Argument,
                        TWO: jwArray.Argument
                    },
                    ...jwArray.Block
                },
                {
                    opcode: 'fill',
                    text: 'fill [ARRAY] with [VALUE]',
                    arguments: {
                        ARRAY: jwArray.Argument,
                        VALUE: {
                            type: ArgumentType.STRING,
                            defaultValue: "foo",
                            exemptFromNormalization: true
                        }
                    },
                    ...jwArray.Block
                },
                "---",
                {
                    opcode: 'reverse',
                    text: 'reverse [ARRAY]',
                    arguments: {
                        ARRAY: jwArray.Argument
                    },
                    ...jwArray.Block
                },
                {
                    opcode: 'splice',
                    text: 'splice [ARRAY] at [INDEX] with [ITEMS] items',
                    arguments: {
                        ARRAY: jwArray.Argument,
                        INDEX: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 1
                        },
                        ITEMS: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 1
                        }
                    },
                    ...jwArray.Block
                },
                {
                    opcode: 'repeat',
                    text: 'repeat [ARRAY] [TIMES] times',
                    arguments: {
                        ARRAY: jwArray.Argument,
                        TIMES: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 2
                        }
                    },
                    ...jwArray.Block
                },
                {
                    opcode: 'flat',
                    text: 'flat [ARRAY] with depth [DEPTH]',
                    arguments: {
                        ARRAY: jwArray.Argument,
                        DEPTH: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 1
                        }
                    },
                    ...jwArray.Block
                },
                "---",
                {
                    opcode: 'toString',
                    text: 'stringify [ARRAY] [FORMAT]',
                    blockType: BlockType.REPORTER,
                    arguments: {
                        ARRAY: jwArray.Argument,
                        FORMAT: {
                            menu: "stringifyFormat",
                            defaultValue: "compact"
                        }
                    }
                },
                {
                    opcode: 'join',
                    text: 'join [ARRAY] with [DIVIDER]',
                    blockType: BlockType.REPORTER,
                    arguments: {
                        ARRAY: jwArray.Argument,
                        DIVIDER: {
                            type: ArgumentType.STRING,
                            defaultValue: ""
                        }
                    }
                },
                {
                    opcode: 'sum',
                    text: 'sum of [ARRAY]',
                    blockType: BlockType.REPORTER,
                    arguments: {
                        ARRAY: jwArray.Argument
                    }
                },
                "---",
                {
                    opcode: 'forEachI',
                    text: 'index',
                    blockType: BlockType.REPORTER,
                    hideFromPalette: true,
                    canDragDuplicate: true
                },
                {
                    opcode: 'forEachV',
                    text: 'value',
                    blockType: BlockType.REPORTER,
                    hideFromPalette: true,
                    allowDropAnywhere: true,
                    canDragDuplicate: true
                },
                {
                    opcode: 'forEach',
                    text: 'for [I] [V] of [ARRAY]',
                    blockType: BlockType.LOOP,
                    arguments: {
                        ARRAY: jwArray.Argument,
                        I: {
                            fillIn: 'forEachI'
                        },
                        V: {
                            fillIn: 'forEachV'
                        }
                    }
                },
                {
                    opcode: 'basicSort',
                    text: 'sort [ARRAY] [I] [V] > [VALUE]',
                    arguments: {
                        ARRAY: jwArray.Argument,
                        I: {
                            fillIn: 'forEachI'
                        },
                        V: {
                            fillIn: 'forEachV'
                        },
                        VALUE: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 1
                        }
                    },
                    ...jwArray.Block
                }
            ],
            menus: {
                list: {
                    acceptReporters: false,
                    items: ["deprecated"]
                },
                stringifyFormat: {
                    acceptReporters: false,
                    items: [
                        "compact",
                        "pretty"
                    ]
                }
            }
        };
    }

    extendCompiler({IntermediateStackBlock, IntermediateInput, InputType, InputOpcode}) {
        const opcodes = {
            PARSE: 'jwArray.parse',

            BLANK: 'jwArray.blank',
            BLANK_LENGTH: 'jwArray.blankLength',
            RANGE: 'jwArray.range',
            SPLIT: 'jwArray.split',

            BUILDER: 'jwArray.builder',
            BUILDER_CURRENT: 'jwArray.builderCurrent',
            BUILDER_APPEND: 'jwArray.builderAppend',
            BUILDER_SET: 'jwArray.builderSet',

            GET: 'jwArray.get',
            ITEMS: 'jwArray.items',
            INDEX: 'jwArray.index',
            HAS: 'jwArray.has',
            LENGTH: 'jwArray.length',

            SET: 'jwArray.set',
            APPEND: 'jwArray.append',
            CONCAT: 'jwArray.concat',
            FILL: 'jwArray.fill',

            REVERSE: 'jwArray.reverse',
            SPLICE: 'jwArray.splice',
            REPEAT: 'jwArray.repeat',
            FLAT: 'jwArray.flat',

            TO_STRING: 'jwArray.toString',
            JOIN: 'jwArray.join',
            SUM: 'jwArray.sum',

            LOOP_INDEX: 'jwArray.loopIndex',
            LOOP_VALUE: 'jwArray.loopValue',
            FOR_EACH: 'jwArray.forEach',
            BASIC_SORT: 'jwArray.basicSort'
        }

        return {
            ir: {
                reporter(block) {
                    switch (block.opcode) {
                        case 'jwArray_parse':
                            return new IntermediateInput(opcodes.PARSE, InputType.CUSTOM_TYPE, {
                                input: this.descendInputOfBlock(block, 'INPUT')
                            });

                        case 'jwArray_blank':
                            return new IntermediateInput(opcodes.BLANK, InputType.CUSTOM_TYPE);
                        case 'jwArray_blankLength':
                            return new IntermediateInput(opcodes.BLANK_LENGTH, InputType.CUSTOM_TYPE, {
                                len: this.descendInputOfBlock(block, 'LENGTH').toType(InputType.NUMBER)
                            });
                        case 'jwArray_range':
                            return new IntermediateInput(opcodes.RANGE, InputType.CUSTOM_TYPE, {
                                start: this.descendInputOfBlock(block, 'START').toType(InputType.NUMBER),
                                end: this.descendInputOfBlock(block, 'END').toType(InputType.NUMBER)
                            });
                        case 'jwArray_split':
                            return new IntermediateInput(opcodes.SPLIT, InputType.CUSTOM_TYPE, {
                                string: this.descendInputOfBlock(block, 'STRING').toType(InputType.STRING),
                                divider: this.descendInputOfBlock(block, 'DIVIDER').toType(InputType.STRING)
                            });

                        case 'jwArray_builder':
                            return new IntermediateInput(opcodes.BUILDER, InputType.CUSTOM_TYPE, {
                                substack: this.descendSubstack(block, 'SUBSTACK')
                            });
                        case 'jwArray_builderCurrent':
                            return new IntermediateInput(opcodes.BUILDER_CURRENT, InputType.CUSTOM_TYPE);
                        
                        case 'jwArray_get':
                            return new IntermediateInput(opcodes.GET, InputType.ANY, {
                                array: this.descendInputOfBlock(block, 'ARRAY'),
                                index: this.descendInputOfBlock(block, 'INDEX').toType(InputType.NUMBER)
                            });
                        case 'jwArray_items':
                            return new IntermediateInput(opcodes.ITEMS, InputType.CUSTOM_TYPE, {
                                array: this.descendInputOfBlock(block, 'ARRAY'),
                                from: this.descendInputOfBlock(block, 'X').toType(InputType.NUMBER),
                                to: this.descendInputOfBlock(block, 'Y').toType(InputType.NUMBER)
                            });
                        case 'jwArray_index':
                            return new IntermediateInput(opcodes.INDEX, InputType.NUMBER_WHOLE, {
                                array: this.descendInputOfBlock(block, 'ARRAY'),
                                value: this.descendInputOfBlock(block, 'VALUE')
                            });
                        case 'jwArray_has':
                            return new IntermediateInput(opcodes.HAS, InputType.BOOLEAN, {
                                array: this.descendInputOfBlock(block, 'ARRAY'),
                                value: this.descendInputOfBlock(block, 'VALUE')
                            });
                        case 'jwArray_length':
                            return new IntermediateInput(opcodes.LENGTH, InputType.NUMBER_WHOLE, {
                                array: this.descendInputOfBlock(block, 'ARRAY')
                            });

                        case 'jwArray_set':
                            return new IntermediateInput(opcodes.SET, InputType.CUSTOM_TYPE, {
                                array: this.descendInputOfBlock(block, 'ARRAY'),
                                index: this.descendInputOfBlock(block, 'INDEX').toType(InputType.NUMBER),
                                value: this.descendInputOfBlock(block, 'VALUE')
                            });
                        case 'jwArray_append':
                            return new IntermediateInput(opcodes.APPEND, InputType.CUSTOM_TYPE, {
                                array: this.descendInputOfBlock(block, 'ARRAY'),
                                value: this.descendInputOfBlock(block, 'VALUE')
                            });
                        case 'jwArray_concat':
                            return new IntermediateInput(opcodes.CONCAT, InputType.CUSTOM_TYPE, {
                                array1: this.descendInputOfBlock(block, 'ONE'),
                                array2: this.descendInputOfBlock(block, 'TWO')
                            });
                        case 'jwArray_fill':
                            return new IntermediateInput(opcodes.FILL, InputType.CUSTOM_TYPE, {
                                array: this.descendInputOfBlock(block, 'ARRAY'),
                                value: this.descendInputOfBlock(block, 'VALUE')
                            });
                        
                        case 'jwArray_reverse':
                            return new IntermediateInput(opcodes.REVERSE, InputType.CUSTOM_TYPE, {
                                array: this.descendInputOfBlock(block, 'ARRAY')
                            });
                        case 'jwArray_splice':
                            return new IntermediateInput(opcodes.SPLICE, InputType.CUSTOM_TYPE, {
                                array: this.descendInputOfBlock(block, 'ARRAY'),
                                index: this.descendInputOfBlock(block, 'INDEX').toType(InputType.NUMBER),
                                items: this.descendInputOfBlock(block, 'ITEMS').toType(InputType.NUMBER)
                            });
                        case 'jwArray_repeat':
                            return new IntermediateInput(opcodes.REPEAT, InputType.CUSTOM_TYPE, {
                                array: this.descendInputOfBlock(block, 'ARRAY'),
                                times: this.descendInputOfBlock(block, 'TIMES').toType(InputType.NUMBER)
                            });
                        case 'jwArray_flat':
                            return new IntermediateInput(opcodes.FLAT, InputType.CUSTOM_TYPE, {
                                array: this.descendInputOfBlock(block, 'ARRAY'),
                                depth: this.descendInputOfBlock(block, 'DEPTH').toType(InputType.NUMBER)
                            });

                        case 'jwArray_toString':
                            return new IntermediateInput(opcodes.TO_STRING, InputType.STRING, {
                                array: this.descendInputOfBlock(block, 'ARRAY'),
                                pretty: block.fields.FORMAT.value === 'pretty'
                            });
                        case 'jwArray_join':
                            return new IntermediateInput(opcodes.JOIN, InputType.STRING, {
                                array: this.descendInputOfBlock(block, 'ARRAY'),
                                divider: this.descendInputOfBlock(block, 'DIVIDER')
                            });
                        case 'jwArray_sum':
                            return new IntermediateInput(opcodes.SUM, InputType.NUMBER, {
                                array: this.descendInputOfBlock(block, 'ARRAY')
                            });
                        
                        case 'jwArray_forEachI':
                            return new IntermediateInput(opcodes.LOOP_INDEX, InputType.NUMBER_WHOLE);
                        case 'jwArray_forEachV':
                            return new IntermediateInput(opcodes.LOOP_VALUE, InputType.ANY);
                        case 'jwArray_basicSort':
                            return new IntermediateInput(opcodes.BASIC_SORT, InputType.CUSTOM_TYPE, {
                                array: this.descendInputOfBlock(block, 'ARRAY'),
                                value: this.descendInputOfBlock(block, 'VALUE')
                            }, true);
                    }
                },
                command(block) {
                    switch (block.opcode) {
                        case 'jwArray_builderAppend':
                            return new IntermediateStackBlock(opcodes.BUILDER_APPEND, {
                                value: this.descendInputOfBlock(block, 'VALUE')
                            });
                        case 'jwArray_builderSet':
                            return new IntermediateStackBlock(opcodes.BUILDER_SET, {
                                array: this.descendInputOfBlock(block, 'ARRAY')
                            });
                        
                        case 'jwArray_forEach':
                            return new IntermediateStackBlock(opcodes.FOR_EACH, {
                                array: this.descendInputOfBlock(block, 'ARRAY'),
                                substack: this.descendSubstack(block, 'SUBSTACK')
                            });
                    }
                }
            },
            js: {
                reporter(block) {
                    const node = block.inputs;

                    switch (block.opcode) {
                        case opcodes.PARSE:
                            return `vm.jwArray.Type.toArray(${this.descendInput(node.input)}, true)`;

                        case opcodes.BLANK:
                            return `(new vm.jwArray.Type([], true))`;
                        case opcodes.BLANK_LENGTH:
                            return `(new vm.jwArray.Type(Array(vm.jwArray.Type.parseLength(${this.descendInput(node.len)})).fill(null), true))`;
                        case opcodes.RANGE:
                            return `vm.jwArray.Type.range(${this.descendInput(node.start)}, ${this.descendInput(node.end)})`;
                        case opcodes.SPLIT:
                            return `(new vm.jwArray.Type(${this.descendInput(node.string)}.split(${this.descendInput(node.divider)}), true))`;
                        
                        case opcodes.BUILDER: {
                            let source = "";
                            source += `vm.jwArray.Type.toArray(${this.script.yields ? "yield* (function*" : "(function"}() {\n`
                            source += `const _jwArrayBuilder = [];`
                            source += this.descendStackInline(node.substack, {allowReturns: true, inLoop: false});
                            source += `return _jwArrayBuilder;\n`
                            source += `})(), true)`;
                            return source;
                        }
                        case opcodes.BUILDER_CURRENT:
                            return `(new vm.jwArray.Type(typeof _jwArrayBuilder !== "undefined" ? _jwArrayBuilder : [], true))`;
                        
                        case opcodes.GET:
                            return `(vm.jwArray.Type.toArray(${this.descendInput(node.array)}).array[${this.descendInput(node.index)}-1] ?? null)`;
                        case opcodes.ITEMS:
                            return `(new vm.jwArray.Type(vm.jwArray.Type.toArray(${this.descendInput(node.array)}, true).slice(Math.max(${this.descendInput(node.from)} - 1, 0), Math.max(${this.descendInput(node.to)}, 0)), true))`;
                        case opcodes.INDEX:
                            return `vm.jwArray.Type.toArray(${this.descendInput(node.array)}, true).indexOf(${this.descendInput(node.value)})`;
                        case opcodes.HAS:
                            return `vm.jwArray.Type.toArray(${this.descendInput(node.array)}, true).has(${this.descendInput(node.value)})`;
                        case opcodes.LENGTH:
                            return `vm.jwArray.Type.toArray(${this.descendInput(node.array)}, true).length`;

                        case opcodes.SET:
                            return `vm.jwArray.Type.toArray(${this.descendInput(node.array)}).set(${this.descendInput(node.index)}, ${this.descendInput(node.value)})`;
                        case opcodes.APPEND:
                            return `vm.jwArray.Type.toArray(${this.descendInput(node.array)}).append(${this.descendInput(node.value)})`;
                        case opcodes.CONCAT:
                            return `vm.jwArray.Type.toArray(${this.descendInput(node.array1)}).concat(vm.jwArray.Type.toArray(${this.descendInput(node.array2)}, true))`;
                        case opcodes.FILL:
                            return `vm.jwArray.Type.toArray(${this.descendInput(node.array)}).fill(${this.descendInput(node.value)})`;
                        
                        case opcodes.REVERSE:
                            return `vm.jwArray.Type.toArray(${this.descendInput(node.array)}).reverse()`;
                        case opcodes.SPLICE:
                            return `vm.jwArray.Type.toArray(${this.descendInput(node.array)}).splice(${this.descendInput(node.index)}, ${this.descendInput(node.items)})`;
                        case opcodes.REPEAT:
                            return `vm.jwArray.Type.toArray(${this.descendInput(node.array)}).repeat(${this.descendInput(node.times)})`;
                        case opcodes.FLAT:
                            return `vm.jwArray.Type.toArray(${this.descendInput(node.array)}).flat(${this.descendInput(node.depth)})`;
                        
                        case opcodes.TO_STRING:
                            return `vm.jwArray.Type.toArray(${this.descendInput(node.array)}).toString(${node.pretty ? 'true' : ''})`;
                        case opcodes.JOIN:
                            return `vm.jwArray.Type.toArray(${this.descendInput(node.array)}).array.join(${this.descendInput(node.divider)})`;
                        case opcodes.SUM:
                            return `vm.jwArray.Type.toArray(${this.descendInput(node.array)}).array.reduce((o, v) => o + (Number(v) || 0), 0)`;
                        
                        case opcodes.LOOP_INDEX:
                            return `(typeof _jwArrayLoop !== "undefined" ? Number(_jwArrayLoop[0]) + 1 : 0)`;
                        case opcodes.LOOP_VALUE:
                            return `(typeof _jwArrayLoop !== "undefined" ? _jwArrayLoop[1] : null)`;
                        case opcodes.BASIC_SORT: {
                            let source = "";
                            source += `vm.jwArray.Type.toArray(yield* (function*() {\n`;
                            const array = this.localVariables.next();
                            source += `const ${array} = vm.jwArray.Type.toArray(${this.descendInput(node.array)}, true).array;\n`;
                            const sortValues = this.localVariables.next();
                            source += `const ${sortValues} = [];\n`;
                            source += `for (const _jwArrayLoop of Object.entries(${array})) {\n`;
                            source += `${sortValues}.push(${this.descendInput(node.value)});\n`;
                            source += this.yieldLoopInline();
                            source += `}\n`;
                            source += `return ${array}.map((_, i) => i)`;
                            source +=   `.sort((a, b) => ${sortValues}[a] > ${sortValues}[b] ? 1 : ${sortValues}[a] < ${sortValues}[b] ? -1 : 0)`;
                            source +=   `.map(i => ${array}[i]);\n`;
                            source += `}()), true);\n`;
                            return source;
                        }
                    }
                },
                command(block) {
                    const node = block.inputs;
                    switch (block.opcode) {
                        case opcodes.BUILDER_APPEND:
                            this.source += `typeof _jwArrayBuilder !== "undefined" && _jwArrayBuilder.push(vm.jwArray.Type.forArray(${this.descendInput(node.value)}));\n`;
                            return true;
                        case opcodes.BUILDER_SET:
                            this.source += `typeof _jwArrayBuilder !== "undefined" && _jwArrayBuilder = vm.jwArray.Type.toArray(${this.descendInput(node.array)}).array;\n`;
                            return true;
                        
                        case opcodes.FOR_EACH:
                            this.source += `for (const _jwArrayLoop of Object.entries(vm.jwArray.Type.toArray(${this.descendInput(node.array)}, true).array)) {\n`;
                            this.descendStack(node.substack);
                            this.yieldLoop();
                            this.source += `}\n`;
                            return true;
                    }
                }
            }
        }
    }
}

module.exports = Extension