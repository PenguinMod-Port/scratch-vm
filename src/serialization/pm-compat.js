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
        if (block.opcode == "procedures_return" && block.inputs.return) {
            block.inputs.VALUE = {name: "VALUE", block: block.inputs.return.block, shadow: block.inputs.return.shadow};
            delete block.inputs.return;
        }

        //operator_expandablejoininputs
        if (block.opcode == "operator_expandablejoininputs" && block.mutation) {
            block.fields.EXPANDABLE = {name: "EXPANDABLE", value: block.mutation.inputcount};
            delete block.mutation;
        }

        //control_expandableIf
        if (block.opcode == "control_expandableIf" && block.mutation) {
            let value = Number(block.mutation.branches) * 2 - 2;
            if (!block.mutation['ends-in-else']) value += 1;

            block.fields.EXPANDABLE = {name: "EXPANDABLE", value};
            delete block.mutation;
        }
    }

    return block;
}