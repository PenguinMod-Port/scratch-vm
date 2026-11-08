const {StackOpcode, InputOpcode, InputType} = require('./enums');
const {IntermediateInput, IntermediateStack, IntermediateStackBlock, IntermediateScript, IntermediateRepresentation} = require('./intermediate');
const Cast = require('../util/cast');

class IRFolder {
    /**
     * @param {IntermediateRepresentation} ir
     */
    constructor(ir, runtime) {
        /** @type {IntermediateRepresentation} */
        this.ir = ir;

        this.runtime = runtime;
    }

    /**
     * @param  {...IntermediateInput} inputs
     */
    isConstant(...inputs) {
        return inputs.every(input => input.opcode === InputOpcode.CONSTANT);
    }

    fold() {
        this.foldScript(this.ir.entry);
        for (const procedure of Object.values(this.ir.procedures)) {
            this.foldScript(procedure);
        }
    }

    /**
     * @param {IntermediateScript} script
     */
    foldScript(script) {
        if (script.folding) {
            this.foldStack(script.stack);
        }
    }

    /**
     * @param {IntermediateInput} block
     * @returns {IntermediateInput}
     */
    foldInput(block) {
        this.foldInputs(block.inputs);
        const node = block.inputs;

        switch (block.opcode) {
            case InputOpcode.OP_ABS:
                if (!this.isConstant(node.value)) break;
                return this.createConstantInput(Math.abs(node.value.inputs.value));
            case InputOpcode.OP_ACOS:
                if (!this.isConstant(node.value)) break;
                return this.createConstantInput(Math.acos(node.value.inputs.value) * 180 / Math.PI);
            case InputOpcode.OP_ADD:
                if (!this.isConstant(node.left, node.right)) break;
                return this.createConstantInput(node.left.inputs.value + node.right.inputs.value);
            case InputOpcode.OP_AND:
                if (!this.isConstant(node.left, node.right)) break;
                return this.createConstantInput(node.left.inputs.value && node.right.inputs.value);
            case InputOpcode.OP_ASIN:
                if (!this.isConstant(node.value)) break;
                return this.createConstantInput(Math.asin(node.value.inputs.value) * 180 / Math.PI);
            case InputOpcode.OP_ATAN:
                if (!this.isConstant(node.value)) break;
                return this.createConstantInput(Math.atan(node.value.inputs.value) * 180 / Math.PI);
            case InputOpcode.OP_CEILING:
                if (!this.isConstant(node.value)) break;
                return this.createConstantInput(Math.ceil(node.value.inputs.value));
            case InputOpcode.OP_CONTAINS:
                if (!this.isConstant(node.string, node.contains)) break;
                return this.createConstantInput(node.string.inputs.value.toLowerCase().indexOf(node.contains.inputs.value.toLowerCase()) !== -1);
            case InputOpcode.OP_COS:
                if (!this.isConstant(node.value)) break;
                return this.createConstantInput(Math.round(Math.cos(Math.PI * node.value.inputs.value) * 1e10) / 1e10);
            case InputOpcode.OP_DIVIDE:
                if (!this.isConstant(node.left, node.right)) break;
                return this.createConstantInput(node.left.inputs.value / node.right.inputs.value);
            case InputOpcode.OP_EQUALS:
                if (!this.isConstant(node.left, node.right)) break;
                return this.createConstantInput(this.runtime.equals(node.left.inputs.value, node.right.inputs.value));
            case InputOpcode.OP_FLOOR:
                if (!this.isConstant(node.value)) break;
                return this.createConstantInput(Math.floor(node.value.inputs.value));
            case InputOpcode.OP_GREATER:
                if (!this.isConstant(node.left, node.right)) break;
                return this.createConstantInput(Cast.compare(node.left.inputs.value, node.right.inputs.value) > 0);
            case InputOpcode.OP_JOIN:
                if (!this.isConstant(node.left, node.right)) break;
                return this.createConstantInput(node.left.inputs.value + node.right.inputs.value);
            case InputOpcode.OP_LENGTH:
                if (!this.isConstant(node.value)) break;
                return this.createConstantInput(node.value.inputs.value.length);
            case InputOpcode.OP_LESS:
                if (!this.isConstant(node.left, node.right)) break;
                return this.createConstantInput(Cast.compare(node.left.inputs.value, node.right.inputs.value) < 0);
            case InputOpcode.OP_LETTER_OF:
                if (!this.isConstant(node.string, node.letter)) break;
                return this.createConstantInput(node.string.inputs.value[node.letter.inputs.value - 1] || "");
            case InputOpcode.OP_LOG_E:
                if (!this.isConstant(node.value)) break;
                return this.createConstantInput(Math.log(node.value.inputs.value));
            case InputOpcode.OP_LOG_10:
                if (!this.isConstant(node.value)) break;
                return this.createConstantInput(Math.log(node.value.inputs.value) / Math.LN10);
            case InputOpcode.OP_MOD:
                if (!this.isConstant(node.left, node.right)) break;
                let result = node.left.inputs.value % node.right.inputs.value
                if (result / node.right.inputs.value < 0) result += node.right.inputs.value;
                return this.createConstantInput(result);
            case InputOpcode.OP_MULTIPLY:
                if (!this.isConstant(node.left, node.right)) break;
                return this.createConstantInput(node.left.inputs.value * node.right.inputs.value);
            case InputOpcode.OP_NOT:
                if (!this.isConstant(node.operand)) break;
                return this.createConstantInput(!node.operand.inputs.value);
            case InputOpcode.OP_OR:
                if (!this.isConstant(node.left, node.right)) break;
                return this.createConstantInput(node.left.inputs.value || node.right.inputs.value);
            case InputOpcode.OP_POW_10:
                if (!this.isConstant(node.value)) break;
                return this.createConstantInput(10 ** node.value.inputs.value);
            case InputOpcode.OP_POW_E:
                if (!this.isConstant(node.value)) break;
                return this.createConstantInput(Math.exp(node.value.inputs.value));
            case InputOpcode.OP_RANDOM:
                if (!this.isConstant(node.low, node.high)) break;
                return this.createConstantInput(this.runtime.ext_scratch3_operators._random(node.low.inputs.value, node.high.inputs.value));
            case InputOpcode.OP_ROUND:
                if (!this.isConstant(node.value)) break;
                return this.createConstantInput(Math.round(node.value.inputs.value));
            case InputOpcode.OP_SIN:
                if (!this.isConstant(node.value)) break;
                return this.createConstantInput(Math.round(Math.sin(Math.PI * node.value.inputs.value) * 1e10) / 1e10);
            case InputOpcode.OP_SQRT:
                if (!this.isConstant(node.value)) break;
                return this.createConstantInput(Math.sqrt(node.value.inputs.value));
            case InputOpcode.OP_SUBTRACT:
                if (!this.isConstant(node.left, node.right)) break;
                return this.createConstantInput(node.left.inputs.value - node.right.inputs.value);
            case InputOpcode.OP_TAN:
                if (!this.isConstant(node.value)) break;
                return this.createConstantInput(Math.round(Math.tan(Math.PI * node.value.inputs.value) * 1e10) / 1e10);
        }

        // no folding needed
        return block;
    }

