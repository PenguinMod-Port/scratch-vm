const BlockType = require('../../../extension-support/block-type');
const BlockShape = require('../../../extension-support/block-shape');
const ArgumentType = require('../../../extension-support/argument-type');
const Cast = require('../../../util/cast');

const PromiseStatus = {
    REJECTED: -1,
    PENDING: 0,
    FUFILLED: 1
}

class PromiseType {
    customId = "jwPromise"

    constructor(promise = new Promise(_=>0)) {
        this.promise = new Promise((resolve, reject) => {
            this.resolve = resolve;
            this.reject = reject;

            promise.then(resolve, reject)
        });
        this.status = PromiseStatus.PENDING;
        this.result = null;
        
        this.promise.then(v => {
            this.status = PromiseStatus.FUFILLED;
            this.result = v;
        }, v => {
            this.status = PromiseStatus.REJECTED;
            this.result = v;
        })
    }

    static toPromise(x) {
        if (x instanceof PromiseType) return x;
        return new PromiseType();
    }

    static fromBlockID(blockID, thread) {
        let newThread = vm.runtime._pushThread(
            blockID,
            thread.target
        );

        const x = new jwPromise.Type(new Promise((resolve, reject) => {
            newThread._jwPromise = {resolve, reject};
        }));
        newThread._jwPromise.type = x;

        return x;
    }

    static fromThread(blockID, thread, func = function* () {}) {
        let newThread = vm.runtime._pushThread(
            blockID,
            thread.target
        );

        const x = new jwPromise.Type(new Promise((resolve, reject) => {
            newThread._jwPromise = {resolve, reject};
        }));
        newThread._jwPromise.type = x;

        newThread.generator = func(thread, newThread._jwPromise);

        return x;
    }

    toString() {
        switch (this.status) {
            case PromiseStatus.REJECTED: return 'rejected';
            case PromiseStatus.PENDING: return 'pending';
            case PromiseStatus.FUFILLED: return 'fufilled';
        }
    }

    await = function*() {
        switch (this.status) {
            case PromiseStatus.REJECTED: throw this.result;
            case PromiseStatus.FUFILLED: return this.result;
        }
        
        let completed = false;
        let error = false;
        let value = null;
        this.promise.then(v => {
            value = v;
            completed = true;
        }, v => {
            value = v;
            completed = true;
            error = true;
        });

        while (!completed) yield;
        if (error) throw value;
        return value;
    }
}

const jwPromise = {
    Type: PromiseType,
    Block: {
        blockType: BlockType.REPORTER,
        forceOutputType: "jwPromise",
        disableMonitor: true
    },
    Argument: {
        check: ["jwPromise"]
    }
}

class Extension {
    constructor() {
        vm.jwPromise = jwPromise;
        vm.runtime.registerSerializer(
            "jwPromise", 
            v => null, 
            v => new jwPromise.Type()
        );
        
        vm.extensionManager.extendCompiler("jwPromise", this.extendCompiler.bind(this));
    }

    getInfo() {
        return {
            id: "jwPromise",
            name: "Promise",
            color1: "#25d8c0",
            blocks: [
                {
                    opcode: "newPromise",
                    text: "new promise [THIS]",
                    arguments: {
                        THIS: {
                            fillIn: "thisPromise"
                        }
                    },
                    branches: [{}],
                    ...jwPromise.Block
                },
                {
                    opcode: "thisPromise",
                    text: "this promise",
                    hideFromPalette: true,
                    canDragDuplicate: true,
                    ...jwPromise.Block
                },
                {
                    opcode: "resolve",
                    text: "resolve [DATA]",
                    blockType: BlockType.COMMAND,
                    arguments: {
                        DATA: {
                            type: ArgumentType.STRING,
                            defaultValue: "foo"
                        }
                    }
                },
                {
                    opcode: "reject",
                    text: "reject [DATA]",
                    blockType: BlockType.COMMAND,
                    arguments: {
                        DATA: {
                            type: ArgumentType.STRING,
                            defaultValue: "foo"
                        }
                    }
                },
                "---",
                {
                    opcode: "await",
                    text: "await [PROMISE]",
                    blockType: BlockType.COMMAND,
                    arguments: {
                        PROMISE: jwPromise.Argument
                    }
                },
                {
                    opcode: "awaitR",
                    text: "await [PROMISE]",
                    blockType: BlockType.REPORTER,
                    allowDropAnywhere: true,
                    arguments: {
                        PROMISE: jwPromise.Argument
                    }
                },
                "---",
                {
                    opcode: "resolveExternal",
                    text: "resolve [PROMISE] with [DATA]",
                    blockType: BlockType.COMMAND,
                    arguments: {
                        PROMISE: jwPromise.Argument,
                        DATA: {
                            type: ArgumentType.STRING,
                            defaultValue: "foo"
                        }
                    }
                },
                {
                    opcode: "rejectExternal",
                    text: "reject [PROMISE] with [DATA]",
                    blockType: BlockType.COMMAND,
                    arguments: {
                        PROMISE: jwPromise.Argument,
                        DATA: {
                            type: ArgumentType.STRING,
                            defaultValue: "foo"
                        }
                    }
                },
            ]
        };
    }

