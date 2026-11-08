const {StackOpcode, InputOpcode, InputType} = require('./enums');
const {IntermediateInput, IntermediateStack, IntermediateStackBlock, IntermediateScript, IntermediateRepresentation} = require('./intermediate');

class IRFolder {
    /**
     * @param {IntermediateRepresentation} ir
     */
    constructor(ir) {
        /** @type {IntermediateRepresentation} */
        this.ir = ir;
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
            case InputOpcode.OP_ADD:
                if (this.isConstant(node.left, node.right)) {
                    return this.createConstantInput(node.left.inputs.value + node.right.inputs.value);
                }
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