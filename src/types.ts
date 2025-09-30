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
    CollisionSurface,
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
    TICK_RATE_MS: 50, // Might need to change this!
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
} as const; // State processing

/** Types and interfaces */
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

type Body = Rect &
    ObjectId &
    TimeStamp &
    Optional &
    Readonly<{
        viewType: ViewType;
        vel: Vec;
        acc: Vec;
        relative_pos: Vec;
        href?: string;
    }>;

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
}>;

type ParsedPipe = Readonly<{
    gap_y: number;
    gap_height: number;
    time: number;
}>;

type Optional = Readonly<{
    href?: string;
    fill?: string;
    location?: CollisionSurface;
}>;

type CollisionSurface = "floor" | "ceiling" | "top_pipe" | "bot_pipe";

type Direction = "up" | "down";

interface Action {
    apply(s: State): State;
}

// User input

type Key = "Space";