    extendCompiler({IntermediateStackBlock, IntermediateInput, InputType, InputOpcode}) {
        const opcodes = {
            AWAIT: 'jwPromise.await',
            AWAIT_R: 'jwPromise.awaitR',
            NEW: 'jwPromise.new',
            REJECT: 'jwPromise.reject',
            RESOLVE: 'jwPromise.resolve'
        };

        return {
            ir: {
                reporter(block) {
                    switch (block.opcode) {
                        case 'jwPromise_newPromise':
                            return new IntermediateInput(opcodes.NEW, InputType.CUSTOM_TYPE, {
                                blockID: block.inputs.SUBSTACK?.block,
                                substack: this.descendSubstack(block, 'SUBSTACK')
                            });
                        case 'jwPromise_awaitR':
                            return new IntermediateInput(opcodes.AWAIT_R, InputType.ANY, {
                                promise: this.descendInputOfBlock(block, 'PROMISE')
                            }, true);
                    }
                },
                command(block) {
                    switch (block.opcode) {
                        case 'jwPromise_await':
                            return new IntermediateStackBlock(opcodes.AWAIT, {
                                promise: this.descendInputOfBlock(block, 'PROMISE')
                            }, true);
                        case 'jwPromise_reject':
                            return new IntermediateStackBlock(opcodes.REJECT, {
                                data: this.descendInputOfBlock(block, 'DATA')
                            })
                        case 'jwPromise_resolve':
                            return new IntermediateStackBlock(opcodes.RESOLVE, {
                                data: this.descendInputOfBlock(block, 'DATA')
                            })
                    }
                }
            },
            js: {
                reporter(block) {
                    const node = block.inputs;

                    switch (block.opcode) {
                        case opcodes.NEW: {
                            if (!node.blockID) {
                                return "(new vm.jwPromise.Type())";
                            } else {
                                let stack = this.descendStackInline(node.substack, {allowReturns: false, jwPromise: true});
                                return `vm.jwPromise.Type.fromThread("${node.blockID}", thread, function*(thread, _jwPromise) {\n${stack}\nruntime.sequencer.retireThread(thread);\n})`;
                            }
                        }
                        case opcodes.AWAIT_R:
                            return `(yield* (vm.jwPromise.Type.toPromise(${this.descendInput(node.promise)})).await())`;
                    }
                },
                command(block) {
                    const node = block.inputs;

                    switch (block.opcode) {
                        case opcodes.AWAIT:
                            this.source += `yield* (vm.jwPromise.toPromise(${this.descendInput(node.promise)}).await();\n`;
                            return true;
                        case opcodes.REJECT:
                            if (this.jwPromise) {
                                this.source += `_jwPromise.reject(${this.descendInput(node.data)});\n`;
                            } else {
                                this.source += `if (thread._jwPromise) thread._jwPromise.reject(${this.descendInput(node.data)});\n`;
                            }
                            return true;
                        case opcodes.RESOLVE:
                            if (this.jwPromise) {
                                this.source += `_jwPromise.resolve(${this.descendInput(node.data)});\n`;
                            } else {
                                this.source += `if (thread._jwPromise) thread._jwPromise.resolve(${this.descendInput(node.data)});\n`;
                            }
                            return true;
                    }
                }
            }
        }
    }

    thisPromise({}, util) {
        return util.thread._jwPromise ? util.thread._jwPromise.type : new jwPromise.Type();
    }

    resolveExternal({DATA, PROMISE}) {
        PROMISE = jwPromise.Type.toPromise(PROMISE);
        PROMISE.resolve(DATA);
    }

    rejectExternal({DATA, PROMISE}) {
        PROMISE = jwPromise.Type.toPromise(PROMISE);
        PROMISE.reject(DATA);
    }
}

module.exports = Extension