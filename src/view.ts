import { reportUnhandledError } from "rxjs/internal/util/reportUnhandledError";
import { State, Viewport, Birb, Constants } from "./types";
import { Body } from "./types";
import { attr, isNotNullOrUndefined } from "./util";

export { render };

// Rendering (side effects)
/**
 * Brings an SVG element to the foreground.
 * @param elem SVG element to bring to the foreground
 */
const bringToForeground = (elem: SVGElement): void => {
    elem.parentNode?.appendChild(elem);
};
/**
 * Displays a SVG element on the canvas. Brings to foreground.
 * @param elem SVG element to display
 */
const show = (elem: SVGElement): void => {
    elem.setAttribute("visibility", "visible");
    bringToForeground(elem);
};
/**
 * Hides a SVG element on the canvas.
 * @param elem SVG element to hide
 */
const hide = (elem: SVGElement): void => {
    elem.setAttribute("visibility", "hidden");
};
/**
 * Creates an SVG element with the given properties.
 *
 * See https://developer.mozilla.org/en-US/docs/Web/SVG/Element for valid
 * element names and properties.
 *
 * @param namespace Namespace of the SVG element
 * @param name SVGElement name
 * @param props Properties to set on the SVG element
 * @returns SVG element
 */
const createSvgElement = (
    namespace: string | null,
    name: string,
    props: Record<string, string> = {},
): SVGElement => {
    const elem = document.createElementNS(namespace, name) as SVGElement;
    Object.entries(props).forEach(([k, v]) => elem.setAttribute(k, v));
    return elem;
};

const render = (): ((s: State) => void) => {
    // Canvas elements
    const gameOver = document.querySelector("#gameOver") as SVGElement;
    const container = document.querySelector("#main") as HTMLElement;

    const livesText = document.querySelector("#livesText") as HTMLElement;
    const scoreText = document.querySelector("#scoreText") as HTMLElement;
    const svg = document.querySelector("#svgCanvas") as HTMLElement;

    const birdImg = createSvgElement(svg.namespaceURI, "image", {
        href: "assets/birb.png",
        x: `${Viewport.CANVAS_WIDTH * 0.3 - Birb.WIDTH / 2}`,
        y: `${Viewport.CANVAS_HEIGHT / 2 - Birb.HEIGHT / 2}`,
        width: `${Birb.WIDTH}`,
        height: `${Birb.HEIGHT}`,
        id: "0",
    });

    svg.appendChild(birdImg);

    /**
     * Renders the current state to the canvas.
     *
     * In MVC terms, this updates the View using the Model.
     *
     * @param s Current state
     */
    return (s: State) => {
        if (s.gameEnd) {
            show(gameOver);
            return;
        }
        //console.log(s.exit);
        const updateBodyView = (rootSVG: HTMLElement) => (b: Body) => {
            function createBodyView() {
                const v = createSvgElement(svg.namespaceURI, b.viewType, {
                    x: String(b.start_pos.x),
                    y: String(b.start_pos.y),
                    width: String(b.width),
                    height: String(b.height),
                    id: b.id,
                    ...(b.href == undefined ? {} : { href: b.href }),
                    ...(b.fill == undefined ? {} : { fill: b.fill }),
                });
                v.classList.add(b.viewType);
                rootSVG.append(v);
                return v;
            }

            const v = document.getElementById(b.id) || createBodyView();
            attr(v, {
                transform: `translate(${b.relative_pos.x}, ${b.relative_pos.y})`,
            });
        };
        livesText.textContent = `${s.lives}`;
        scoreText.textContent = `${s.score}`;

        updateBodyView(svg)(s.bird);
        s.top_pipes.forEach(updateBodyView(svg));
        s.bot_pipes.forEach(updateBodyView(svg));

        s.exit
            .map(o => document.getElementById(o.id))
            .filter(isNotNullOrUndefined)
            .forEach(v => svg.removeChild(v));
    };
};
