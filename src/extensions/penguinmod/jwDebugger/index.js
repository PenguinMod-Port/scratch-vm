const BlockType = require('../../../extension-support/block-type')
const BlockShape = require('../../../extension-support/block-shape')
const ArgumentType = require('../../../extension-support/argument-type')
const Cast = require('../../../util/cast')

const createElement = (type, properties = {}, parent) => {
    const el = document.createElement(type);
    Object.entries(properties).forEach(([k, v]) => el[k] = v);
    if (parent) parent.appendChild(el);
    return el;
}

const style = `
.jwDebugger-root {
    display: flex;
    flex-direction: column;
    padding: 1em;
    height: 100%;
}

.jwDebugger-list {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    border: 1px solid var(--ui-black-transparent);
    border-radius: 8px;
    overflow-y: scroll;
}

.jwDebugger-list > * {
    padding: 0.5em;
    background-color: var(--ui-primary);
}
.jwDebugger-list > *:nth-child(even) {
    background-color: var(--ui-secondary);
}

.jwDebugger-timestamp {
    font-size: 0.75em;
    opacity: 0.5;
    padding-right: 0.5em;
}
`

class Extension {
    constructor() {
        this.tab = vm.runtime.tabManager.register("jwDebugger", "Debugger");
        this.rootElement = createElement('div', {className: "jwDebugger-root"});
        this.tab.setDOM(this.rootElement);
        createElement('style', {innerHTML: style}, document.head);

        this.listElement = createElement('div', {className: "jwDebugger-list"}, this.rootElement);
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
        const now = new Date(Date.now())
        const timestamp = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}.${String(now.getMilliseconds()).padStart(3, "0")}`

        let log = createElement('div', {
            className: `jwDebugger-${LOG}`
        }, this.listElement);
        createElement('span', {
            className: 'jwDebugger-timestamp',
            innerText: timestamp
        }, log);
        createElement('span', {
            innerText: String(DATA)
        }, log);
    }

    clear() {
        this.listElement.innerHTML = '';
    }
}

module.exports = Extension;