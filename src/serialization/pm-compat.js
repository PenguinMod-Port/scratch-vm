const SemVer = require('../util/semver');

/**
 * @param {*} block 
 * @param {SemVer} pmVersion 
 * @returns 
 */
export function compatBlock(block, pmVersion) {
    /* --- PRE-PORT COMPATABILITY --- */
    if (pmVersion.equal('0.0.0')) {
        //procedures_return
        if (block.opcode === "procedures_return" && block.inputs.return) {
            block.inputs.VALUE = {name: "VALUE", block: block.inputs.return.block, shadow: block.inputs.return.shadow};
            delete block.inputs.return;
        }

        //operator_expandablejoininputs
        if (block.opcode === "operator_expandablejoininputs" && block.mutation) {
            block.fields.EXPANDABLE = {name: "EXPANDABLE", value: block.mutation.inputcount};
            delete block.mutation;
        }

        //control_expandableIf
        if (block.opcode === "control_expandableIf" && block.mutation) {
            let value = Number(block.mutation.branches) * 2 - 2;
            if (block.mutation['ends-in-else'] !== "true") value += 1;

            block.fields.EXPANDABLE = {name: "EXPANDABLE", value};
            delete block.mutation;
        }

        //operator_expandableMath
        if (block.opcode === "operator_expandableMath" && block.mutation) {
            block.fields.EXPANDABLE = {name: "EXPANDABLE", value: block.mutation.inputcount};

            for (let i in String(block.mutation.menuvalues).split("")) {
                block.fields[`OP${Number(i) + 2}`] = {name: `OP${Number(i) + 2}`, value: block.mutation.menuvalues[i]};
            }

            delete block.mutation;
        }

        //procedures_definition_return
        if (block.opcode === "procedures_definition_return") {
            block.opcode = "procedures_definition";
        }

        //procedures_prototype
        if (block.opcode === "procedures_prototype" && block.mutation.returns === "true") {
            block.mutation.forceoutput = block.mutation.optype === "boolean" ? "1" : "2";
        }

        //procedures_call
        if (block.opcode === "procedures_call" && block.mutation.returns === "true") {
            block.mutation.return = `[null, ${block.mutation.optype === "boolean" ? "1" : "2"}]`;
        }
    }

    return block;
}