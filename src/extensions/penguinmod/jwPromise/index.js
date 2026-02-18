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

    constructor(promise = new Promise(resolve=>resolve())) {
        this.promise = promise;
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

        return new jwPromise.Type(new Promise((resolve, reject) => {
            newThread._jwPromise = {resolve, reject};
        }));
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
        if (!vm.jwPromise) {
            const oldPushThread = Object.getPrototypeOf(vm.runtime)._pushThread;
            Object.getPrototypeOf(vm.runtime)._pushThread = function(id, target, opts = {}) {
                let thread = oldPushThread.call(this, id, target, opts);
                if (opts.fromThread) thread._jwPromise = opts.fromThread._jwPromise;
                return thread;
            };
        }

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
                    text: "new promise",
                    branches: [{}],
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
                }
            ]
        };
    }

    extendCompiler({IntermediateStackBlock, IntermediateInput, InputType, InputOpcode}) {
        const opcodes = {
            NEW: 'jwPromise.new',
            AWAIT: 'jwPromise.await',
            AWAIT_R: 'jwPromise.awaitR'
        };

        return {
            ir: {
                reporter(block) {
                    switch (block.opcode) {
                        case 'jwPromise_newPromise':
                            return new IntermediateInput(opcodes.NEW, InputType.CUSTOM_TYPE, {
                                blockID: block.inputs.SUBSTACK?.block
                            });
                        case 'jwPromise_awaitR':
                            return new IntermediateInput(opcodes.AWAIT_R, InputType.ANY, {
                                promise: this.descendInputOfBlock(block, 'PROMISE')
                            }, true)
                    }
                },
                command(block) {
                    switch (block.opcode) {
                        case 'jwPromise_await':
                            return new IntermediateStackBlock(opcodes.AWAIT, {
                                promise: this.descendInputOfBlock(block, 'PROMISE')
                            }, true)
                    }
                }
            },
            js: {
                reporter(block) {
                    const node = block.inputs;

                    switch (block.opcode) {
                        case opcodes.NEW:
                            if (!node.blockID) {
                                return "(new vm.jwPromise.Type())";
                            } else {
                                return `vm.jwPromise.Type.fromBlockID("${node.blockID}", thread)`;
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
                    }
                }
            }
        }
    }

    resolve({DATA}, util) {
        if (util.thread._jwPromise) util.thread._jwPromise.resolve(DATA);
    }

    reject({DATA}, util) {
        if (util.thread._jwPromise) util.thread._jwPromise.reject(DATA);
    }
}

module.exports = Extension