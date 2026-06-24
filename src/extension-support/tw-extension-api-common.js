const ArgumentAlignment = require('./argument-alignment');
const ArgumentType = require('./argument-type');
const BlockType = require('./block-type');
const BlockShape = require('./block-shape');
const MenuType = require('./menu-type');
const TargetType = require('./target-type');
const Cast = require('../util/cast');
const Clone = require('../util/clone');
const Color = require('../util/color');
const external = require('./tw-external');

const Scratch = {
    ArgumentAlignment,
    ArgumentType,
    BlockType,
    BlockShape,
    MenuType,
    TargetType,
    Cast,
    Clone,
    Color,
    external
};

module.exports = Scratch;
