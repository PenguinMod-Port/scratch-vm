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
    get magnitude() { return Math.hypot(...this.components); }
    get angle() { return Math.atan2(this.components[0] ?? 0, this.components[1] ?? 0) * (180 / Math.PI); }

    toJSON() {
        return this.components;
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
            color1: "#6babff",
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
                }
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
            GET_DIMENSION: 'jwVector.getDimension'
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
                    }
                }
            }
        };
    }
}

module.exports = Extension