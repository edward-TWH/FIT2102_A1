/**
 * This file contains the type declarations and constants used in the project
 */

export { Viewport, Birb, Constants };
export type { State, Key, Action };

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
    TICK_RATE_MS: 500, // Might need to change this!
} as const; // State processing

/** Types and interfaces */
type State = Readonly<{
    lives: number;
    score: number;
    gameEnd: boolean;
}>;

interface Action {
    apply(s: State): State;
} // User input

type Key = "Space";
