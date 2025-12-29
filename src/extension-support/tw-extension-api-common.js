const ArgumentType = require('./argument-type');
const BlockType = require('./block-type');
const BlockShape = require('./block-shape');
const CompileMode = require('./compile-mode');
const TargetType = require('./target-type');
const Cast = require('../util/cast');
const external = require('./tw-external');

const Scratch = {
    ArgumentType,
    BlockType,
    BlockShape,
    CompileMode,
    TargetType,
    Cast,
    external
};

module.exports = Scratch;
