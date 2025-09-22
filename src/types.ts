/**
 * This file contains the type declarations and constants used in the project
 */

export { Viewport, Birb, Constants, initialState };
export type { State, Key, Action };

import { Vec } from "./util";

/** Constants */
const Viewport = {
    CANVAS_WIDTH: 600,
    CANVAS_HEIGHT: 400,
} as const;

const Birb = {
    WIDTH: 42,
    HEIGHT: 30,
} as const;

const Constants = {
    PIPE_WIDTH: 50,
    TICK_RATE_MS: 16.67, // Might need to change this!
    GRAVITY: 1,
} as const; // State processing

/** Types and interfaces */
type State = Readonly<{
    lives: number;
    score: number;
    gameEnd: boolean;
    vel: Vec;
    pos: Vec;
}>;

const initialState: State = {
    lives: 3,
    score: 0,
    gameEnd: false,
    vel: new Vec(),
    pos: new Vec(),
};
interface Action {
    apply(s: State): State;
} // User input

type Key = "Space";
