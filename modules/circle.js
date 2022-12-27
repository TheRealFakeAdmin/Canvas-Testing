import { distanceCalc } from './temp.js';

let Settings;

// Setup Class

/**
 * Makes all circles standardized. Used in the marks array.
 */
class Circle {
    /**
     * Creates the representation of a circle. Used in the marks array.
     * @param {number} x - Center x-coord
     * @param {number} y - Center y-coord
     * @param {number} radius - radius of the circle
     *
     * @returns {{timestamp: number, type: 0, x: number, y: number, d: number, r: number}}
     */
    constructor(x, y, radius) {
        this.timestamp = Date.now();
        this.type = 0;

        this.x = x;
        this.y = y;

        this.d = radius * 2;
        this.r = radius;
    }
}

// Setup Functions

/**
 * Creates a Path2D containing a circle
 * @param {number} x - Center x-position
 * @param {number} y - Center y-position
 * @param {number} radius - Radius of the circle
 * @returns {Path2D} - Circle wrapped in a Path2D
 * @private
 */
function _Circle2D(x, y, radius) { // TODO : Re-Think what is considered a private function ("_" prefix) and what is not
    let crcl = new Path2D();
    crcl.arc(x, y, radius, 0, Math.PI * 2);
    return crcl;
}


/**
 * Draws circle using 2 points [<u>P</u>oint to <u>P</u>oint]
 * @param {number} x1 - Point 1 x-coord
 * @param {number} y1 - Point 1 y-coord
 * @param {number} x2 - Point 2 x-coord
 * @param {number} y2 - Point 2 y-coord
 * @param {number} i - Current index of `marks`
 */
function addCircleP2P(x1, y1, x2, y2, i) {
    LOREM_IPSUM.latest.center = {
        x: (x1 + x2) / 2,
        y: (y1 + y2) / 2
    }

    LOREM_IPSUM.latest.radius = distanceCalc(LOREM_IPSUM.latest.center.x, LOREM_IPSUM.latest.center.y, x1, y1);

    TEXT_INFO.centerCoords.innerText = `[${LOREM_IPSUM.latest.center.x},${LOREM_IPSUM.latest.center.y}]`;
    if (DEBUG.enabled) console.debug("p1: " + [x1,y1], "\npc: " + [LOREM_IPSUM.latest.center.x,LOREM_IPSUM.latest.center.y], "\np2: " + [x2,y2], "\nradius: " + LOREM_IPSUM.latest.radius);

    TEXT_INFO.radius.innerText = LOREM_IPSUM.latest.radius.toFixed(3);

    addCirclePR(LOREM_IPSUM.latest.center.x, LOREM_IPSUM.latest.center.y, LOREM_IPSUM.latest.radius, i);
}


/**
 * Creates a circle using a center point and radius [<u>P</u>oint & <u>R</u>adius]
 * @param {number} x - Center X-Coord
 * @param {number} y - Center Y-Coord
 * @param {number} radius - radius
 * @param {number} [index] - index of circle
 */
function addCirclePR(x, y, radius, index) {
    let crcl = new Circle(x, y, radius);

    if (typeof index === "number" && 0 <= index && index <= LOREM_IPSUM.marks.length) // if index is specified
        LOREM_IPSUM.marks[index] = crcl;
    else
        LOREM_IPSUM.marks.push(crcl);

    LOREM_IPSUM.latest.center = {
        x: x,
        y: y
    }

    LOREM_IPSUM.latest.radius = radius;
}


console.log(SETTINGS);


MARKS.set('Circle', {
    type: 0,
    Class: Circle,
    priv: _Circle2D,
    addP2P: addCircleP2P,
    addPR: addCircleP2P
})

export { Circle, _Circle2D, addCircleP2P, addCirclePR }