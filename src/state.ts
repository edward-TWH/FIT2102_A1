import { State, Action, Constants } from "./types";

export const initialState: State = {
    lives: 3,
    score: 0,
    gameEnd: false,
    y_velocity: 0,
}; /**
 * Updates the state by proceeding with one time step.
 *
 * @param s Current state
 * @returns Updated state
 */
const tick = (s: State) => s;

class Tick implements Action {
    constructor(elapsed: number) {}

    apply(s: State): State {
        return {
            ...s,
            y_velocity: s.y_velocity + Constants.GRAVITY,
        };
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
