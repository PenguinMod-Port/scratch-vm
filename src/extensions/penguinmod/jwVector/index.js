const ArgumentType = require('../../../extension-support/argument-type');
const BlockShape = require('../../../extension-support/block-shape');
const BlockType = require('../../../extension-support/block-type');
const MenuType = require('../../../extension-support/menu-type');
const TargetType = require('../../../extension-support/target-type');

const Cast = require('../../../util/cast');
const MathUtil = require('../../../util/math-util');

/**
 * @param {number} x
 * @returns {string}
 */
function formatNumber(x) {
    if (x >= 1e6) {
        return x.toExponential(4);
    } else {
        x = Math.floor(x * 1000) / 1000;
        return x.toFixed(Math.min(3, (String(x).split('.')[1] || '').length));
    }
}

function span(text) {
    let el = document.createElement('span');
    el.innerHTML = text;
    el.style.display = 'hidden';
    el.style.whiteSpace = 'nowrap';
    el.style.width = '100%';
    el.style.textAlign = 'center';
    return el;
}

class VectorType {
    customId = "jwVector"

    /**
     * @param  {...number} components 
     */
    constructor(...components) {
        this.components = new Float64Array(components);
    }

    static toVector(x) {
        if (x instanceof VectorType) return x;
        if (x !== null && x.toJSON) {
            let json = x.toJSON();
            if (!(json instanceof Array)) json = Object.values();
            return new VectorType(...json.map(v => Cast.toNumber(v)));
        }
        const strX = Cast.toString(x);
        if (strX.includes(",")) {
            return new VectorType(...strX.split(",").map(v => Cast.toNumber(v)));
        }
        return new VectorType();
    }

    toString() {
        return this.components.join(",");
    }

    get x() { return this.components[0] ?? 0; }
    get y() { return this.components[1] ?? 0; }
    get z() { return this.components[2] ?? 0; }
    get w() { return this.components[3] ?? 0; }
    get magnitude() { return Math.hypot(...this.components); }
    get angle() { return Math.atan2(this.components[0] ?? 0, this.components[1] ?? 0) * (180 / Math.PI); }

    toJSON() {
        return Object.fromEntries(Array.from(this.components).map((v, i) => [(["x", "y", "z", "w"])[i] ?? `d${i + 1}`, v]));
    }

    static fromMagnitude(magnitude, angle) {
        angle = angle / 180 * -Math.PI;

        return new VectorType(
            magnitude * -Math.sin(angle),
            magnitude * Math.cos(angle)
        );
    }

    getComponent(component) {
        component -= 1;
        return this.components[component] ?? 0;
    }

    /**
     * @param  {...VectorType} vectors 
     */
    static add(...vectors) {
        const outputDimension = vectors.reduce((o, v) => Math.max(o, v.components.length), 0);
        const components = [];
        for (let i = 1; i <= outputDimension; i++) {
            components.push(vectors.reduce((o, v) => o + v.getComponent(i), 0));
        }
        return new VectorType(...components);
    }

    /**
     * @param  {...VectorType} vectors 
     */
    static subtract(...vectors) {
        const outputDimension = vectors.reduce((o, v) => Math.max(o, v.components.length), 0);
        const components = [];
        for (let i = 1; i <= outputDimension; i++) {
            components.push(vectors.reduce((o, v) => o - v.getComponent(i), 0));
        }
        return new VectorType(...components);
    }

    /**
     * @param  {...VectorType} vectors 
     */
    static multiply(...vectors) {
        const outputDimension = vectors.reduce((o, v) => Math.max(o, v.components.length), 0);
        const components = [];
        for (let i = 1; i <= outputDimension; i++) {
            components.push(vectors.reduce((o, v) => o * v.getComponent(i), 1));
        }
        return new VectorType(...components);
    }

    /**
     * @param  {...VectorType} vectors 
     */
    static divide(...vectors) {
        const outputDimension = vectors.reduce((o, v) => Math.max(o, v.components.length), 0);
        const components = [];
        for (let i = 1; i <= outputDimension; i++) {
            components.push(vectors.reduce((o, v, j) => j === 0 ? v.getComponent(i) : (o / v.getComponent(i)), 0));
        }
        return new VectorType(...components);
    }

    multiply(factor) {
        return new VectorType(...this.components.map(v => v * factor));
    }

    divide(factor) {
        return new VectorType(...this.components.map(v => v / factor));
    }
}

