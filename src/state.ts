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
    Direction,
} from "./types";
import { Vec, RNG } from "./util";
import { ParsedPipe } from "./types";
import { pipe } from "rxjs";
export { Tick, Flap, initialState, createPipe, SpawnPipes };

class Tick implements Action {
    /**
     * A discrete timestep. The bird accelerates and changes position
     * @param elapsed
     *
     */
    constructor(public readonly elapsed: number) {}

    apply(s: State): State {
        const s2 = Tick.handleCollisons(s);
        return {
            ...s2,
            time: this.elapsed,
            bird: Tick.moveBody(s2.bird),
            top_pipes: s2.top_pipes.map(Tick.moveBody),
            bot_pipes: s2.bot_pipes.map(Tick.moveBody),
        } as const;
    }

    static moveBody = (b: Body): Body => ({
        ...b,
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

            if (r1.y < l2.y || r2.y < l1.y) {
                return false;
            }

            return true;
        };

    static handleCollisons = (s: State): State => {
        // helper functions
        const bounceBird = (d: Direction): State => {
            const bounce =
                (bird: Body) =>
                (direction: Direction): State => {
                    const randSpeed = RNG.scale(RNG.hash(s.time)) * 5 + 15;

                    const newVel =
                        direction == "up"
                            ? new Vec(0, -randSpeed)
                            : new Vec(0, randSpeed);

                    return {
                        ...s,
                        lives: s.lives - 1,
                        bird: { ...s.bird, vel: newVel },
                        gameEnd: s.lives - 1 < 0 ? true : false,
                    };
                };
            return bounce(s.bird)(d);
        };

        const checkCollidewithPipe =
            (bird: Body) =>
            (pipe: Body): boolean => {
                return this.detectRectCollision(bird)(pipe);
            };

        const checkCollideWithCeiling = (bird: Body): boolean => {
            const top_left = bird.start_pos.add(bird.relative_pos);
            return top_left.y <= 0;
        };

        const checkCollideWithFloor = (bird: Body): boolean => {
            const bot_right = bird.start_pos
                .add(bird.relative_pos)
                .add(new Vec(bird.width, bird.height));
            return bot_right.y >= Viewport.CANVAS_HEIGHT;
        };

        // main code
        // something wrong with pipe check
        console.log(s.top_pipes.filter(checkCollidewithPipe(s.bird)));
        console.log(s.bot_pipes.filter(checkCollidewithPipe(s.bird)));
        const collideTopPipe =
            s.top_pipes.filter(checkCollidewithPipe(s.bird)).length > 0;
        const collideBotPipe =
            s.bot_pipes.filter(checkCollidewithPipe(s.bird)).length > 0;
        const collideCeiling = checkCollideWithCeiling(s.bird);
        const collideFloor = checkCollideWithFloor(s.bird);

        if (collideTopPipe || collideCeiling) {
            return bounceBird("down");
        } else if (collideBotPipe || collideFloor) {
            return bounceBird("up");
        }
        return s;
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
        })({ timeCreated: pipe.time })({ fill: "green" });
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
        })({ timeCreated: pipe.time })({ fill: "green" });
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
