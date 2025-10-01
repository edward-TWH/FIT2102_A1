export { attr, elem, except, isNotNullOrUndefined, not, RNG, Vec };

/**
 * Class representing a 2D vector
 * Taken from asteroids example
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
 * Taken from asteroids example
 */
const attr = (e: Element, o: { [p: string]: unknown }) => {
    for (const k in o) e.setAttribute(k, String(o[k]));
};

/**
 * A random number generator which provides two pure functions
 * `hash` and `scaleToRange`.  Call `hash` repeatedly to generate the
 * sequence of hashes.
 * Taken from asteroids example
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

const /**
     * Composable not: invert boolean result of given function
     * @param f a function returning boolean
     * @param x the value that will be tested with f
     * Taken from asteroids example
     */
    not =
        <T>(f: (x: T) => boolean) =>
        (x: T) =>
            !f(x),
    /**
     * is e an element of a using the eq function to test equality?
     * @param eq equality test function for two Ts
     * @param a an array that will be searched
     * @param e an element to search a for
     * Taken from asteroids example
     */
    elem =
        <T>(eq: (_: T) => (_: T) => boolean) =>
        (a: ReadonlyArray<T>) =>
        (e: T) =>
            a.findIndex(eq(e)) >= 0,
    /**

    /**
     * array a except anything in b
     * @param eq equality test function for two Ts
     * @param a array to be filtered
     * @param b array of elements to be filtered out of a
     * Taken from asteroids example
     */
    except =
        <T>(eq: (_: T) => (_: T) => boolean) =>
        (a: ReadonlyArray<T>) =>
        (b: ReadonlyArray<T>) =>
            a.filter(not(elem(eq)(b)));
/**
 * Type guard for use in filters
 * @param input something that might be null or undefined
 * Taken from asteroids example
 */
function isNotNullOrUndefined<T extends object>(
    input: null | undefined | T,
): input is T {
    return input != null;
}
