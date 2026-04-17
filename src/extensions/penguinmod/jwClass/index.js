const BlockType = require('../../../extension-support/block-type');
const BlockShape = require('../../../extension-support/block-shape');
const ArgumentType = require('../../../extension-support/argument-type');
const Cast = require('../../../util/cast');
const pmSymbol = require('../../../util/symbol.js');

class ClassType {
    constructor(construct = function*(){}, extension = null) {
        this.construct = construct;
        /** @type {ClassType?} */
        this.extension = extension;
    }

    toString() {
        return "Class";
    }

    static toClass(v) {
        if (v instanceof ClassType) return v;
        return new ClassType();
    }

    createInstance = function* (thread, target) {
        if (!this.extension) {
            let object = new dogeiscutObject.Type();
            object.map.set("__class__", this);
            let pointer = jwPointer.Type.create();
            pointer.value = object;
            yield* this.construct(pointer, thread, target);
            return pointer;
        } else {
            let pointer = yield* this.extension.createInstance(thread, target);
            let object = pointer.value;
            object.map.set("__class__", this);
            yield* this.construct(pointer, thread, target);
            return pointer;
        }
    }

    extend(extension) {
        return new ClassType(this.construct, extension);
    }
    
    [pmSymbol.equals](other) {
        return this === other;
    }
}

let jwClass = {
    Type: ClassType,
    Block: {
        blockType: BlockType.REPORTER,
        blockShape: BlockShape.TICKET,
        forceOutputType: "jwClass",
        disableMonitor: true
    },
    Argument: {
        shape: BlockShape.TICKET,
        check: ["jwClass"]
    },

    setProp(name, pointer, value) {
        if (!(pointer instanceof jwPointer.Type)) return;
        if (!(pointer.value instanceof dogeiscutObject.Type)) return;
        pointer.value = dogeiscutObject.Type.toObject(pointer.value); //clone
        pointer.value.map.set(name, value);
    },
    getProp(name, pointer) {
        if (!(pointer instanceof jwPointer.Type)) return null;
        if (!(pointer.value instanceof dogeiscutObject.Type)) return null;
        return pointer.value.map.get(name);
    },
    instanceOf(pointer, otherClass) {
        let __class__ = jwClass.getProp("__class__", pointer);
        while (__class__) {
            console.log(__class__, otherClass);
            if (__class__ === otherClass) return true;
            __class__ = __class__.extension;
        }
        return false;
    }
}

let jwArray = {
    Type: class {},
    Block: {},
    Argument: {}
};

let dogeiscutObject = {
    Type: class {},
    Block: {},
    Argument: {}
};

let jwPointer = {
    Type: class {},
    Block: {},
    Argument: {}
};

class Extension {
    constructor() {
        vm.extensionManager.addExtensionDependency("jwClass", "jwArray", () => jwArray = vm.jwArray);
        vm.extensionManager.addExtensionDependency("jwClass", "https://extensions.penguinmod.com/extensions/DogeisCut/dogeiscutObject.js", () => dogeiscutObject = vm.dogeiscutObject);
        vm.extensionManager.addExtensionDependency("jwClass", "jwPointer", () => jwPointer = vm.jwPointer);

        vm.extensionManager.extendCompiler("jwFragment", this.extendCompiler.bind(this));

        vm.jwClass = jwClass;
        vm.runtime.registerSerializer(
            "jwClass", 
            v => null, 
            v => new jwClass.Type()
        );
    }

    getInfo() {
        return {
            id: "jwClass",
            name: "Classes",
            color1: "#4bbf56",
            blocks: [
                {
                    opcode: "class",
                    text: "class [SELF]",
                    arguments: {
                        SELF: {
                            fillIn: "self"
                        }
                    },
                    branches: [{}],
                    ...jwClass.Block
                },
                {
                    opcode: "self",
                    text: "self",
                    hideFromPalette: true,
                    canDragDuplicate: true,
                    ...jwPointer.Block
                },
                {
                    opcode: "extend",
                    text: "[CLASS] extends [EXTENSION]",
                    arguments: {
                        CLASS: jwClass.Argument,
                        EXTENSION: jwClass.Argument
                    },
                    ...jwClass.Block
                },
                "---",
                {
                    opcode: "setProp",
                    text: "set [NAME] on [POINTER] to [VALUE]",
                    blockType: BlockType.COMMAND,
                    arguments: {
                        NAME: {
                            type: ArgumentType.STRING,
                            defaultValue: "foo"
                        },
                        POINTER: jwPointer.Argument,
                        VALUE: {
                            type: ArgumentType.STRING,
                            defaultValue: "bar"
                        }
                    }
                },
                {
                    opcode: "getProp",
                    text: "get [NAME] on [POINTER]",
                    blockType: BlockType.REPORTER,
                    arguments: {
                        NAME: {
                            type: ArgumentType.STRING,
                            defaultValue: "foo"
                        },
                        POINTER: jwPointer.Argument
                    },
                    allowDropAnywhere: true
                },
                {
                    opcode: "getClass",
                    text: "get class of [POINTER]",
                    arguments: {
                        POINTER: jwPointer.Argument
                    },
                    ...jwClass.Block
                },
                "---",
                {
                    opcode: "new",
                    text: "new [CLASS]",
                    arguments: {
                        CLASS: jwClass.Argument
                    },
                    ...jwPointer.Block
                },
                "---",
                {
                    opcode: "instanceof",
                    text: "is [POINTER] instance of [CLASS]?",
                    blockType: BlockType.BOOLEAN,
                    arguments: {
                        POINTER: jwPointer.Argument,
                        CLASS: jwClass.Argument
                    }
                }
            ]
        };
    }
    
