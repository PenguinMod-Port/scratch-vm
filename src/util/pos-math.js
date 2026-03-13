/* eslint-disable no-mixed-operators */
const translateForCamera = (runtime, screen, x, y) => {
    const {pos, scale, dir} = runtime.getCamera(screen);
    const radians = (dir / 180) * Math.PI;
    const sin = Math.sin(radians);
    const cos = Math.cos(radians);
    const offX = x - pos[0];
    const offY = y - pos[1];
    return [
        scale * (offX * cos - offY * sin),
        scale * (offX * sin + offY * cos)
    ];
};

const translateScreenPos = (runtime, screen, x, y) => {
    const {pos, scale, dir} = runtime.getCamera(screen);
    const invScale = 1 / scale;
    const radians = (-dir / 180) * Math.PI;
    const sin = Math.sin(radians);
    const cos = Math.cos(radians);
    return [
        pos[0] + invScale * (x * cos - y * sin),
        pos[1] + invScale * (x * sin + y * cos)
    ];
};

module.exports = {
    translateForCamera,
    translateScreenPos
};
