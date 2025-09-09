import { State } from "./types";

export const initialState: State = {
    lives: 3,
    score: 0,
    gameEnd: false,
}; /**
 * Updates the state by proceeding with one time step.
 *
 * @param s Current state
 * @returns Updated state
 */
const tick = (s: State) => s;
