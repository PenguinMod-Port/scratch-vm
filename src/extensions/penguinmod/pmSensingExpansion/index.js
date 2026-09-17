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
            color: '#4CBFE6',
            blocks: [
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
            ]
        };
    }

    setUrlEnd(args) {
        if (!('history' in window)) return;
        const path = Cast.toString(args.PATH);
        const target = location.origin.endsWith('/') ? location.origin + path : location.origin + '/' + path;
        history.replaceState('', '', target);
    }

    urlOptionsOf(args) {
        if (!('location' in window)) return ''; // idk how this would fail but funny
        const option = Cast.toString(args.OPTIONS).toLowerCase();
        const url = Cast.toString(args.URL);
        if (!this.validateUrl(url)) return '';
        return this.urlOptionFromObject(option, new URL(url));
    }

    queryParamOfUrl(args) {
        if (!('URLSearchParams' in window)) return '';
        const url = Cast.toString(args.URL);
        if (!this.validateUrl(url)) return '';
        const urlObject = new URL(url);
        const queryParams = new URLSearchParams(urlObject.search);
        return queryParams.get(Cast.toString(args.PARAM));
    }
    
    urlOptions(args) {
        if (!('location' in window)) return ''; // idk how this would fail but funny
        const option = Cast.toString(args.OPTIONS).toLowerCase();
        return this.urlOptionFromObject(option, location);
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
}

module.exports = pmSensingExpansion;
