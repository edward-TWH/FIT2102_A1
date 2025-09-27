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
} from "./types";
import { Vec } from "./util";
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
            pipes: s.pipes.map(Tick.moveBody),
        } as const;
    }

    static moveBody = (b: Body): Body => ({
        ...b,
        pos: b.pos.add(b.vel),
        vel: b.vel.add(b.acc),
    });
}

class Flap implements Action {
    apply(s: State): State {
        return {
            ...s,
            bird: {
                ...s.bird,
                vel: new Vec(0, -5),
            },
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

class SpawnPipes implements Action {
    constructor(public readonly pipe: ParsedPipe) {}
    static createTopPipe = (pipe: ParsedPipe) => {
        // return function composed with rect
        const width = Constants.PIPE_WIDTH,
            height = 0.5 * (1 - pipe.gap_height) * Viewport.CANVAS_HEIGHT,
            time = pipe.time;
        return createPipe({ pos: new Vec(0, 0), width: width, height: height })(
            { timeCreated: time },
        );
    };
    static createBotPipe = (pipe: ParsedPipe) => {
        // return function composed with rect
        const width = Constants.PIPE_WIDTH,
            height = 0.5 * (1 - pipe.gap_height) * Viewport.CANVAS_HEIGHT,
            time = pipe.time;
        return createPipe({ pos: new Vec(0, 0), width: width, height: height })(
            { timeCreated: time },
        );
    };
    apply(s: State): State {
        // call create functions with timestamps, which completes signature
        return {
            ...s,
            pipes: [
                ...s.pipes,
                SpawnPipes.createTopPipe(this.pipe)({ id: String(s.objCount) }),
                SpawnPipes.createBotPipe(this.pipe)({
                    id: String(s.objCount + 1),
                }),
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
    (oid: ObjectId): Body => ({
        viewType: viewType,
        ...t,
        ...oid,
        ...rect,
        vel: vel,
        acc: new Vec(),
    });

// TODO: Write a composable function createRect for creating pipes
const createPipe = createRect("rect")(Constants.PIPE_SPEED);

function createBird(): Body {
    return {
        id: "0",
        timeCreated: 0,
        viewType: "image",
        pos: new Vec(),
        width: Birb.WIDTH,
        height: Birb.HEIGHT,
        vel: new Vec(),
        acc: Constants.GRAVITY,
        href: "assets/birb.png",
    };
}

const initialState: State = {
    lives: Constants.START_LIVES,
    score: Constants.START_SCORE,
    gameEnd: false,
    bird: createBird(),
    time: Constants.START_TIME,
    pipes: [],
    exit: [],
    objCount: 1,
};
