const SemVer = require('../util/semver');

/**
 * @param {*} block 
 * @param {SemVer} pmVersion 
 * @returns 
 */
export function compatBlock(block, pmVersion) {
    /* --- PRE-PORT COMPATABILITY --- */
    if (pmVersion.equal('0.0.0')) {
        //control_expandableIf
        if (block.opcode === "control_expandableIf" && block.mutation) {
            let value = Number(block.mutation.branches) * 2 - 2;
            if (block.mutation['ends-in-else'] !== "true") value += 1;

            block.fields.EXPANDABLE = {name: "EXPANDABLE", value};
            delete block.mutation;
        }

        //operator_expandableBool
        if (block.opcode === "operator_expandableBool" && block.mutation) {
            block.fields.EXPANDABLE = {name: "EXPANDABLE", value: block.mutation.inputcount};

            for (let i in String(block.mutation.menuvalues).split("")) {
                block.fields[`OP${Number(i) + 2}`] = {name: `OP${Number(i) + 2}`, value: block.mutation.menuvalues[i]};
            }

            delete block.mutation;
        }

        //operator_expandableCompare
        if (block.opcode === "operator_expandableCompare" && block.mutation) {
            block.fields.EXPANDABLE = {name: "EXPANDABLE", value: block.mutation.inputcount};

            for (let i in String(block.mutation.menuvalues).split("")) {
                let value = block.mutation.menuvalues[i] === "E" ? "e" : block.mutation.menuvalues[i]; // no more strict eq option
                block.fields[`OP${Number(i) + 2}`] = {name: `OP${Number(i) + 2}`, value};
            }

            delete block.mutation;
        }

        //operator_expandablejoininputs
        if (block.opcode === "operator_expandablejoininputs" && block.mutation) {
            block.fields.EXPANDABLE = {name: "EXPANDABLE", value: block.mutation.inputcount};
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

        //procedures_call
        if (block.opcode === "procedures_call") {
            if (block.mutation.returns === "true") block.mutation.return = `[null, ${block.mutation.optype === "\"boolean\"" ? "1" : "2"}]`;
            if (block.mutation.optype === "\"end\"") block.mutation.terminal = "true";
            if (block.mutation.color) block.mutation.colour = JSON.parse(block.mutation.color)[0];
            
            delete block.mutation.returns;
            delete block.mutation.optype;
            delete block.mutation.color;
        }

        //procedures_definition_return
        if (block.opcode === "procedures_definition_return") {
            block.opcode = "procedures_definition";
        }

        //procedures_prototype
        if (block.opcode === "procedures_prototype") {
            console.log(block.mutation.optype)
            if (block.mutation.returns === "true") block.mutation.forceoutput = block.mutation.optype === "\"boolean\"" ? "1" : "2";
            if (block.mutation.optype === "\"end\"") block.mutation.terminal = "true";
            if (block.mutation.color) block.mutation.colour = JSON.parse(block.mutation.color)[0];
            
            delete block.mutation.returns;
            delete block.mutation.optype;
            delete block.mutation.color;
        }

        //procedures_return
        if (block.opcode === "procedures_return" && block.inputs.return) {
            block.inputs.VALUE = {name: "VALUE", block: block.inputs.return.block, shadow: block.inputs.return.shadow};
            delete block.inputs.return;
        }
    }

    return block;
}