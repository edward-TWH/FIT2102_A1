import { State, Action, Constants } from "./types";
export { Tick, Flap, Bounce };

/**
 * Updates the state by proceeding with one time step.
 *
 * @param s Current state
 * @returns Updated state
 */
const tick = (s: State) => s;

class Tick implements Action {
    constructor(public readonly elapsed: number) {}

    apply(s: State): State {
        return {
            ...s,
            pos: s.pos.add(s.vel),
            vel: s.vel.add(new Vec(0, Constants.GRAVITY)),
        } as const;
    }
}

class Flap implements Action {
    apply(s: State): State {
        return {
            ...s,
            vel: new Vec(0, -4),
        } as const;
    }
}

class Bounce implements Action {
    apply(s: State): State {
        /** Placeholder */
        return {
            ...s,
        } as const;
    }
}
