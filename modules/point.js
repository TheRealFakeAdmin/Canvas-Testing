// Setup Class

/**
 * Makes all points standardized.
 *
 * @example new Point(12, 64);
 */
class Point {
    /**
     * Creates the representation of a point. Used in the marks array.
     * @param {number} x - X-Coord
     * @param {number} y - Y-Coord
     *
     * @returns {{timestamp: number, type: 2, x: number, y: number}}
     */
    constructor(x, y) {
        this.timestamp = Date.now();
        this.type = 2;

        this.x = x;
        this.y = y;
    }
}

// Setup Functions

/**
 * Creates a Path2D point
 * @param {number} x - X-Position
 * @param {number} y - Y-Position
 * @returns {Path2D}
 * @private
 */
function _Point2D(x, y) {
    let pt = new Path2D();
    pt.arc(x, y, SETTINGS.pointRadius, 0, Math.PI * 2);
    return pt;
}


/**
 * Add point to the marks list
 * @param {number} x - X-Position
 * @param {number} y - Y-Position
 * @param {number} index - Index to add point to
 */
function addPoint(x, y, index) {
    let pt = new Point(x, y);

    if (typeof index === "number" && 0 <= index && index <= LOREM_IPSUM.marks.length) // if index is specified
        LOREM_IPSUM.marks[index] = pt;
    else
        LOREM_IPSUM.marks.push(pt);

    return void(0);
}


MARKS.set('Point', {
    type: 2,
    Class: Point,
    priv: _Point2D,
    addPt: addPoint
})


export { Point, addPoint, _Point2D }