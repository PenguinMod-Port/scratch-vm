const BlockType = require('../../../extension-support/block-type');
const ArgumentType = require('../../../extension-support/argument-type');
const Cast = require('../../../util/cast');

const MathJS = require('./mathjs');

const template = {
    extensions: ["colours_operators"]
};

function generateJoin(inputs) {
    return {
        opcode: `join${inputs}`,
        func: 'joinMultiple',
        text: `join${Array(inputs).fill().map((_, i) => ` [STRING${i + 1}]`).join("")}`,
        blockType: BlockType.REPORTER,
        arguments: Object.fromEntries(Array(inputs).fill().map((_, i) => [`STRING${i + 1}`, {
            type: ArgumentType.STRING
        }])),
        hideFromPalette: true,
        extensions: ["colours_operators_strings"]
    };
}

class Extension {
    getInfo() {
        return {
            id: "pmOperatorsExpansion",
            name: "Operators Expansion",
            color: "#59c059",
            blocks: [
                //legacy joins
                generateJoin(4),
                generateJoin(5),
                generateJoin(6),
                generateJoin(7),
                generateJoin(8),
                generateJoin(9),

                {
                    opcode: "typeOfValue",
                    text: "type of [INPUT]",
                    blockType: BlockType.REPORTER,
                    arguments: {
                        INPUT: {
                            type: ArgumentType.STRING,
                            defaultValue: "foo"
                        }
                    },
                    ...template
                },
                "---",
                {
                    opcode: "orIfFalsey",
                    text: "[ONE] || [TWO]",
                    blockType: BlockType.REPORTER,
                    allowDropAnywhere: true,
                    arguments: {
                        ONE: {
                            type: ArgumentType.STRING,
                            defaultValue: "a"
                        },
                        TWO: {
                            type: ArgumentType.STRING,
                            defaultValue: "b"
                        }
                    },
                    ...template
                },
                {
                    opcode: "nullishCoalescing",
                    text: "[ONE] ?? [TWO]",
                    blockType: BlockType.REPORTER,
                    allowDropAnywhere: true,
                    arguments: {
                        ONE: {
                            type: ArgumentType.STRING,
                            defaultValue: "a"
                        },
                        TWO: {
                            type: ArgumentType.STRING,
                            defaultValue: "b"
                        }
                    },
                    ...template
                },
                {
                    opcode: "ifIsTruthy",
                    text: "if [ONE] is true then [TWO]",
                    blockType: BlockType.REPORTER,
                    allowDropAnywhere: true,
                    arguments: {
                        ONE: {
                            type: ArgumentType.BOOLEAN
                        },
                        TWO: {
                            type: ArgumentType.STRING,
                        }
                    },
                    hideFromPalette: true,
                    ...template
                },
                "---",
                {
                    opcode: "binnaryAnd",
                    text: "[num1] and [num2]",
                    blockType: BlockType.REPORTER,
                    arguments: {
                        num1: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 32
                        },
                        num2: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 5
                        }
                    },
                    ...template
                },
                {
                    opcode: "binnaryOr",
                    text: "[num1] or [num2]",
                    blockType: BlockType.REPORTER,
                    arguments: {
                        num1: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 7
                        },
                        num2: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 8
                        }
                    },
                    ...template
                },
                {
                    opcode: "binnaryXor",
                    text: "[num1] xor [num2]",
                    blockType: BlockType.REPORTER,
                    arguments: {
                        num1: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 7
                        },
                        num2: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 2
                        }
                    },
                    ...template
                },
                {
                    opcode: "shiftLeft",
                    text: "[num1] << [num2]",
                    blockType: BlockType.REPORTER,
                    arguments: {
                        num1: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 1
                        },
                        num2: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 5
                        }
                    },
                    ...template
                },
                {
                    opcode: "shiftRight",
                    text: "[num1] >> [num2]",
                    blockType: BlockType.REPORTER,
                    arguments: {
                        num1: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 32
                        },
                        num2: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 5
                        }
                    },
                    ...template
                },
                {
                    opcode: "binnaryNot",
                    text: "~ [num1]",
                    blockType: BlockType.REPORTER,
                    arguments: {
                        num1: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 2
                        }
                    },
                    ...template
                },
                "---",
                {
                    blockType: BlockType.XML,
                    xml: '<block type="operator_randomBoolean" />'
                },
                "---",
                {
                    opcode: "isNumberMultipleOf",
                    text: "is [NUM] multiple of [MULTIPLE]?",
                    blockType: BlockType.BOOLEAN,
                    arguments: {
                        NUM: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 20
                        },
                        MULTIPLE: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 10
                        }
                    },
                    ...template
                },
                {
                    opcode: "isInteger",
                    text: "is [NUM] an integer?",
                    blockType: BlockType.BOOLEAN,
                    arguments: {
                        NUM: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0.5
                        }
                    },
                    ...template
                },
                {
                    opcode: "isPrime",
                    text: "is [NUM] a prime number?",
                    blockType: BlockType.BOOLEAN,
                    arguments: {
                        NUM: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 13
                        }
                    },
                    ...template
                },
                {
                    opcode: "isEven",
                    text: "is [NUM] even?",
                    blockType: BlockType.BOOLEAN,
                    arguments: {
                        NUM: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 4
                        }
                    },
                    ...template
                },
                {
                    opcode: "betweenNumbers",
                    text: "is [NUM] between [MIN] and [MAX]?",
                    blockType: BlockType.BOOLEAN,
                    arguments: {
                        NUM: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 5
                        },
                        MIN: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0
                        },
                        MAX: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 10
                        }
                    },
                    hideFromPalette: true, // expandable compare does this
                    ...template
                },
                "---",
                {
                    opcode: "evaluateMath",
                    text: "answer to [EQUATION]",
                    blockType: BlockType.REPORTER,
                    arguments: {
                        EQUATION: {
                            type: ArgumentType.STRING,
                            defaultValue: "5 * 2"
                        }
                    },
                    ...template
                },
                {
                    opcode: "partOfRatio",
                    text: "[PART] part of ratio [RATIO]",
                    blockType: BlockType.REPORTER,
                    arguments: {
                        PART: {
                            type: ArgumentType.STRING,
                            menu: "part"
                        },
                        RATIO: {
                            type: ArgumentType.STRING,
                            defaultValue: "1:2"
                        }
                    },
                    ...template
                },
                {
                    opcode: "simplifyRatio",
                    text: "simplify ratio [RATIO]",
                    blockType: BlockType.REPORTER,
                    arguments: {
                        RATIO: {
                            type: ArgumentType.STRING,
                            defaultValue: "1:2"
                        }
                    },
                    ...template
                },
                {
                    opcode: "pi",
                    text: "π",
                    blockType: BlockType.REPORTER,
                    hideFromPalette: true,
                    ...template
                },
                {
                    opcode: "euler",
                    text: "e",
                    blockType: BlockType.REPORTER,
                    hideFromPalette: true,
                    ...template
                },
                {
                    opcode: "infinity",
                    text: "∞",
                    blockType: BlockType.REPORTER,
                    hideFromPalette: true,
                    ...template
                },
                "---",
                {
                    opcode: "truncateNumber",
                    text: "truncate number [NUM]",
                    blockType: BlockType.REPORTER,
                    arguments: {
                        NUM: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 2.5
                        }
                    },
                    ...template
                },
                {
                    opcode: "atan2",
                    text: "atan2 of x [X] y [Y]",
                    blockType: BlockType.REPORTER,
                    arguments: {
                        X: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 45
                        },
                        Y: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 90
                        },
                    },
                    ...template
                },
                {
                    opcode: "exactlyEqual",
                    text: "[ONE] exactly equals [TWO]?",
                    blockType: BlockType.BOOLEAN,
                    arguments: {
                        ONE: {
                            type: ArgumentType.STRING,
                            defaultValue: "a"
                        },
                        TWO: {
                            type: ArgumentType.STRING,
                            defaultValue: "b"
                        }
                    },
                    hideFromPalette: true,
                    ...template
                },
                "---",
                {
                    opcode: "speedToPitch",
                    text: "speed [SPEED] to pitch",
                    blockType: BlockType.REPORTER,
                    arguments: {
                        SPEED: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 2
                        },
                    },
                    ...template
                },
                {
                    opcode: "pitchToSpeed",
                    text: "pitch [PITCH] to speed",
                    blockType: BlockType.REPORTER,
                    arguments: {
                        PITCH: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 120
                        },
                    },
                    ...template
                }
            ],
            menus: {
                part: {
                    acceptReporters: true,
                    items: [
                        { text: "first", value: "first" },
                        { text: "last", value: "last" },
                    ]
                }
            }
        };
    }

    joinMultiple(args) {
        return Object.values(args).map(Cast.toString).join("");
    }

    typeOfValue({INPUT}) {
        if (INPUT === null || INPUT === undefined) return 'null';
        if (typeof INPUT === 'boolean') return 'boolean';
        if (typeof INPUT === 'number') return 'number';
        if (typeof INPUT === 'string') return 'string';
        if (INPUT instanceof Array) return 'array';
        if (typeof INPUT === 'object') {
            const prototype = Object.getPrototypeOf(INPUT);
            if (prototype === null || prototype === Object.prototype) return 'object';
            else if (INPUT.customId) return INPUT.customId;
        }
        return 'unknown';
    }

    orIfFalsey({ONE, TWO}) {
        return ONE || TWO;
    }

    nullishCoalescing({ONE, TWO}) {
        return ONE ?? TWO;
    }

    ifIsTruthy({ONE, TWO}) {
        return Cast.toBoolean(ONE) && TWO;
    }

    binnaryAnd({num1, num2}) {
        num1 = Cast.toNumber(num1);
        num2 = Cast.toNumber(num2);

        return num1 & num2;
    }

    binnaryOr({num1, num2}) {
        num1 = Cast.toNumber(num1);
        num2 = Cast.toNumber(num2);

        return num1 | num2;
    }

    binnaryXor({num1, num2}) {
        num1 = Cast.toNumber(num1);
        num2 = Cast.toNumber(num2);

        return num1 ^ num2;
    }

    shiftLeft({num1, num2}) {
        num1 = Cast.toNumber(num1);
        num2 = Cast.toNumber(num2);

        return num1 << num2;
    }

    shiftRight({num1, num2}) {
        num1 = Cast.toNumber(num1);
        num2 = Cast.toNumber(num2);

        return num1 >> num2;
    }

    binnaryNot({num1}) {
        num1 = Cast.toNumber(num1);

        return ~num1;
    }

    isNumberMultipleOf({NUM, MULTIPLE}) {
        NUM = Cast.toNumber(NUM);
        MULTIPLE = Cast.toNumber(MULTIPLE);

        return (NUM % MULTIPLE) === 0;
    }

    isInteger({NUM}) {
        NUM = Cast.toNumber(NUM);
        return Math.trunc(NUM) === NUM;
    }

    isPrime({NUM}) {
        NUM = Math.trunc(Cast.toNumber(NUM));

        if (NUM <= 1) return false;
        for (let i = 2; i < NUM; i++) {
            if (NUM % i === 0) {
                return false;
            }
        }
        return true;
    }

    isEven({NUM}) {
        NUM = Cast.toNumber(NUM);
        
        return NUM % 2 === 0;
    }

    betweenNumbers({NUM, MIN, MAX}) {
        NUM = Cast.toNumber(NUM);
        MIN = Cast.toNumber(MIN);
        MAX = Cast.toNumber(MAX);

        if (MIN > MAX) [MIN, MAX] = [MAX, MIN];

        return NUM >= MIN && NUM <= MAX;
    }

    evaluateMath({EQUATION}) {
        EQUATION = Cast.toString(EQUATION);
        // "" is undefined when evalutated
        if (EQUATION.trim().length === 0) return 0;
        // evalueate
        let answer = 0;
        try {
            answer = MathJS.evaluate(EQUATION);
        } catch {
            // syntax errors cause real errors
            answer = 0;
        }
        // multiline or semi-colon breaks create a ResultSet, we can get the last item in the set for that
        if (typeof answer === "object") {
            if ("entries" in answer) {
                const answers = answer.entries;
                if (answers.length === 0) return 0;
                const lastIdx = answers.length - 1;
                return Number(answers[lastIdx]);
            }
        }
        // Cast.toNumber converts NaN to 0
        return Number(answer);
    }

    partOfRatio({RATIO, PART}) {
        RATIO = Cast.toString(RATIO);
        PART = Cast.toString(PART).toLowerCase();

        if (!RATIO.includes(":")) return "";
        const split = RATIO.split(":");

        const section = split[Number(PART === "last")];
        return Cast.toNumber(section);
    }

    simplifyRatio({RATIO}) {
        RATIO = Cast.toString(RATIO);
        if (!RATIO.includes(":")) return "";
        const split = RATIO.split(":");

        const first = Cast.toNumber(split[0]);
        const last = Cast.toNumber(split[1]);

        const reduced = this._reduce(first, last);

        return `${Cast.toNumber(reduced[0])}:${Cast.toNumber(reduced[1])}`;
    }
    _reduce(numerator, denominator) {
        let gcd = function gcd(a, b) {
            return b ? gcd(b, a % b) : a;
        };
        gcd = gcd(numerator, denominator);
        return [numerator / gcd, denominator / gcd];
    }

    pi() {
        return Math.PI;
    }

    euler() {
        return Math.E;
    }

    infinity() {
        return Infinity;
    }

    truncateNumber({NUM}) {
        return Math.trunc(Cast.toNumber(NUM));
    }

    atan2({X, Y}) {
        X = Cast.toNumber(X);
        Y = Cast.toNumber(Y);

        return Math.atan2((Y * 180) / Math.PI, (X * 180) / Math.PI);
    }

    exactlyEqual({A, B}) {
        return A === B;
    }

    speedToPitch({SPEED}) {
        return (1200 * Math.log2(Cast.toNumber(SPEED))) / 10;
    }

    pitchToSpeed({PITCH}) {
        return 2 ** (Cast.toNumber(PITCH) * 10) / 1200;
    }
}

module.exports = Extension