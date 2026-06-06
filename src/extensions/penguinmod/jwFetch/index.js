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
        vm.extensionManager.addExtensionDependency("jwFetch", "dogeiscutObject", () => dogeiscutObject = vm.dogeiscutObject);

        vm.extensionManager.extendCompiler("jwFetch", this.extendCompiler.bind(this));
    }

    getInfo() {
        return {
            id: "jwFetch",
            name: "Fetch",
            blocks: [
                {
                    opcode: "fetchBody",
                    text: "[METHOD] [URL] with headers [HEADERS] and body [BODY]",
                    dualBlock: true,
                    arguments: {
                        METHOD: {
                            menu: "methodsBody",
                            defaultValue: "GET"
                        },
                        URL: {
                            type: ArgumentType.STRING,
                            defaultValue: "https://projects.penguinmod.com/api/v1"
                        },
                        HEADERS: dogeiscutObject.Argument,
                        BODY: {
                            type: ArgumentType.STRING
                        }
                    },
                    ...dogeiscutObject.Block
                },
                {
                    opcode: "fetch",
                    text: "[METHOD] [URL] with headers [HEADERS]",
                    dualBlock: true,
                    arguments: {
                        METHOD: {
                            menu: "methods",
                            defaultValue: "POST"
                        },
                        URL: {
                            type: ArgumentType.STRING,
                            defaultValue: "https://projects.penguinmod.com/api/v1"
                        },
                        HEADERS: dogeiscutObject.Argument
                    },
                    ...dogeiscutObject.Block
                }
            ],
            menus: {
                methods: {
                    acceptReporters: true,
                    items: [
                        "GET",
                        "POST",
                        "OPTIONS",
                        "TRACE",
                        "HEAD",
                        "PUT",
                        "DELETE",
                        // "CONNECT", i dont know if this actually works
                        "PATCH"
                    ]
                },
                methodsBody: {
                    acceptReporters: true,
                    items: [
                        "GET",
                        "OPTIONS",
                        "PUT",
                        "PATCH"
                    ]
                }
            }
        };
    }

    extendCompiler({IntermediateStackBlock, IntermediateInput, InputType, InputOpcode}) {
        const opcodes = {
            FETCH: 'jwFetch.fetch'
        };

        return {
            ir: {
                reporter(block) {
                    switch (block.opcode) {
                        case 'jwFetch_fetch':
                        case 'jwFetch_fetchBody':
                            return new IntermediateInput(opcodes.FETCH, InputType.CUSTOM_TYPE, {
                                method: this.descendInputOfBlock(block, 'METHOD').toType(InputType.STRING),
                                url: this.descendInputOfBlock(block, 'URL').toType(InputType.STRING),
                                headers: this.descendInputOfBlock(block, 'HEADERS'),
                                body: block.opcode === 'jwFetch_fetchBody' ? this.descendInputOfBlock(block, 'BODY') : this.createConstantInput(null)
                            }, true);
                    }
                },
                command(block) {
                    switch (block.opcode) {
                        case 'jwFetch_fetch':
                        case 'jwFetch_fetchBody':
                            return new IntermediateStackBlock(opcodes.FETCH, {
                                method: this.descendInputOfBlock(block, 'METHOD').toType(InputType.STRING),
                                url: this.descendInputOfBlock(block, 'URL').toType(InputType.STRING),
                                headers: this.descendInputOfBlock(block, 'HEADERS'),
                                body: block.opcode === 'jwFetch_fetchBody' ? this.descendInputOfBlock(block, 'BODY').toType(InputType.STRING) : this.createConstantInput(null)
                            }, true);
                    }
                }
            },
            js: {
                reporter(block) {
                    const node = block.inputs;

                    switch (block.opcode) {
                        case opcodes.FETCH:
                            return `(yield* vm.runtime.ext_jwFetch._fetch(thread, ${this.descendInput(node.method)}, ${this.descendInput(node.url)}, vm.dogeiscutObject.Type.toObject(${this.descendInput(node.headers)}), ${this.descendInput(node.body)}))`;
                    }
                },
                command(block) {
                    const node = block.inputs;

                    switch (block.opcode) {
                        case opcodes.FETCH:
                            this.source += `yield* vm.runtime.ext_jwFetch._fetch(thread, ${this.descendInput(node.method)}, ${this.descendInput(node.url)}, vm.dogeiscutObject.Type.toObject(${this.descendInput(node.headers)}), ${this.descendInput(node.body)}, true);\n`;
                            return true;
                    }
                }
            }
        };
    }

    _waitPromise = function*(thread, promise) {
        let returnValue;
        let isError = false;
        thread.status = 1;
        promise
            .then(value => {
                thread.status = 0;
                returnValue = value;
            }, error => {
                thread.status = 0;
                returnValue = error;
                isError = true;
            });
        yield;
        if (isError) throw returnValue;
        return returnValue;
    }

    _fetch = function*(thread, method, url, headers, body, strict = false) {
        return yield* this._waitPromise(thread, (async function() {
            const response = await fetch(url, {
                method: method.toUpperCase(),
                headers: headers.toJSON(),
                body: body === '' ? null : body
            });
            if (strict) {
                if (!response.ok) {
                    console.log(response)
                    throw `Request ${url} returned status ${response.status}`;
                }
            }

            return vm.dogeiscutObject.Type.toObject({
                body: await response.text(),
                headers: vm.dogeiscutObject.Type.toObject(Object.fromEntries(response.headers.entries())),
                ok: response.ok,
                redirected: response.redirected,
                status: response.status,
                url: response.url
            });
        })());
    }
}

module.exports = Extension;