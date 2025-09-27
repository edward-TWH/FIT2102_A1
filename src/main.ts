/**
 * Inside this file you will use the classes and functions from rx.js
 * to add visuals to the svg element in index.html, animate them, and make them interactive.
 *
 * Study and complete the tasks in observable exercises first to get ideas.
 *
 * Course Notes showing Asteroids in FRP: https://tgdwyer.github.io/asteroids/
 *
 * You will be marked on your functional programming style
 * as well as the functionality that you implement.
 *
 * Document your code!
 */

import "./style.css";

import {
    Observable,
    catchError,
    filter,
    from,
    fromEvent,
    interval,
    map,
    merge,
    mergeMap,
    scan,
    skip,
    switchMap,
    take,
    timer,
} from "rxjs";
import { fromFetch } from "rxjs/fetch";
import { Constants, State, Key, Viewport } from "./types";
import { createPipe, initialState, SpawnPipes } from "./state";
import { Flap, Tick, Bounce } from "./state";
import { render } from "./view";
import { Vec } from "./util";

export const state$ = (csvContents: string): Observable<State> => {
    /** User input */
    const key$ = fromEvent<KeyboardEvent>(document, "keypress");
    const fromKey = (keyCode: Key) =>
        key$.pipe(filter(({ code }) => code === keyCode));

    /** Create a stream for space presses, which creates a stream of Flap objects */
    const flap$ = fromKey("Space").pipe(map(_ => new Flap()));

    /** Determines the rate of time steps */
    const tick$ = interval(Constants.TICK_RATE_MS).pipe(
        map(elapsed => new Tick(elapsed)),
    );

    /** Parse the csv contents and create an observable to emit values at the given times */

    const pipe$ = from(csvContents.split(/\r?\n/)).pipe(
        skip(1),
        mergeMap(row => row.split(",")),
        map(
            column =>
                ({
                    gap_y: Number(column[0]),
                    gap_height: Number(column[1]),
                    time: Number(column[2]),
                }) as const,
        ),
        mergeMap(({ gap_y, gap_height, time }) =>
            timer(time * 1000).pipe(
                map(
                    _ =>
                        new SpawnPipes({
                            gap_y: gap_y,
                            gap_height: gap_height,
                            time: time,
                        }),
                ),
            ),
        ),
    );
    return merge(flap$, tick$, pipe$).pipe(
        scan((state, action) => action.apply(state), initialState),
    );
};

// The following simply runs your main function on window load.  Make sure to leave it in place.
// You should not need to change this, beware if you are.
if (typeof window !== "undefined") {
    const { protocol, hostname, port } = new URL(import.meta.url);
    const baseUrl = `${protocol}//${hostname}${port ? `:${port}` : ""}`;
    const csvUrl = `${baseUrl}/assets/map.csv`;

    // Get the file from URL
    const csv$ = fromFetch(csvUrl).pipe(
        switchMap(response => {
            if (response.ok) {
                return response.text();
            } else {
                throw new Error(`Fetch error: ${response.status}`);
            }
        }),
        catchError(err => {
            console.error("Error fetching the CSV file:", err);
            throw err;
        }),
    );

    // Observable: wait for first user click
    const click$ = fromEvent(document.body, "mousedown").pipe(take(1));

    csv$.pipe(
        switchMap(contents =>
            // On click - start the game
            click$.pipe(switchMap(() => state$(contents))),
        ),
    ).subscribe(render());
}
