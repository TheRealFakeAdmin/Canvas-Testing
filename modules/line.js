import { distanceCalc } from './temp.js';

// Setup Class

/**
 * Standardized Lines, what more could you want! :)
 * @example new Line(2, 5, 8, 13);
 */
class Line {
    /**
     * Creates the representation of a line. Used in the marks array.
     *
     * @param {number} x1 - Point-1 X-Coord
     * @param {number} y1 - Point-1 Y-Coord
     * @param {number} x2 - Point-2 X-Coord
     * @param {number} y2 - Point-2 Y-Coord
     *
     * @returns {{timestamp: number, type: 1, x1: number, y1: number, x2: number, y2: number, center: {x: number, y: number}, angle: number, length: number}} Line
     */
    constructor(x1, y1, x2, y2) {
        this.timestamp = Date.now();
        this.type = 1;

        this.x1 = x1;
        this.y1 = y1;

        this.x2 = x2;
        this.y2 = y2;

        this.center = {};
        this.center.x = (x1 + x2) / 2;
        this.center.y = (y1 + y2) / 2;

        this.angle = ((Math.atan2(y2-y1, x2-x1) * 180) / Math.PI) + 180 % 360; // 0=Right to Left; 180=Left to Right
        //this.angle = a < 0 ? a + 180 : a;

        this.length = distanceCalc(x1, y1, x2, y2);
    }
}

// Setup Functions

/**
 * Creates a line with end points [x1, x2] & [x2, y2]
 * @param {number} x1 - End Point 1 X-Coord
 * @param {number} y1 - End Point 1 Y-Coord
 * @param {number} x2 - End Point 2 X-Coord
 * @param {number} y2 - End Point 2 Y-Coord
 * @returns {Path2D} -
 * @private
 */
function _Line2D(x1, y1, x2, y2) {
    let ln = new Path2D();
    ln.moveTo(x1, y1);
    ln.lineTo(x2, y2);
    return ln;
}


/**
 * Creates and saves a line to marks array.
 * @param {number} x1 - Point-1 X-Coord
 * @param {number} y1 - Point-1 Y-Coord
 * @param {number} x2 - Point-2 X-Coord
 * @param {number} y2 - Point-2 Y-Coord
 * @param index
 */
function drawLineP2P(x1, y1, x2, y2, index) {
    if (DEBUG.enabled) console.log(x1, y1, x2, y2, index);
    let ln = new Line(x1, y1, x2, y2);
    if (typeof index === "number" && 0 <= index && index <= LOREM_IPSUM.marks.length) // if index is specified
        LOREM_IPSUM.marks[index] = ln;
    else
        LOREM_IPSUM.marks.push(ln);

    TEXT_INFO.length.innerText = ln.length.toFixed(3);
    TEXT_INFO.angle.innerText = `${ln.angle.toFixed(3)}\u00b0`;
    TEXT_INFO.centerCoords.innerText = `[${ln.center.x},${ln.center.y}]`;

    return void(0);
}

MARKS.set('Line', {
    type: 1,
    class: Line,
    priv: _Line2D,
    addP2P: drawLineP2P
})


export { Line, drawLineP2P, _Line2D }