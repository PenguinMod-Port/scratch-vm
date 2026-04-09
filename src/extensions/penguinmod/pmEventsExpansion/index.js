const BlockType = require('../../../extension-support/block-type');
const ArgumentType = require('../../../extension-support/argument-type');
const Cast = require('../../../util/cast');

const template = {
    extensions: ["colours_event"]
}

class Extension {
    constructor() {
        // every other frame block
        this._otherFrame = false;
        vm.runtime.on('RUNTIME_STEP_START', () => {
            this._otherFrame = !this._otherFrame;
            if (this._otherFrame) vm.runtime.startHats('pmEventsExpansion_everyOtherFrame'); 
        });
    }

    getInfo() {
        return {
            id: "pmEventsExpansion",
            name: 'Events Expansion',
            color1: '#ffbf00',
            color2: '#e6ac00',
            color3: '#cc9900',
            blocks: [
                {
                    opcode: 'everyOtherFrame',
                    text: 'every other frame',
                    blockType: BlockType.EVENT,
                    isEdgeActivated: false,
                    ...template
                },
                {
                    opcode: 'neverr',
                    text: 'never',
                    blockType: BlockType.EVENT,
                    isEdgeActivated: false,
                    ...template
                },
                "---",
                {
                    opcode: 'whenSpriteClicked',
                    text: 'when [SPRITE] clicked',
                    blockType: BlockType.EVENT,
                    isEdgeActivated: false,
                    arguments: {
                        SPRITE: {
                            type: ArgumentType.STRING,
                            menu: "spriteName"
                        }
                    }
                },
                "---",
                {
                    opcode: 'sendWithData',
                    text: 'broadcast [BROADCAST] with data [DATA]',
                    blockType: BlockType.COMMAND,
                    arguments: {
                        BROADCAST: {
                            fillInGlobal: "event_broadcast_menu"
                        },
                        DATA: {
                            type: ArgumentType.STRING,
                            defaultValue: "abc"
                        }
                    }
                },
                {
                    opcode: 'recievedDataReporter',
                    text: 'received data',
                    blockType: BlockType.REPORTER,
                    allowDropAnywhere: true,
                    disableMonitor: true
                },
            ],
            menus: {
                spriteName: "_spriteName",
                broadcastMenu: "_broadcastMenu"
            }
        };
    }

    // menus
    
    _spriteName() {
        const emptyMenu = [{ text: '', value: '' }];
        const menu = [];
        for (const target of vm.runtime.targets) {
            if (!target.isOriginal) continue;
            if (target.isStage) {
                menu.push({
                    text: "stage",
                    value: "_stage_"
                });
                continue;
            }
            menu.push({
                text: target.sprite.name,
                value: target.sprite.name
            });
        }
        if (menu.length <= 0) return emptyMenu;
        return menu;
    }

    _broadcastMenu() {
        const emptyMenu = [{ text: '', value: '' }];
        const menu = [];
        for (const target of vm.runtime.targets) {
            if (!target.isOriginal) continue;
            if (target.isStage) {
                menu.push({
                    text: "stage",
                    value: target.id
                });
                continue;
            }
            menu.push({
                text: target.sprite.name,
                value: target.id
            });
        }
        if (menu.length <= 0) return emptyMenu;
        return menu;
    }

    // blocks

    sendWithData(args, util) {
        const broadcast = Cast.toString(args.BROADCAST);
        const data = Cast.toString(args.DATA);
        const broadcastVar = util.runtime.getTargetForStage().lookupBroadcastMsg("", broadcast);
        if (broadcastVar) broadcastVar.isSent = true;

        const threads = util.startHats("event_whenbroadcastreceived", {
            BROADCAST_OPTION: broadcast
        });
        for (const thread of threads) {
            thread._pmEventsExpansionBroadcastData = data;
        }
    }
    recievedDataReporter(_, util) {
        return util.thread._pmEventsExpansionBroadcastData ?? null;
    }
}

module.exports = Extension