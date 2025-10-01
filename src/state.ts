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
import { Vec, RNG, except } from "./util";
import { ParsedPipe } from "./types";
import { concat, pipe } from "rxjs";
import { relative } from "path";
export { Tick, Flap, initialState, createPipe, SpawnPipes };

class Tick implements Action {
    /**
     * A discrete timestep. The bird accelerates and changes position
     * @param elapsed
     *
     */
    constructor(public readonly elapsed: number) {}

    /**
     * Score increases when passing through pipe.
     * Apply bounce for collisions.
     * Move bodies and deal with expired pipes.
     * @param s old state
     * @returns new state
     */
    apply(s: State): State {
        const s2 = Tick.handleScore(
            Tick.handleCollisons(Tick.handleExitPipes(s)),
        );

        return {
            ...s2,
            time: this.elapsed,
            bird: Tick.moveBody(s2.bird),
            top_pipes: s2.top_pipes.map(Tick.moveBody),
            bot_pipes: s2.bot_pipes.map(Tick.moveBody),
        } as const;
    }

    /**
     *
     * @param b a body
     * @returns body moved after a tick
     */
    static moveBody = (b: Body): Body => ({
        ...b,
        vel: b.vel.add(b.acc),
        relative_pos: b.relative_pos.add(b.vel),
        abs_pos: b.start_pos.add(b.relative_pos),
    });

    /**
     * Checks if bird has passed the upcoming pipe.
     * If so, increment score and track the next pipe
     * @param s old state
     * @returns new state
     */
    static handleScore = (s: State): State => {
        /**
         * Helper function to check if bird has passed some pipe
         * @param bird
         * @param pipe
         * @returns boolean, true if bird has passed the pipe
         */
        function checkifPassed(bird: Body, pipe: Body): boolean {
            return bird.abs_pos.x > pipe.abs_pos.x;
        }

        const nextPipe = s.top_pipes.find(p => p.id === s.nextPipeId);

        if (nextPipe) {
            if (checkifPassed(s.bird, nextPipe)) {
                // we only bother looking at the top pipes, no need to look at bot pipes too.
                const newId = Number(nextPipe.id) + 2;
                return { ...s, score: s.score + 1, nextPipeId: String(newId) };
            }
        }

        return s;
    };

    /**
     * Expired pipes are those that have moved all the way left, out of view.
     * This function moves expired pipes from the active arrays to the exit array, so that they
     * may be marked for removal in the View.
     * @param s old state
     * @returns new state, expired pipes moved out of active arrays
     */
    static handleExitPipes = (s: State): State => {
        const expiredTopPipes = s.top_pipes.filter(
            p => p.relative_pos.x < -(Viewport.CANVAS_WIDTH + p.width),
        );
        const expiredBotPipes = s.bot_pipes.filter(
            p => p.relative_pos.x < -(Viewport.CANVAS_WIDTH + p.width),
        );

        const cut = except((p1: Body) => (p2: Body) => p1.id === p2.id);
        return {
            ...s,
            top_pipes: cut(s.top_pipes)(expiredTopPipes),
            bot_pipes: cut(s.bot_pipes)(expiredBotPipes),
            exit: [...s.exit, ...expiredTopPipes, ...expiredBotPipes],
        };
    };

    /**
     * Helper function to check if two rects have collided.
     * lx represents the top left corner of rect x
     * rx represents the bot right corner of rect x
     * Note that it works with svg coordinates and not cartesian.
     * @param b1 first rect
     * @param b2 second rect
     * @returns
     */
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

    /**
     * Bounce bird, decrement lives, end the game if out of lives.
     * @param s old state
     * @returns new state
     */
    static handleCollisons = (s: State): State => {
        /** Helper functions */
        /**
         * This function checks if the bird has collided with a surface, and bounces the bird
         * if it has.
         * It also checks whether the player has run out of lives and switches the gameEnd boolean
         * attribute accordingly.
         * @param d the direction we want to bounce: "up" | "down"
         * @returns new state, bounces bird and checks if game is over
         */
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
                        gameEnd:
                            s.lives - 1 < 0 ||
                            (s.top_pipes.length == 0 && s.objCount > 1)
                                ? true
                                : false,
                    };
                };
            return bounce(s.bird)(d);
        };

        /**
         *
         * @param bird the bird
         * @param pipe the pipe
         * @returns boolean, true if bird has collided with pipe
         */
        const checkCollidewithPipe =
            (bird: Body) =>
            (pipe: Body): boolean => {
                return this.detectRectCollision(bird)(pipe);
            };
        /**
         *
         * @param bird the bird
         * @returns true if bird has collided with ceiling
         */
        const checkCollideWithCeiling = (bird: Body): boolean => {
            const top_left = bird.start_pos.add(bird.relative_pos);
            return top_left.y <= 0;
        };

        /**
         *
         * @param bird the bird
         * @returns true if the bird has collided with the floor
         */
        const checkCollideWithFloor = (bird: Body): boolean => {
            const bot_right = bird.start_pos
                .add(bird.relative_pos)
                .add(new Vec(bird.width, bird.height));
            return bot_right.y >= Viewport.CANVAS_HEIGHT;
        };

        /** main code */
        // booleans for deciding which direction to bounce
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

/**
 * Used to flap the bird upwards when pressing space bar
 */
class Flap implements Action {
    /**
     *
     * @param s old state
     * @returns new state, give the bird a new velocity
     */
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
/**
 * Used to spawn pipes after reading data from csv.
 */
class SpawnPipes implements Action {
    constructor(public readonly pipe: ParsedPipe) {}

    /**
     * Uses the curried createPipe function to make a top pipe
     * @param pipe, parsed pipe data from csv
     * @returns a top pipe Body
     */
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

    /**
     * Uses the curried createPipe function to make a top pipe
     * @param pipe, parsed pipe data from csv
     * @returns a top pipe Body
     */
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

    /**
     *
     * @param s old state
     * @returns new state, with new pipes added
     */
    apply(s: State): State {
        // call pipe creation functions, adding the final parameter(id)
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
            objCount: s.objCount + 2, // we just created two pipes
        };
    }
}
/**
 *
 * @param viewType the html node name
 * @param vel a velocity vector(see util.ts)
 * @param rect dimensions of the body
 * @param t  marks time object is created
 * @param opts  a bag of optional parameters
 * @param oid unique id to identify object
 * @returns a Body, containing all the state needed for physics
 */
const createBody =
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
        abs_pos: rect.start_pos,
    });

// we curry this function mainly so that we may assign unique object id's
const createPipe = createBody("rect")(Constants.PIPE_VEL);

/**
 * Function used to initialise the bird Body.
 * @returns the bird, as a Body
 */
function createBird(): Body {
    return {
        id: "0",
        timeCreated: 0,
        viewType: "image",
        start_pos: Constants.BIRD_START_POS,
        width: Birb.WIDTH,
        height: Birb.HEIGHT,
        vel: new Vec(),
        acc: Constants.GRAVITY,
        relative_pos: new Vec(),
        abs_pos: Constants.BIRD_START_POS,
        href: "assets/birb.png",
    };
}

// State at the start of the game
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
    nextPipeId: "1",
};
