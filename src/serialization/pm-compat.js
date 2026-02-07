export function compatBlock(block) {
    //procedures_return
    if (block.opcode == "procedures_return" && block.inputs.return) {
        block.inputs.VALUE = {name: "VALUE", block: block.inputs.return.block, shadow: block.inputs.return.shadow};
        delete block.inputs.return;
    }

    console.log(block);

    return block;
}