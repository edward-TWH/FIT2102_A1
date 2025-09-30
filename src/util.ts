import { Observable } from "rxjs";

export { Vec, attr, RNG };

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

/**
 * set a number of attributes on an Element at once
 * @param e the Element
 * @param o a property bag
 */
const attr = (e: Element, o: { [p: string]: unknown }) => {
    for (const k in o) e.setAttribute(k, String(o[k]));
};

/**
 * A random number generator which provides two pure functions
 * `hash` and `scaleToRange`.  Call `hash` repeatedly to generate the
 * sequence of hashes.
 */
abstract class RNG {
    // LCG using GCC's constants
    private static m = 0x80000000; // 2**31
    private static a = 1103515245;
    private static c = 12345;

    /**
     * Call `hash` repeatedly to generate the sequence of hashes.
     * @param seed
     * @returns a hash of the seed
     */
    public static hash = (seed: number) => (RNG.a * seed + RNG.c) % RNG.m;

    /**
     * Takes hash value and scales it to the range [-1, 1]
     */
    public static scale = (hash: number) => (2 * hash) / (RNG.m - 1) - 1;
}
