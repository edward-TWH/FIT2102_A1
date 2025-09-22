import { State, Action, Constants, Birb, Body } from "./types";
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
            bird: {
                ...s.bird,
                vel: s.bird.vel.add(Constants.GRAVITY),
                pos: s.bird.pos.add(s.bird.vel),
            },
        } as const;
    }
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

// TODO: Write a composable function createRect for creating pipes

function createBird(): Body {
    return {
        id: "0",
        timeCreated: 0,
        viewType: "bird",
        pos: new Vec(),
        width: Birb.WIDTH,
        height: Birb.HEIGHT,
        vel: new Vec(),
    };
}

const initialState: State = {
    lives: 3,
    score: 0,
    gameEnd: false,
    bird: createBird(),
    time: 0,
};