const jwVector = {
    Type: VectorType,
    Block: {
        blockType: BlockType.REPORTER,
        blockShape: BlockShape.LEAF,
        forceOutputType: "jwVector",
        disableMonitor: true
    },
    Argument: {
        shape: BlockShape.LEAF,
        check: ["jwVector"]
    }
};

class Extension {
    constructor() {
        vm.jwVector = jwVector;
        vm.runtime.registerSerializer(
            "jwVector", 
            v => v.components, 
            v => new jwVector.Type(v.components)
        );
        vm.extensionManager.extendCompiler("jwVector", this.extendCompiler.bind(this));
    }

    getInfo() {
        return {
            id: "jwVector",
            name: "Vector",
            color: "#6babff",
            menuIconURI: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMCAyMCIgeG1sbnM6Yng9Imh0dHBzOi8vYm94eS1zdmcuY29tIj4KICA8ZWxsaXBzZSBzdHlsZT0ic3Ryb2tlLXdpZHRoOiAycHg7IHBhaW50LW9yZGVyOiBzdHJva2U7IGZpbGw6IHJnYigxMDcsIDE3MSwgMjU1KTsgc3Ryb2tlOiByZ2IoNjksIDEyNiwgMjA0KTsiIGN4PSIxMCIgY3k9IjEwIiByeD0iOSIgcnk9IjkiPjwvZWxsaXBzZT4KICA8cGF0aCBkPSJNIDQuMzUyIDEzLjc2NiBDIDQuMzUyIDE0LjgwNSA1LjE5NCAxNS42NDggNi4yMzUgMTUuNjQ4IEwgMTAgMTUuNjQ4IEMgMTEuMDM5IDE1LjY0OCAxMS44ODIgMTQuODA1IDExLjg4MiAxMy43NjYgTCAxMS44ODIgMTAgQyAxMS44ODIgOC45NTkgMTEuMDM5IDguMTE4IDEwIDguMTE4IEwgNi4yMzUgOC4xMTggQyA1LjE5NCA4LjExOCA0LjM1MiA4Ljk1OSA0LjM1MiAxMCBMIDQuMzUyIDEzLjc2NiBNIDguMTE3IDEzLjc2NiBDIDYuNjY4IDEzLjc2NiA1Ljc2MiAxMi4xOTUgNi40ODcgMTAuOTQyIEMgNi44MjIgMTAuMzU4IDcuNDQzIDEwIDguMTE3IDEwIEMgOS41NjcgMTAgMTAuNDcyIDExLjU2OSA5Ljc0NyAxMi44MjQgQyA5LjQxMSAxMy40MDYgOC43ODkgMTMuNzY2IDguMTE3IDEzLjc2NiBNIDcuMTc2IDkuMDU5IEwgOS4wNTggOS4wNTkgTCA5LjA1OCA1LjI5NCBDIDkuMDU4IDQuNTY5IDguMjczIDQuMTE2IDcuNjQ3IDQuNDc5IEMgNy4zNTUgNC42NDYgNy4xNzYgNC45NTcgNy4xNzYgNS4yOTQgTCA3LjE3NiA5LjA1OSBaIE0gMTAuOTQxIDEwLjk0MiBMIDEwLjk0MSAxMi44MjQgTCAxNC43MDYgMTIuODI0IEMgMTUuNDMxIDEyLjgyNCAxNS44ODMgMTIuMDM5IDE1LjUyMSAxMS40MTIgQyAxNS4zNTIgMTEuMTIxIDE1LjA0MSAxMC45NDIgMTQuNzA2IDEwLjk0MiBMIDEwLjk0MSAxMC45NDIgWiIgc3R5bGU9ImZpbGw6IHJnYigyNTUsIDI1NSwgMjU1KTsiPjwvcGF0aD4KPC9zdmc+",
            blocks: [
                {
                    opcode: 'newVector',
                    text: 'x: [X] y: [Y]',
                    arguments: {
                        X: {
                            type: ArgumentType.NUMBER
                        },
                        Y: {
                            type: ArgumentType.NUMBER
                        }
                    },
                    ...jwVector.Block
                },
                {
                    opcode: 'newVector3',
                    text: 'x: [X] y: [Y] z: [Z]',
                    arguments: {
                        X: {
                            type: ArgumentType.NUMBER
                        },
                        Y: {
                            type: ArgumentType.NUMBER
                        },
                        Z: {
                            type: ArgumentType.NUMBER
                        }
                    },
                    ...jwVector.Block
                },
                "---",
                {
                    opcode: 'newVectorFromMagnitude',
                    text: 'magnitude: [X] angle: [Y]',
                    arguments: {
                        X: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0
                        },
                        Y: {
                            type: ArgumentType.ANGLE,
                            defaultValue: 90
                        }
                    },
                    ...jwVector.Block
                },
                "---",
                {
                    opcode: 'vectorX',
                    text: '[VECTOR] x',
                    blockType: BlockType.REPORTER,
                    arguments: {
                        VECTOR: jwVector.Argument
                    },
                    hideFromPalette: true
                },
                {
                    opcode: 'vectorY',
                    text: '[VECTOR] y',
                    blockType: BlockType.REPORTER,
                    arguments: {
                        VECTOR: jwVector.Argument
                    },
                    hideFromPalette: true
                },
                {
                    opcode: 'getComponentMenu',
                    text: '[VECTOR] [COMPONENT]',
                    blockType: BlockType.REPORTER,
                    arguments: {
                        COMPONENT: {
                            menu: 'component'
                        },
                        VECTOR: jwVector.Argument
                    }
                },
                {
                    opcode: 'getComponent',
                    text: 'component [COMPONENT] of [VECTOR]',
                    blockType: BlockType.REPORTER,
                    arguments: {
                        COMPONENT: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 1
                        },
                        VECTOR: jwVector.Argument
                    }
                },
                {
                    opcode: 'getDimension',
                    text: 'dimension of [VECTOR]',
                    blockType: BlockType.REPORTER,
                    arguments: {
                        VECTOR: jwVector.Argument
                    }
                },
                "---",
                {
                    opcode: 'add',
                    text: '[X] + [Y]',
                    arguments: {
                        X: jwVector.Argument,
                        Y: jwVector.Argument
                    },
                    hideFromPalette: true,
                    ...jwVector.Block
                },
                {
                    opcode: 'addExpandable',
                    text: '[EXPANDABLE]',
                    arguments: {
                        EXPANDABLE: {
                            type: ArgumentType.EXPANDABLE,
                            minValue: 2,
                            defaultValue: 2,
                            text: '[VECTOR]',
                            arguments: {
                                VECTOR: jwVector.Argument
                            },
                            separator: ' + '
                        }
                    },
                    ...jwVector.Block
                },
                {
                    opcode: 'subtract',
                    text: '[X] - [Y]',
                    arguments: {
                        X: jwVector.Argument,
                        Y: jwVector.Argument
                    },
                    hideFromPalette: true,
                    ...jwVector.Block
                },
                {
                    opcode: 'subtractExpandable',
                    text: '[EXPANDABLE]',
                    arguments: {
                        EXPANDABLE: {
                            type: ArgumentType.EXPANDABLE,
                            minValue: 2,
                            defaultValue: 2,
                            text: '[VECTOR]',
                            arguments: {
                                VECTOR: jwVector.Argument
                            },
                            separator: ' - '
                        }
                    },
                    ...jwVector.Block
                },
                {
                    opcode: 'multiplyB',
                    text: '[X] * [Y]',
                    arguments: {
                        X: jwVector.Argument,
                        Y: jwVector.Argument
                    },
                    hideFromPalette: true,
                    ...jwVector.Block
                },
                {
                    opcode: 'multiplyExpandable',
                    text: '[EXPANDABLE]',
                    arguments: {
                        EXPANDABLE: {
                            type: ArgumentType.EXPANDABLE,
                            minValue: 2,
                            defaultValue: 2,
                            text: '[VECTOR]',
                            arguments: {
                                VECTOR: jwVector.Argument
                            },
                            separator: ' * '
                        }
                    },
                    ...jwVector.Block
                },
                {
                    opcode: 'divideB',
                    text: '[X] / [Y]',
                    arguments: {
                        X: jwVector.Argument,
                        Y: jwVector.Argument
                    },
                    hideFromPalette: true,
                    ...jwVector.Block
                },
                {
                    opcode: 'divideExpandable',
                    text: '[EXPANDABLE]',
                    arguments: {
                        EXPANDABLE: {
                            type: ArgumentType.EXPANDABLE,
                            minValue: 2,
                            defaultValue: 2,
                            text: '[VECTOR]',
                            arguments: {
                                VECTOR: jwVector.Argument
                            },
                            separator: ' / '
                        }
                    },
                    ...jwVector.Block
                },
                "---",
                {
                    opcode: 'multiplyA',
                    text: '[X] * [Y]',
                    arguments: {
                        X: jwVector.Argument,
                        Y: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 1
                        }
                    },
                    ...jwVector.Block
                },
                {
                    opcode: 'divideA',
                    text: '[X] / [Y]',
                    arguments: {
                        X: jwVector.Argument,
                        Y: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 1
                        }
                    },
                    ...jwVector.Block
                },
            ],
            menus: {
                component: {
                    type: MenuType.STRICT,
                    items: [
                        { text: 'x', value: 'x' },
                        { text: 'y', value: 'y' },
                        { text: 'z', value: 'z' }
                    ]
                }
            }
        };
    }

    extendCompiler({IntermediateStackBlock, IntermediateInput, InputType, InputOpcode}) {
        const opcodes = {
            FROM_COMPONENTS: 'jwVector.fromComponents',
            FROM_MAGNITUDE: 'jwVector.fromMagnitude',

            GET_COMPONENT: 'jwVector.getComponent',
            GET_DIMENSION: 'jwVector.getDimension',

            ADD: 'jwVector.add',
            SUBTRACT: 'jwVector.subtract',
            MULTIPLY: 'jwVector.multiply',
            DIVIDE: 'jwVector.divide',

            MULTIPLY_FACTOR: 'jwVector.multiplyFactor',
            DIVIDE_FACTOR: 'jwVector.divideFactor'
        };

        return {
            ir: {
                reporter(block) {
                    switch (block.opcode) {
                        case 'jwVector_newVector':
                            return new IntermediateInput(opcodes.FROM_COMPONENTS, InputType.CUSTOM_TYPE, {
                                components: [
                                    this.descendInputOfBlock(block, 'X').toType(InputType.NUMBER),
                                    this.descendInputOfBlock(block, 'Y').toType(InputType.NUMBER)
                                ]
                            });
                        case 'jwVector_newVectorFromMagnitude':
                            return new IntermediateInput(opcodes.FROM_MAGNITUDE, InputType.CUSTOM_TYPE, {
                                magnitude: this.descendInputOfBlock(block, 'X').toType(InputType.NUMBER),
                                angle: this.descendInputOfBlock(block, 'Y').toType(InputType.NUMBER)
                            });

                        case 'jwVector_newVector3':
                            return new IntermediateInput(opcodes.FROM_COMPONENTS, InputType.CUSTOM_TYPE, {
                                components: [
                                    this.descendInputOfBlock(block, 'X').toType(InputType.NUMBER),
                                    this.descendInputOfBlock(block, 'Y').toType(InputType.NUMBER),
                                    this.descendInputOfBlock(block, 'Z').toType(InputType.NUMBER)
                                ]
                            });
                        
                        case 'jwVector_vectorX':
                            return new IntermediateInput(opcodes.GET_COMPONENT, InputType.NUMBER, {
                                component: this.createConstantInput(1),
                                vector: this.descendInputOfBlock(block, 'VECTOR')
                            });
                        case 'jwVector_vectorY':
                            return new IntermediateInput(opcodes.GET_COMPONENT, InputType.NUMBER, {
                                component: this.createConstantInput(2),
                                vector: this.descendInputOfBlock(block, 'VECTOR')
                            });
                        case 'jwVector_getComponentMenu':
                            let component = (["x", "y", "z"]).indexOf(block.fields.COMPONENT.value) + 1;
                            if (component === 0) return this.createConstantInput(0);
                            return new IntermediateInput(opcodes.GET_COMPONENT, InputType.NUMBER, {
                                component: this.createConstantInput(component),
                                vector: this.descendInputOfBlock(block, 'VECTOR')
                            });
                        case 'jwVector_getComponent':
                            return new IntermediateInput(opcodes.GET_COMPONENT, InputType.NUMBER, {
                                component: this.descendInputOfBlock(block, 'COMPONENT').toType(InputType.NUMBER),
                                vector: this.descendInputOfBlock(block, 'VECTOR')
                            });
                        case 'jwVector_getDimension':
                            return new IntermediateInput(opcodes.GET_DIMENSION, InputType.NUMBER_WHOLE, {
                                vector: this.descendInputOfBlock(block, 'VECTOR')
                            });

                        case 'jwVector_add':
                            return new IntermediateInput(opcodes.ADD, InputType.CUSTOM_TYPE, {
                                vectors: [
                                    this.descendInputOfBlock(block, 'X'),
                                    this.descendInputOfBlock(block, 'Y')
                                ]
                            });
                        case 'jwVector_addExpandable':
                            return new IntermediateInput(opcodes.ADD, InputType.CUSTOM_TYPE, {
                                vectors: this.descendExpandableValue(block, 'EXPANDABLE', 'VECTOR')
                            });
                        case 'jwVector_subtract':
                            return new IntermediateInput(opcodes.SUBTRACT, InputType.CUSTOM_TYPE, {
                                vectors: [
                                    this.descendInputOfBlock(block, 'X'),
                                    this.descendInputOfBlock(block, 'Y')
                                ]
                            });
                        case 'jwVector_subtractExpandable':
                            return new IntermediateInput(opcodes.SUBTRACT, InputType.CUSTOM_TYPE, {
                                vectors: this.descendExpandableValue(block, 'EXPANDABLE', 'VECTOR')
                            });
                        case 'jwVector_multiplyB':
                            return new IntermediateInput(opcodes.MULTIPLY, InputType.CUSTOM_TYPE, {
                                vectors: [
                                    this.descendInputOfBlock(block, 'X'),
                                    this.descendInputOfBlock(block, 'Y')
                                ]
                            });
                        case 'jwVector_multiplyExpandable':
                            return new IntermediateInput(opcodes.MULTIPLY, InputType.CUSTOM_TYPE, {
                                vectors: this.descendExpandableValue(block, 'EXPANDABLE', 'VECTOR')
                            });
                        case 'jwVector_divideB':
                            return new IntermediateInput(opcodes.DIVIDE, InputType.CUSTOM_TYPE, {
                                vectors: [
                                    this.descendInputOfBlock(block, 'X'),
                                    this.descendInputOfBlock(block, 'Y')
                                ]
                            });
                        case 'jwVector_divideExpandable':
                            return new IntermediateInput(opcodes.DIVIDE, InputType.CUSTOM_TYPE, {
                                vectors: this.descendExpandableValue(block, 'EXPANDABLE', 'VECTOR')
                            });

                        case 'jwVector_multiplyA':
                            return new IntermediateInput(opcodes.MULTIPLY_FACTOR, InputType.CUSTOM_TYPE, {
                                vector: this.descendInputOfBlock(block, 'X'),
                                factor: this.descendInputOfBlock(block, 'Y').toType(InputType.NUMBER)
                            });
                        case 'jwVector_divideA':
                            return new IntermediateInput(opcodes.DIVIDE_FACTOR, InputType.CUSTOM_TYPE, {
                                vector: this.descendInputOfBlock(block, 'X'),
                                factor: this.descendInputOfBlock(block, 'Y').toType(InputType.NUMBER)
                            });
                    }
                }
            },
            js: {
                reporter(block) {
                    const node = block.inputs;

                    switch (block.opcode) {
                        case opcodes.FROM_COMPONENTS:
                            return `(new vm.jwVector.Type(${node.components.map(v => this.descendInput(v)).join(', ')}))`;
                        case opcodes.FROM_MAGNITUDE:
                            return `vm.jwVector.Type.fromMagnitude(${this.descendInput(node.magnitude)}, ${this.descendInput(node.angle)})`;

                        case opcodes.GET_COMPONENT:
                            return `vm.jwVector.Type.toVector(${this.descendInput(node.vector)}).getComponent(${this.descendInput(node.component)})`;
                        case opcodes.GET_DIMENSION:
                            return `vm.jwVector.Type.toVector(${this.descendInput(node.vector)}).components.length`;

                        case opcodes.ADD:
                            return `vm.jwVector.Type.add(${node.vectors.map(v => `vm.jwVector.Type.toVector(${this.descendInput(v)})`).join(', ')})`;
                        case opcodes.SUBTRACT:
                            return `vm.jwVector.Type.subtract(${node.vectors.map(v => `vm.jwVector.Type.toVector(${this.descendInput(v)})`).join(', ')})`;
                        case opcodes.MULTIPLY:
                            return `vm.jwVector.Type.multiply(${node.vectors.map(v => `vm.jwVector.Type.toVector(${this.descendInput(v)})`).join(', ')})`;
                        case opcodes.DIVIDE:
                            return `vm.jwVector.Type.divide(${node.vectors.map(v => `vm.jwVector.Type.toVector(${this.descendInput(v)})`).join(', ')})`;

                        case opcodes.MULTIPLY_FACTOR:
                            return `vm.jwVector.Type.toVector(${this.descendInput(node.vector)}).multiply(${this.descendInput(node.factor)})`;
                        case opcodes.DIVIDE_FACTOR:
                            return `vm.jwVector.Type.toVector(${this.descendInput(node.vector)}).divide(${this.descendInput(node.factor)})`;
                    }
                }
            }
        };
    }
}

module.exports = Extension