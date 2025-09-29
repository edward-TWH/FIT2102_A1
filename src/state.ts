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
        start_pos: b.start_pos.add(b.vel),
        vel: b.vel.add(b.acc),
        relative_pos: b.relative_pos.add(b.vel),
    });

    static detectRectCollision =
        (b1: Body) =>
        (b2: Body): boolean => {
            const l1 = b1.start_pos.add(b1.relative_pos),
                l2 = b2.start_pos.add(b2.relative_pos),
                r1 = l1.add(new Vec(b1.width, b1.height)),
                r2 = l2.add(new Vec(b2.width, b2.height));

            if (l1.x > r2.x || l2.x > r1.x) {
                return false;
            }

            if (r1.y > l2.y || r2.y > l1.y) {
                return false;
            }

            return true;
        };

    static detectCollisionWithPipe =
        (bird: Body) =>
        (pipe: Body): CollisionSurface | null => {
            if (Tick.detectRectCollision(bird)(pipe)) {
                return pipe.location ? pipe.location : null;
            }
            return null;
        };

    static detectCollisionWithEdge = (bird: Body): CollisionSurface | null => {
        const absolute_pos = bird.start_pos.add(bird.relative_pos);
        if (absolute_pos.y < 0) {
            return "ceiling";
        } else if (absolute_pos.y > Viewport.CANVAS_HEIGHT) {
            return "floor";
        }
        return null;
    };
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
    pipes: [],
    exit: [],
    objCount: 1,
};
