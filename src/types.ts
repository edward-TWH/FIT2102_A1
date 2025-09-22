/**
 * This file contains the type declarations and constants used in the project
 */

export { Viewport, Birb, Constants };
export type { State, Key, Action, Body, Rect, ViewType, ObjectId };

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
    TICK_RATE_MS: 50, // Might need to change this!
    GRAVITY: new Vec(0, 1),
} as const; // State processing

/** Types and interfaces */
type ViewType = "bird" | "pipe";

type ObjectId = Readonly<{
    id: String;
    timeCreated: number;
}>;

type Rect = Readonly<{
    pos: Vec; // Note that this represents the top left corner of the element
    width: number;
    height: number;
}>;

type Body = Rect &
    ObjectId &
    Readonly<{
        viewType: ViewType;
        vel: Vec;
    }>;

type State = Readonly<{
    lives: number;
    score: number;
    bird: Body;
    gameEnd: boolean;
    time: number;
}>;

interface Action {
    apply(s: State): State;
} // User input

type Key = "Space";
