export { Vec };

/**
 * Class representing a 2D vector
 */
class Vec {
    constructor(
        public readonly x: number = 0,
        public readonly y: number = 0,
    ) {}
    add = (b: Vec) => new Vec(this.x + b.x, this.y + b.y);
    sub = (b: Vec) => this.add(b.scale(-1));
    scale = (s: number) => new Vec(this.x * s, this.y * s);
}