    /**
     * @param {IntermediateStackBlock} block 
     * @returns {IntermediateStackBlock}
     */
    foldStackedBlock(block) {
        this.foldInputs(block.inputs);
        const node = block.inputs;

        // no folding needed
        return block;
    }

    /**
     * @param {IntermediateStack} stack
     */
    foldStack(stack) {
        for (let i in stack.blocks) {
            stack.blocks[i] = this.foldStackedBlock(stack.blocks[i]);
        }
    }

    /**
     * @param {Object.<string, any> | Array.<any>} inputs
     */
    foldInputs(inputs) {
        for (const [inputName, input] of Object.entries(inputs)) {
            if (input instanceof IntermediateStack) {
                this.foldStack(input);
            } else if (input instanceof IntermediateInput) {
                inputs[inputName] = this.foldInput(input);
            } else if (typeof input === "object" && input !== null) {
                this.foldInputs(input);
            }
        }
    }

    // copied from irgen.js with some modifications
    createConstantInput (constant) {
        if (constant === null) {
            return new IntermediateInput(InputOpcode.CONSTANT, InputType.NULL);
        }
        if (typeof constant === "boolean") {
            return new IntermediateInput(InputOpcode.CONSTANT, InputType.BOOLEAN, {value: constant});
        }
        if (typeof constant === "number") {
            return new IntermediateInput(InputOpcode.CONSTANT, IntermediateInput.getNumberInputType(constant), {value: constant});
        }

        constant += '';
        const numConstant = +constant;

        if ((!Number.isNaN(numConstant)) && (constant.trim() !== '' || constant.includes('\t'))) {
            if (numConstant.toString() === constant) {
                return new IntermediateInput(InputOpcode.CONSTANT, IntermediateInput.getNumberInputType(numConstant), {value: numConstant});
            }
            return new IntermediateInput(InputOpcode.CONSTANT, InputType.STRING_NUM, {value: constant});
        }

        if (constant === 'true') {
            return new IntermediateInput(InputOpcode.CONSTANT, InputType.STRING_BOOLEAN, {value: constant});
        } else if (constant === 'false') {
            return new IntermediateInput(InputOpcode.CONSTANT, InputType.STRING_BOOLEAN, {value: constant});
        }

        return new IntermediateInput(InputOpcode.CONSTANT, InputType.STRING_NAN, {value: constant});
    }
}

module.exports = {
    IRFolder
};