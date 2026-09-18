// Most of the blocks here are from More Motion by NexusKitten:
// https://scratch.mit.edu/users/NamelessCat/
// https://github.com/NexusKitten

const BlockType = require('../../../extension-support/block-type');
const ArgumentType = require('../../../extension-support/argument-type');
const TargetType = require('../../../extension-support/target-type');
const Clone = require('../../../util/clone');
const Cast = require('../../../util/cast');

const template = {
    extensions: ["colours_sensing"]
};

/**
 * Class of idk
 * @constructor
 */
class pmSensingExpansion {
    constructor(runtime) {
        /**
         * The runtime instantiating this block package.
         * @type {runtime}
         */
        this.runtime = runtime;

        this.lastUpdate = Date.now();

        this.canGetLoudness = false;
        this.loudnessArray = [0];

        this.scrollDistance = 0;

        this.lastValues = {};
    }

    /**
     * @returns {object} metadata for extension
     */
    getInfo() {
        return {
            id: 'pmSensingExpansion',
            name: 'Sensing Expansion',
            color: '#5CB1D6',
            blocks: [
                {
                    opcode: 'pickColor',
                    text: 'grab color at x: [X] y: [Y]',
                    blockType: BlockType.REPORTER,
                    arguments: {
                        X: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0
                        },
                        Y: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0
                        }
                    },
                    ...template
                },
                {
                    blockType: BlockType.XML,
                    xml: `
                    <block type="sensing_getspritewithattrib">
                        <value name="var">
                            <shadow type="text">
                                <field name="TEXT">my variable</field>
                            </shadow>
                        </value>
                        <value name="val">
                            <shadow type="text">
                                <field name="TEXT">0</field>
                            </shadow>
                        </value>
                    </block>
                    `
                },
                {
                    opcode: 'spriteName',
                    text: 'sprite name',
                    blockType: BlockType.REPORTER,
                    disableMonitor: true,
                    ...template
                },
                "---",
                {
                    opcode: 'setUsername',
                    text: 'set username to [NAME]',
                    blockType: BlockType.COMMAND,
                    arguments: {
                        NAME: {
                            type: ArgumentType.STRING,
                            defaultValue: "Penguin"
                        }
                    },
                    ...template
                },
                {
                    opcode: 'packaged',
                    text: 'project packaged?',
                    blockType: BlockType.BOOLEAN,
                    disableMonitor: true,
                    ...template
                },
                {
                    opcode: 'framed',
                    text: 'project in iframe?',
                    blockType: BlockType.BOOLEAN,
                    disableMonitor: true,
                    ...template
                },
                "---",
                {
                    opcode: 'currentMillisecond',
                    text: 'current millisecond',
                    blockType: BlockType.REPORTER,
                    ...template
                },
                {
                    opcode: 'deltaTime',
                    text: 'delta time',
                    blockType: BlockType.REPORTER,
                    ...template
                },
                "---",
                {
                    blockType: BlockType.XML,
                    xml: `
                    <block type="sensing_getoperatingsystem" />
                    <block type="sensing_getbrowser" />
                    <block type="sensing_geturl" />
                    `
                },
                "---",
                {
                    opcode: 'setUrlEnd',
                    text: 'set url path to [PATH]',
                    blockType: BlockType.COMMAND,
                    arguments: {
                        PATH: {
                            type: ArgumentType.STRING,
                            defaultValue: "?parameter=10#you-can-change-these-without-refreshing"
                        }
                    },
                    ...template
                },
                {
                    opcode: 'urlOptionsOf',
                    text: '[OPTIONS] of url [URL]',
                    blockType: BlockType.REPORTER,
                    disableMonitor: true,
                    arguments: {
                        OPTIONS: {
                            type: ArgumentType.STRING,
                            menu: "urlSections"
                        },
                        URL: {
                            type: ArgumentType.STRING,
                            defaultValue: "https://home.penguinmod.com:3000/some/random/page?param=10#20"
                        }
                    },
                    ...template
                },
                {
                    opcode: 'queryParamOfUrl',
                    text: 'query parameter [PARAM] of url [URL]',
                    blockType: BlockType.REPORTER,
                    disableMonitor: true,
                    arguments: {
                        PARAM: {
                            type: ArgumentType.STRING,
                            defaultValue: "param"
                        },
                        URL: {
                            type: ArgumentType.STRING,
                            defaultValue: "https://penguinmod.com/?param=10"
                        }
                    },
                    ...template
                },
                {
                    opcode: 'urlOptions',
                    text: 'url [OPTIONS]',
                    blockType: BlockType.REPORTER,
                    disableMonitor: true,
                    arguments: {
                        OPTIONS: {
                            type: ArgumentType.STRING,
                            menu: "urlSections"
                        }
                    },
                    ...template
                },
                "---",
                {
                    opcode: 'browserLanguage',
                    text: 'preferred language',
                    blockType: BlockType.REPORTER,
                    disableMonitor: true,
                    ...template
                },
                "---",
                {
                    opcode: 'batteryPercentage',
                    text: 'battery percentage',
                    blockType: BlockType.REPORTER,
                    disableMonitor: true,
                    ...template
                },
                {
                    opcode: 'batteryCharging',
                    text: 'is device charging?',
                    blockType: BlockType.BOOLEAN,
                    disableMonitor: true,
                    ...template
                },
                "---",
                {
                    opcode: 'vibrateDevice',
                    text: 'vibrate',
                    blockType: BlockType.COMMAND,
                    ...template
                },

                // blocks that probably deserve to be somewhere else
                {
                    opcode: 'maxSpriteLayers',
                    text: 'max sprite layers',
                    blockType: BlockType.REPORTER,
                    hideFromPalette: true,
                    ...template
                },
            ],
            menus: {
                urlSections: {
                    acceptReporters: true,
                    items: [
                        "protocol",
                        "host",
                        "hostname",
                        "port",
                        "pathname",
                        "search",
                        "hash",
                        "origin",
                        "subdomain",
                        "path"
                    ]
                }
            }
        };
    }
    
    /**
     * @param {string} option 
     * @param {URL} urlObject 
     * @returns {string}
     */
    _urlOptionFromObject(option, urlObject) {
        const validOptions = [
            "protocol",
            "host",
            "hostname",
            "port",
            "pathname",
            "search",
            "hash",
            "origin",
            "subdomain",
            "path"
        ];
        if (!validOptions.includes(option)) return '';

        switch (option) {
            case 'subdomain': {
                const origin = urlObject.origin;
                if (origin.split('.').length <= 2) return '';
                const splitSubdomain = origin.split('.')[0];
                const subdomain = splitSubdomain.split('//')[1];
                if (!subdomain) return '';
                return subdomain.replace(/\./gmi, '');
            }
            case 'path': {
                const origin = urlObject.origin;
                if (origin.endsWith('/')) {
                    return urlObject.href.replace(origin, '');
                }
                return urlObject.href.replace(origin + '/', '');
            }
        }

        return Cast.toString(urlObject[option]);
    }

    /**
     * @param {string} url
     * @returns {URL?}
     */
    _validateUrl(url) {
        try {
            new URL(url);
        } catch {
            return null;
        }
    }

    pickColor(args) {
        const renderer = this.runtime.renderer;
        const scratchX = Cast.toNumber(args.X);
        const scratchY = Cast.toNumber(args.Y);
        const clientX = Math.round((((this.runtime.stageWidth / 2) + scratchX) / this.runtime.stageWidth) * renderer._gl.canvas.clientWidth);
        const clientY = Math.round((((this.runtime.stageHeight / 2) - scratchY) / this.runtime.stageHeight) * renderer._gl.canvas.clientHeight);
        const colorInfo = renderer.extractColor(clientX, clientY, 20);
        return Color.rgbToHex(colorInfo.color);
    }

    spriteName(_, util) {
        return util.target.getName();
    }

    setUsername(args) {
        const username = Cast.toString(args.NAME);
        vm.postIOData('userData', {
            username: username,
            loggedIn: false,
        });
    }

    packaged() {
        return this.runtime.isPackaged;
    }

    framed() {
        if (!window.parent) return false;
        return window.parent !== window;
    }

    currentMillisecond() {
        return Date.now() % 1000;
    }

    deltaTime() {
        let now = Date.now();
        let dt = now - this.lastUpdate;
        this.lastUpdate = now;
        return dt;
    }

    setUrlEnd(args) {
        if (!('history' in window)) return;
        const path = Cast.toString(args.PATH);
        const target = location.origin.endsWith('/') ? location.origin + path : location.origin + '/' + path;
        history.replaceState('', '', target);
    }

    urlOptionsOf(args) {
        const option = Cast.toString(args.OPTIONS).toLowerCase();
        const url = this._validateUrl(Cast.toString(args.URL));
        if (!url) return '';
        return this._urlOptionFromObject(option, url);
    }

    queryParamOfUrl(args) {
        if (!('URLSearchParams' in window)) return '';
        const url = this._validateUrl(Cast.toString(args.URL));
        if (!url) return '';
        const queryParams = new URLSearchParams(url.search);
        return queryParams.get(Cast.toString(args.PARAM));
    }
    
    urlOptions(args) {
        if (!('location' in window)) return ''; // idk how this would fail but funny
        const option = Cast.toString(args.OPTIONS).toLowerCase();
        return this._urlOptionFromObject(option, location);
    }

    browserLanguage() {
        if (!('language' in navigator)) return 'Unknown';
        const lang = Cast.toString(navigator.language);
        const check = lang.split("-")[0].toLowerCase();

        switch (check) {
            case 'en':
                return 'English';
            case 'es':
                return 'Spanish';
            case 'fr':
                return 'French';
            case 'it':
                return 'Italian';
            case 'pt':
                return 'Portuguese';
            case 'de':
                return 'German';
            case 'ru':
                return 'Russian';
            case 'ar':
                return 'Arabic';
            case 'zh':
                return 'Chinese (Mandarin)';
            case 'he':
                return 'Hebrew';
            case 'ja':
                return 'Japanese';
            case 'ko':
                return 'Korean';
            case 'sw':
                return 'Swahili';
            case 'sq':
                return 'Albanian';
            case 'hy':
                return 'Armenian';
            case 'eu':
                return 'Basque';
            case 'nl':
                return 'Dutch';
            case 'ka':
                return 'Georgian';
            case 'gd':
                return 'Scottish Gaelic';
            case 'ga':
                return 'Modern Irish';
            case 'fa':
                return 'Persian (Farsi)';
            case 'bo':
                return 'Tibetan';
            case 'cy':
                return 'Welsh';
            case 'el':
                return 'Modern Greek';
            case 'grc':
                return 'Ancient Greek';
            case 'la':
                return 'Latin';
            case 'ang':
                return 'Anglo-Saxon';
            case 'enm':
                return 'Middle English';
            default:
                return 'Unknown';
        }
    }

    batteryPercentage() {
        if ('getBattery' in navigator) {
            return new Promise((resolve) => {
                navigator.getBattery().then(batteryManager => {
                    resolve(batteryManager.level * 100);
                }).catch(() => {
                    return 100;
                });
            });
        } else {
            return 100;
        }
    }

    batteryCharging() {
        if ('getBattery' in navigator) {
            return new Promise((resolve) => {
                navigator.getBattery().then(batteryManager => {
                    resolve(batteryManager.charging);
                }).catch(() => {
                    return true;
                });
            });
        } else {
            return true;
        }
    }

    vibrateDevice() {
        if ('vibrate' in navigator) {
            navigator.vibrate(250);
        }
    }

    maxSpriteLayers() {
        return this.runtime.renderer._drawList.length - 1;
    }
}

module.exports = pmSensingExpansion;