    extendCompiler({IntermediateStackBlock, IntermediateInput, InputType, InputOpcode}) {
        const opcodes = {
            CLASS: 'jwClass.class',
            SELF: 'jwClass.self',
            EXTEND: 'jwClass.extend',

            SET: 'jwClass.set',
            GET: 'jwClass.get',

            NEW: 'jwClass.new',

            INSTANCEOF: 'jwClass.instanceof'
        };

        return {
            ir: {
                reporter(block) {
                    switch (block.opcode) {
                        case 'jwClass_class':
                            return new IntermediateInput(opcodes.CLASS, InputType.CUSTOM_TYPE, {
                                substack: this.descendSubstack(block, 'SUBSTACK')
                            }, true);
                        case 'jwClass_self':
                            return new IntermediateInput(opcodes.SELF, InputType.CUSTOM_TYPE);
                        case 'jwClass_extend':
                            return new IntermediateInput(opcodes.EXTEND, InputType.CUSTOM_TYPE, {
                                class: this.descendInputOfBlock(block, 'CLASS'),
                                extension: this.descendInputOfBlock(block, 'EXTENSION')
                            });

                        case 'jwClass_getProp':
                            return new IntermediateInput(opcodes.GET, InputType.CUSTOM_TYPE, {
                                name: this.descendInputOfBlock(block, 'NAME').toType(InputType.STRING),
                                pointer: this.descendInputOfBlock(block, 'POINTER')
                            });
                        case 'jwClass_getClass':
                            return new IntermediateInput(opcodes.GET, InputType.CUSTOM_TYPE, {
                                name: this.createConstantInput('__class__'),
                                pointer: this.descendInputOfBlock(block, 'POINTER')
                            });

                        case 'jwClass_new':
                            return new IntermediateInput(opcodes.NEW, InputType.CUSTOM_TYPE, {
                                class: this.descendInputOfBlock(block, 'CLASS')
                            }, true);

                        case 'jwClass_instanceof':
                            return new IntermediateInput(opcodes.INSTANCEOF, InputType.BOOLEAN, {
                                pointer: this.descendInputOfBlock(block, 'POINTER'),
                                class: this.descendInputOfBlock(block, 'CLASS')
                            });
                    }
                },
                command(block) {
                    switch (block.opcode) {
                        case 'jwClass_setProp':
                            return new IntermediateStackBlock(opcodes.SET, {
                                name: this.descendInputOfBlock(block, 'NAME').toType(InputType.STRING),
                                pointer: this.descendInputOfBlock(block, 'POINTER'),
                                value: this.descendInputOfBlock(block, 'VALUE')
                            });
                    }
                }
            },
            js: {
                reporter(block) {
                    const node = block.inputs;

                    switch (block.opcode) {
                        case opcodes.CLASS:
                            let source = "";
                            source += `(new vm.jwClass.Type(function*(_jwClassSelf, thread, target) {\n`;
                            source += this.descendStackInline(node.substack, {allowReturns: true, inLoop: false});
                            source += `}))`;
                            return source;
                        case opcodes.SELF:
                            return `(typeof _jwClassSelf !== "undefined" ? _jwClassSelf : new vm.jwPointer.Type(0))`;
                        case opcodes.EXTEND:
                            return `vm.jwClass.Type.toClass(${this.descendInput(node.class)}).extend(${this.descendInput(node.extension)})`;

                        case opcodes.GET:
                            return `vm.jwClass.getProp(${this.descendInput(node.name)}, ${this.descendInput(node.pointer)})`;

                        case opcodes.NEW:
                            return `(yield* vm.jwClass.Type.toClass(${this.descendInput(node.class)}).createInstance(thread, target))`;

                        case opcodes.INSTANCEOF:
                            return `vm.jwClass.instanceOf(${this.descendInput(node.pointer)}, vm.jwClass.Type.toClass(${this.descendInput(node.class)}))`;
                    }
                },
                command(block) {
                    const node = block.inputs;

                    switch (block.opcode) {
                        case opcodes.SET:
                            this.source += `vm.jwClass.setProp(${this.descendInput(node.name)}, ${this.descendInput(node.pointer)}, ${this.descendInput(node.value)});\n`;
                            return true;
                    }
                }
            }
        };
    }
}

module.exports = Extension;