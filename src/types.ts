/**
 * This file contains the type declarations and constants used in the project
 */

export { Viewport, Birb, Constants };
export type {
    State,
    Key,
    Action,
    Body,
    Rect,
    ViewType,
    ObjectId,
    ParsedPipe,
    TimeStamp,
    Optional,
    Direction,
};

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
    TICK_RATE_MS: 50,
    GRAVITY: new Vec(0, 1),
    START_LIVES: 3,
    START_SCORE: 0,
    START_TIME: 0,
    PIPE_VEL: new Vec(-5, 0),
    BIRD_START_POS: new Vec(
        Viewport.CANVAS_WIDTH * 0.3 - Birb.WIDTH / 2,
        Viewport.CANVAS_HEIGHT / 2 - Birb.HEIGHT / 2,
    ),
    FLAP_VEL: new Vec(0, -7),
} as const;

/** Types and interfaces */

// pipes are treated as rects, whereas bird is treated as image
type ViewType = "image" | "rect";

type ObjectId = Readonly<{
    id: string;
}>;

type TimeStamp = Readonly<{
    timeCreated: number;
}>;

type Rect = Readonly<{
    start_pos: Vec; // Note that this represents the top left corner of the element
    width: number;
    height: number;
}>;

// contains all the state needed for physics calculations
type Body = Rect &
    ObjectId &
    TimeStamp &
    Optional &
    Readonly<{
        viewType: ViewType;
        vel: Vec;
        acc: Vec;
        relative_pos: Vec; // relative position to start position
        abs_pos: Vec; // absolute position, i.e, start + relative vector
        href?: string;
    }>;

// main game state
type State = Readonly<{
    lives: number;
    score: number;
    bird: Body;
    gameEnd: boolean;
    time: number;
    top_pipes: ReadonlyArray<Body>;
    bot_pipes: ReadonlyArray<Body>;
    exit: ReadonlyArray<Body>;
    objCount: number;
    nextPipeId: string;
}>;

// This represents the values extracted from the csv
type ParsedPipe = Readonly<{
    gap_y: number;
    gap_height: number;
    time: number;
}>;

// options bag gives flexibility when creating views for the bird and pipes
type Optional = Readonly<{
    href?: string;
    fill?: string;
}>;

type Direction = "up" | "down";

// Interface for reducing state
interface Action {
    apply(s: State): State;
}

// User input
type Key = "Space";
