import {
    State,
    Action,
    Constants,
    Birb,
    Body,
    ViewType,
    ObjectId,
    Rect,
    Viewport,
    TimeStamp,
    Optional,
    CollisionSurface,
} from "./types";
import { Vec, RNG } from "./util";
import { ParsedPipe } from "./types";
import { pipe } from "rxjs";
export { Tick, Flap, Bounce, initialState, createPipe, SpawnPipes };

class Tick implements Action {
    /**
     * A discrete timestep. The bird accelerates and changes position
     * @param elapsed
     *
     */
    constructor(public readonly elapsed: number) {}

    apply(s: State): State {
        return {
            ...s,
            time: this.elapsed,
            bird: Tick.moveBody(s.bird),
            top_pipes: s.top_pipes.map(Tick.moveBody),
            bot_pipes: s.bot_pipes.map(Tick.moveBody),
        } as const;
    }

    static moveBody = (b: Body): Body => ({
        ...b,
        start_pos: b.start_pos.add(b.vel),
        vel: b.vel.add(b.acc),
        relative_pos: b.relative_pos.add(b.vel),
    });

    static handleCollisons = (s: State): State => {};

    static checkCollideWithTopPipe = {};

    static checkCollideWithBotPipe = {};

    static checkCollideWithCeiling = {};

    static checkCollideWithFloor = {};
}

class Flap implements Action {
    apply(s: State): State {
        return {
            ...s,
            bird: {
                ...s.bird,
                vel: Constants.FLAP_VEL,
            },
        } as const;
    }
}

class Bounce implements Action {
    constructor(public readonly surface: CollisionSurface) {}

    apply(s: State): State {
        const speed = RNG.scale(RNG.hash(s.time)) * 5 + 15;
        return {
            ...s,
            bird: {
                ...s.bird,
                vel:
                    this.surface in ["ceiling", "top_pipe"]
                        ? new Vec(0, speed)
                        : new Vec(0, -speed),
            },
            lives: s.lives - 1,
        } as const;
    }
}

class SpawnPipes implements Action {
    constructor(public readonly pipe: ParsedPipe) {}

    static createTopPipe = (pipe: ParsedPipe) => {
        const width = Constants.PIPE_WIDTH,
            gap_coord = pipe.gap_y * Viewport.CANVAS_HEIGHT,
            gap_height = pipe.gap_height * Viewport.CANVAS_HEIGHT;

        return createPipe({
            start_pos: new Vec(Viewport.CANVAS_WIDTH, 0),
            width: width,
            height: gap_coord - gap_height / 2,
        })({ timeCreated: pipe.time })({ fill: "green", location: "top_pipe" });
    };

    static createBotPipe = (pipe: ParsedPipe) => {
        // return function composed with rect
        const width = Constants.PIPE_WIDTH,
            gap_coord = pipe.gap_y * Viewport.CANVAS_HEIGHT,
            gap_height = pipe.gap_height * Viewport.CANVAS_HEIGHT;

        return createPipe({
            start_pos: new Vec(
                Viewport.CANVAS_WIDTH,
                gap_coord + gap_height / 2,
            ),
            width: width,
            height: Viewport.CANVAS_HEIGHT - (gap_coord + gap_height / 2),
        })({ timeCreated: pipe.time })({ fill: "green", location: "bot_pipe" });
    };

    apply(s: State): State {
        // call create functions with timestamps, which completes signature
        return {
            ...s,
            top_pipes: [
                SpawnPipes.createTopPipe(this.pipe)({ id: String(s.objCount) }),
                ...s.top_pipes,
            ],
            bot_pipes: [
                SpawnPipes.createBotPipe(this.pipe)({
                    id: String(s.objCount + 1),
                }),
                ...s.bot_pipes,
            ],
            objCount: s.objCount + 2,
        };
    }
}

const createRect =
    (viewType: ViewType) =>
    (vel: Vec) =>
    (rect: Rect) =>
    (t: TimeStamp) =>
    (opts: Optional) =>
    (oid: ObjectId): Body => ({
        viewType: viewType,
        ...t,
        ...oid,
        ...rect,
        ...opts,
        vel: vel,
        acc: new Vec(),
        relative_pos: new Vec(),
    });

// TODO: Write a composable function createRect for creating pipes
const createPipe = createRect("rect")(Constants.PIPE_VEL);

function createBird(): Body {
    return {
        id: "0",
        timeCreated: 0,
        viewType: "image",
        start_pos: new Vec(
            Constants.BIRD_START_POS.x,
            Constants.BIRD_START_POS.y,
        ),
        width: Birb.WIDTH,
        height: Birb.HEIGHT,
        vel: new Vec(),
        acc: Constants.GRAVITY,
        relative_pos: new Vec(),
        href: "assets/birb.png",
    };
}

const initialState: State = {
    lives: Constants.START_LIVES,
    score: Constants.START_SCORE,
    gameEnd: false,
    bird: createBird(),
    time: Constants.START_TIME,
    bot_pipes: [],
    top_pipes: [],
    exit: [],
    objCount: 1,
};
