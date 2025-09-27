import { Observable } from "rxjs";

export { Vec, attr };

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
 * parses the contents from a csv request WIP
 * @param contents
 */
//function parseCSV(contents: String): Observable<Body> {}

/**
 * set a number of attributes on an Element at once
 * @param e the Element
 * @param o a property bag
 */
const attr = (e: Element, o: { [p: string]: unknown }) => {
    for (const k in o) e.setAttribute(k, String(o[k]));
};
