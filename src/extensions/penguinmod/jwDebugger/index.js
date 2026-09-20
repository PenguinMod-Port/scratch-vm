const BlockType = require('../../../extension-support/block-type')
const BlockShape = require('../../../extension-support/block-shape')
const ArgumentType = require('../../../extension-support/argument-type')
const Cast = require('../../../util/cast')

class Extension {
    constructor() {
        this.tab = vm.runtime.tabManager.register("jwDebugger", "Debugger");
        this.tab.setDOM(document.createElement('div'));
    }

    getInfo() {
        return {
            id: "jwDebugger",
            name: "Debugger",
            color: "#29BEB8",
            blocks: [
                {
                    opcode: "log",
                    text: "[LOG] [DATA]",
                    blockType: BlockType.COMMAND,
                    arguments: {
                        LOG: {
                            menu: "logOption",
                            defaultValue: "log"
                        },
                        DATA: {
                            type: ArgumentType.STRING
                        }
                    }
                },
                {
                    opcode: "clear",
                    text: "clear logs",
                    blockType: BlockType.COMMAND
                }
            ],
            menus: {
                logOption: {
                    acceptReporters: false,
                    items: [
                        "debug",
                        "log",
                        "warn",
                        "error"
                    ]
                }
            }
        };
    }

    log({LOG, DATA}) {
        const span = document.createElement('span');
        span.innerText = String(DATA);
        this.tab.element.append(span);
    }

    clear() {
        this.tab.element.innerHTML = '';
    }
}

module.exports = Extension;