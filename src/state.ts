import {
    State,
    Action,
    Constants,
    Birb,
    Body,
    ViewType,
    ObjectId,
    Rect,
} from "./types";
import { Vec } from "./util";
export { Tick, Flap, Bounce, initialState };

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
const createRect =
    (viewType: ViewType) =>
    (oid: ObjectId) =>
    (rect: Rect) =>
    (vel: Vec): Body => ({
        viewType: viewType,
        ...oid,
        ...rect,
        vel: vel,
        acc: new Vec(),
    });

// TODO: Write a composable function createRect for creating pipes
const createPipe = createRect("pipe");

function createBird(): Body {
    return {
        id: "0",
        timeCreated: 0,
        viewType: "bird",
        pos: new Vec(),
        width: Birb.WIDTH,
        height: Birb.HEIGHT,
        vel: new Vec(),
        acc: Constants.GRAVITY,
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
};
