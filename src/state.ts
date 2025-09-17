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
            y_pos: s.y_pos + s.y_velocity,
            y_velocity: s.y_velocity + Constants.GRAVITY,
        } as const;
    }
}

class Gravity implements Action {
    apply(s: State): State {
        return {
            ...s,
            y_pos: s.y_pos + s.y_velocity,
            y_velocity: s.y_velocity + Constants.GRAVITY,
        } as const;
    }
}

class Flap implements Action {
    apply(s: State): State {
        return {
            ...s,
            y_velocity: -4,
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
