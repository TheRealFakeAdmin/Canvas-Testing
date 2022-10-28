// --- Settings --- //


// Circles/Craters
const minCraterSize     = 18; // Minimum crater size
const delCircleMaxDist  = 25; // Maximum distance to center to delete a circle (Delete Tool)
const rszCircleThresh   = 5;  // Threshold (like radius) of circle resize (Edit Tool)
const rszArrowLength    = 50; // Length of the arrow that shows when resizing circle
const rszArrowHead      = 15; // Length of Arrow Head sides

// Points
const pointRadius       = 10; // Radius of the point
const delPointMaxDist   = 10; // Maximum distance to delete a point (Delete Tool)

// Lines
const delLineMaxDist    = 10; // Maximum distance to delete a line (Delete Tool)
const minLineLength     = 45; // Minimum length of a line
const endPtMaxDist      = 5;  // Maximum distance to select end-point (Edit Tool)


// --- END OF SETTINGS --- //


// Used for testing
//let debug = false; // Toggles Debug Mode


// Setup Variables

const current = {};

Object.assign(window, {
    SETTINGS: {

        // --- Start of Settings --- //

        /// Circles / Craters
        minCraterSize: 18,
        delCircleMaxDist: 25,
        rszCircleThresh: 5,
        rszArrowLength: 50,
        rszArrowHead: 15,

        /// Points
        pointRadius: 10,
        delPointMaxDist: 10,

        /// Lines
        delLineMaxDist: 10,
        minLineLength: 45,
        endPtMaxDist: 5

        // --- End of Settings --- //

    },
    TEXT_INFO: { // Debug Information bellow canvas
        coords: document.getElementById('coords'),
        startCoords: document.getElementById('start-coords'),
        centerCoords: document.getElementById('center-coords'),
        endCoords: document.getElementById('end-coords'),
        radius: document.getElementById('radius'),
        length: document.getElementById('length'),
        angle: document.getElementById('angle'),
        mouseDown: document.getElementById('mouse-down')
    },
    DEBUG: { // Used for testing
        enabled: false, // Toggles Debug Mode
        _tests: {
            _tempTestOne: [{"timestamp":1665670727055,"type":0,"x":113,"y":270.5,"d":46.010868281309364,"r":23.005434140654682},{"timestamp":1665670729802,"type":0,"x":263.5,"y":13,"d":143.68368035375485,"r":71.84184017687743},{"timestamp":1665670733986,"type":0,"x":245,"y":181,"d":38.2099463490856,"r":19.1049731745428},{"timestamp":1665670738867,"type":0,"x":384.5,"y":40.5,"d":63.89053137985315,"r":31.945265689926575}],
            _tempTestTwo: [{"timestamp":1665688602591,"type":0,"x":263,"y":17,"d":136.23509092741122,"r":68.11754546370561},{"timestamp":1665688607196,"type":0,"x":386,"y":41,"d":62.12889826803627,"r":31.064449134018133},{"timestamp":1665688611451,"type":0,"x":110.5,"y":270,"d":45.044422518220834,"r":22.522211259110417},{"timestamp":1665688615594,"type":0,"x":274,"y":348,"d":36.76955262170047,"r":18.384776310850235},{"timestamp":1665688617920,"type":0,"x":363.5,"y":321.5,"d":26.870057685088806,"r":13.435028842544403},{"timestamp":1665688620896,"type":0,"x":375,"y":293.5,"d":26.92582403567252,"r":13.46291201783626},{"timestamp":1665688625697,"type":0,"x":32,"y":374,"d":48.33218389437829,"r":24.166091947189145},{"timestamp":1665688631893,"type":0,"x":241.5,"y":182.5,"d":38.28837943815329,"r":19.144189719076646}]
        }
    },
    CSB_APP: {
        canvas: document.getElementById('canvas'), // The Canvas
        ctx: this.canvas.getContext("2d"),
        marks: []
    }
});

//const canvas = document.getElementById('canvas'); // The Canvas

const ctx = CSB_APP.canvas.getContext("2d"); // Canvas context

// Debug Information bellow canvas
//const crds = document.getElementById('coords');
//const strc = document.getElementById('start-coords');
//const cntr = document.getElementById('center-coords');
//const endc = document.getElementById('end-coords');
//const rdus = document.getElementById('radius');
//const lnth = document.getElementById('length');
//const angl = document.getElementById('angle');
//const msdn = document.getElementById('mouse-down');

const marks = []; // Array of all the marks

let center,
    radius,
    i = 0,
    slctd = {},
    isHover = false,
    isDown = false;     /// if mouse button is down


// Setup Canvas

CSB_APP.canvas.width = 450; // Width of the canvas
CSB_APP.canvas.height = 450; // Height of the canvas


// Setup Classes

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
        this.type = 0

        this.x = x;
        this.y = y;

        this.d = radius * 2;
        this.r = radius;
    }
}

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
 * Using the offset of the canvas from the page [0,0], the mouse position is calculated
 * to get the position of the point [P0] in the canvas.
 *
 * @summary Gets mouse position using canvas as reference.
 * @param {HTMLCanvasElement} canvas - Target canvas
 * @param {MouseEvent} event - Mouse event
 * @returns {{x: number, y: number}} - True coords
 * @private
 */
function _getMousePos(canvas, event) { // REMEMBER : This is like a percentage/scale
    let rect = canvas.getBoundingClientRect(); // Bounding box of the canvas
    let scaleX = canvas.width / rect.width,    // relationship bitmap vs. element for x
        scaleY = canvas.height / rect.height;  // relationship bitmap vs. element for y

    return {
        x: (event.clientX - rect.left) * scaleX,   // scale mouse coordinates after they have
        y: (event.clientY - rect.top) * scaleY     // been adjusted to be relative to element
    }
}


/**
 * Using the offset of the canvas from the page [0,0], the mouse position is calculated
 * to get the position of the point [P0] in the canvas.
 *
 * @summary Get position of mouse relative to Canvas
 * @param {HTMLCanvasElement} canvas - Target canvas
 * @param {MouseEvent} event - Mouse event
 * @param {boolean} [toFixed] - `Number.prototype.toFixed` argument
 * @returns {{x: (number|string), y: (number|string)}}
 */
function getPosition(canvas, event, toFixed=false) {
    let rect = canvas.getBoundingClientRect(); // Bounding box of the canvas
    let scaleX = canvas.width / rect.width,    // relationship bitmap vs. element for x
        scaleY = canvas.height / rect.height;  // relationship bitmap vs. element for y

    let mp = {
        x: (event.clientX - rect.left) * scaleX,   // scale mouse coordinates after they have
        y: (event.clientY - rect.top) * scaleY     // been adjusted to be relative to element
    }

    let x, y;
    switch(toFixed) {
        case false:
            x = mp.x;
            y = mp.y;
            break;
        default:
            x = mp.x.toFixed(toFixed);
            y = mp.y.toFixed(toFixed);
            break;
    }

    return {
        x: x,
        y: y
    };
}


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
    center = {
        x: (x1 + x2) / 2,
        y: (y1 + y2) / 2
    }

    radius = distanceCalc(center.x, center.y, x1, y1);

    TEXT_INFO.centerCoords.innerText = `[${center.x},${center.y}]`;
    console.debug("p1: " + [x1,y1], "\npc: " + [center.x,center.y], "\np2: " + [x2,y2], "\nradius: " + radius);

    TEXT_INFO.radius.innerText = radius.toFixed(3);

    addCirclePR(center.x, center.y, radius, i);
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

    if (typeof index === "number" && 0 <= index <= marks.length) // if index is specified
        marks[index] = crcl;
    else
        marks.push(crcl);
}


// /**
//  * Draw resize arrow using the mouse position and the circle's index
//  * @param {HTMLCanvasElement} canvas - Canvas element
//  * @param {MouseEvent} e - Mouse event
//  * @param {number} index - Index of the nearest mark
//  */
// function drawResizeArrowMI(canvas, e, index) {
//
// }


// /**
//  * Draw resize arrow using center point & rotation of the arrow
//  * @param {HTMLCanvasElement} canvas - Canvas element
//  * @param {number} x - Center-X
//  * @param {number} y - Center-Y
//  * @param {number} r - Rotation
//  */
// function drawResizeArrowCR(canvas, x, y, r) {
//     let arw = new Path2D();
//
// }


/**
 * Creates a line with end points [x1, x2] & [x2, y2]
 * @param x1 - End Point 1 X-Coord
 * @param y1 - End Point 1 Y-Coord
 * @param x2 - End Point 2 X-Coord
 * @param y2 - End Point 2 Y-Coord
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
 * @param x1 - Point-1 X-Coord
 * @param y1 - Point-1 Y-Coord
 * @param x2 - Point-2 X-Coord
 * @param y2 - Point-2 Y-Coord
 * @param index
 */
function drawLineP2P(x1, y1, x2, y2, index) {
    console.log(x1, y1, x2, y2, index);
    let ln = new Line(x1, y1, x2, y2);
    if (typeof index === "number" && 0 <= index <= marks.length) // if index is specified
        marks[index] = ln;
    else
        marks.push(ln);
    reDraw();

    TEXT_INFO.length.innerText = ln.length.toFixed(3);
    TEXT_INFO.angle.innerText = `${ln.angle.toFixed(3)}\u00b0`;
    TEXT_INFO.centerCoords.innerText = `[${ln.center.x},${ln.center.y}]`;

    return void(0);
}


/**
 * Creates a Path2D point
 * @param x - x-position
 * @param y - y-position
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
 * @param x - x-position
 * @param y - y-position
 * @param index
 */
function addPoint(x, y, index) {
    let pt = new Point(x, y);

    if (typeof index === "number" && 0 <= index <= marks.length) // if index is specified
        marks[index] = pt;
    else
        marks.push(pt);
    reDraw();
    return void(0);
}


/**
 * Clears canvas then loops through all marks to re-draw
 *
 * @param {number} [i] - index to highlight
 * @note ctx.strokeStyle = "#f8b31f";<br>ctx.fillStyle = "#f8b31f33";
 */
function reDraw(i) {
    let tmp, v, ctx = CSB_APP.ctx;
    clearCanvas();

    for(let j = 0; j < marks.length; j++) {
        v = marks[j];
        if (v === undefined) { // Self Healing (if empty)
            delMark(j); // Delete empty index
            --j;        // then go back one because one was deleted
            continue;
        }
        switch (v.type) {
            case 0: // Circle
                tmp = _Circle2D(v.x, v.y, (v.r)); // Circle with center [x,y] & radius = diameter/2
                ctx.lineWidth = 2;
                if ((v.d) < SETTINGS.minCraterSize) { // if too small
                    ctx.strokeStyle = "#f00";
                    ctx.fillStyle = "#f003";
                } else if (j === i) { // if Selected
                    ctx.strokeStyle = "#fff";
                    ctx.fillStyle = "#fff3";
                } else {
                    ctx.strokeStyle = "#f8b31f";
                    ctx.fillStyle = "#f8b31f33"; // #f8b31f33
                }

                ctx.stroke(tmp, "nonzero");
                ctx.fill(tmp, "nonzero");
                break;
            case 1: // Line
                tmp = _Line2D(v.x1, v.y1, v.x2, v.y2);
                ctx.beginPath();
                ctx.lineWidth = 5;
                if (v.length < SETTINGS.minLineLength) { // if too short
                    ctx.strokeStyle = "#f00a";
                } else if (j === i) { // if Selected
                    ctx.strokeStyle = "#fffa";
                } else {
                    ctx.strokeStyle = "#601a4aaa"; // #5a368daa
                }
                ctx.closePath();
                ctx.stroke(tmp, "nonzero");
                break;
            case 2: // Point
                tmp = _Point2D(v.x, v.y);
                ctx.lineWidth = 0;
                if (j === i) { // if Selected
                    ctx.fillStyle = "#fffa";
                } else {
                    ctx.fillStyle = "#ccca"; // #a77311aa
                }

                ctx.fill(tmp, "nonzero");
        }
    }
    return void(0);
}


/**
 * Deletes selected mark
 * @param {number} i - index of mark
 */
function delMark(i) {
    marks.splice(i, 1);
    reDraw();
    return void(0);
}


/**
 * Deletes the latest mark*
 *
 * *Does not go off of timestamps
 */
function delLastMark() {
    delMark(marks.length - 1);
    return void(0);
}


/**
 * Calculates the distance of all marks to the mouse cursor then returns the index of the nearest mark.
 * @param {HTMLCanvasElement} canvas - Target Canvas
 * @param {MouseEvent} e - Mouse Event
 * @param {boolean} [limit] - If false, circle max distance is `radius+SETTINGS.rszCircleThresh`
 * @returns {number} - Index of the nearest mark
 */
function getNearest(canvas, e, limit=true) {
    let tempDist,                    // Temporary distance
        best = Infinity,
        bestDist = Infinity, // Best Mark, Best Distance
        msPs = getPosition(canvas, e),

        x0 = msPs.x,
        y0 = msPs.y,

        x, y;

    marks.forEach((v, i) => { console.debug(v, i);
        switch (v.type) { // Go by type of mark [0: Circle; 1: Line; 2: Point]
            case 0: // Circle
                x = v.x; // Center Point
                y = v.y;
                tempDist = distanceCalc(x, y, x0, y0);

                if (bestDist >= tempDist && (v.r + (limit ? 0 : SETTINGS.rszCircleThresh)) >= tempDist && tempDist <= (limit ? SETTINGS.delCircleMaxDist : v.r + SETTINGS.rszCircleThresh)) { // closer or equal to last best & no further than radius
                    bestDist = tempDist;
                    best = i;
                }
                break;
            case 1: // Line
                let x1 = v.x1, // End-Point 1
                    y1 = v.y1,
                    x2 = v.x2, // End-Point 2
                    y2 = v.y2;

                switch (v.angle) { // Line-Angle going clockwise starting at 3 o'clock == 0
                    case 180: // - same-y
                        if (x0 <= x1) {
                            tempDist = distanceCalc(x0, y0, x1, y1);
                        } else if (x0 >= x2) {
                            tempDist = distanceCalc(x0, y0, x2, y2);
                        } else {
                            tempDist = distanceCalc(x0, y0, x0, y1);
                        }
                        break;
                    case 270: // | same-x
                        if (y0 <= y1) {
                            tempDist = distanceCalc(x0, y0, x1, y1);
                        } else if (y0 >= y2) {
                            tempDist = distanceCalc(x0, y0, x2, y2);
                        } else {
                            tempDist = distanceCalc(x0, y0, x1, y0);
                        }
                        break;
                    case 360: // - same-y
                        if (x0 >= x1) {
                            tempDist = distanceCalc(x0, y0, x1, y1);
                        } else if (x0 <= x2) {
                            tempDist = distanceCalc(x0, y0, x2, y2);
                        } else {
                            tempDist = distanceCalc(x0, y0, x0, y1);
                        }
                        break;
                    case 90: // | same-x
                        if (y0 >= y1) {
                            tempDist = distanceCalc(x0, y0, x1, y1);
                        } else if (y0 <= y2) {
                            tempDist = distanceCalc(x0, y0, x2, y2);
                        } else {
                            tempDist = distanceCalc(x0, y0, x1, y0);
                        }
                        break;
                    default: // Arbitrary angle; The real magic
                        let ang = (v.angle - 180), // Angle to get to 180°
                            pr = rotateAxis([[x0,y0], [x1,y1], [x2,y2]], ang, false), // Rotate to 180°
                            pf;

                        let rx0 = pr[0][0], // Save new point values
                            rx1 = pr[1][0],
                            ry1 = pr[1][1],
                            rx2 = pr[2][0],
                            ry2 = pr[2][1];

                        ang *= -1; // Angle to undo rotation to 180°

                        if (rx0 <= rx1) { // Mirror of case 180
                            pf = [x1,y1];
                        } else if (rx0 >= rx2) {
                            pf = [x2,y2];
                        } else {
                            pf = rotateAxis([[rx0,ry1]], ang, false)[0];
                        }

                        if (DEBUG.enabled === true && i === 0) { // debug for visualizing the first line
                            drawLineP2P(rx1,ry1,rx2,ry2, 1);
                            addPoint(pf[0], pf[1], 2);
                            addPoint(x0, y0, 3);
                        }

                        tempDist = distanceCalc(x0, y0, pf[0], pf[1]);
                        break;
                }
                if (bestDist >= tempDist && SETTINGS.delLineMaxDist >= tempDist) { // closer than last best & no further than radius
                    bestDist = tempDist;
                    best = i;
                }
                break;
            case 2: // Point
                x = v.x; // Center Point
                y = v.y;
                tempDist = distanceCalc(v.x, v.y, msPs.x, msPs.y);

                if (bestDist >= tempDist && SETTINGS.delPointMaxDist >= tempDist) { // closer than last best & no further than radius
                    bestDist = tempDist;
                    best = i;
                }
                break;
        }
    })

    return best; // if none, Infinity deletes nothing in delMark
}





// /**
//  * Returns line endpoint nearest to the mouse
//  * @param {number} index - Index number for `marks`
//  * @param {{x: number, y: number}} msPs - Mouse position ({@link getPosition})
//  * @returns {number} - Endpoint [P1=>1, P2=>2]
//  */
// function getEndPt (index, msPs) {
//     let v = marks[index];
//     let pt = Infinity, // Represents which end-point is closest; 1 or 2
//         d1 = distanceCalc(msPs.x, msPs.y, v.x1, v.y1),
//         d2 = distanceCalc(msPs.x, msPs.y, v.x2, v.y2),
//         dist = Math.min(d1, d2), // Gets nearest distance
//         pn;
//
//     switch (dist) {
//         case d1:
//             pn = 1;
//             break;
//         case d2:
//             pn = 2;
//             break;
//     }
//
//     if (SETTINGS.endPtMaxDist >= dist) { // if close enough to end point
//         pt = pn;
//     }
//     console.log(pt);
//     return pt;
// }


/**
 * Returns the distance between two points
 * @param {number} x1 - Point 1 X-Position
 * @param {number} y1 - Point 1 Y-Position
 * @param {number} x2 - Point 2 X-Position
 * @param {number} y2 - Point 2 Y-Position
 * @returns {number} - Distance between [x1,y1] & [x2,y2]
 */
function distanceCalc(x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1)**2 + (y2 - y1)**2); // sqrt of ((x2 - x1)^2 + (y2 - y1)^2)
}


/**
 * Rotates points relative to the axis
 * @param {Array} c - Array of points [[x1,y1],[x2,y2],[x3,y3],...]
 * @param {number} r - Amount of rotation in radians
 * @param {boolean} [rad=true] - Set to false to use degrees with r
 */
function rotateAxis(c, r, rad=true) {
    if (!Array.isArray(c) || !Number.isFinite(r)) return void(0); // if not correct types, return void

    if (rad === false) { // Converts to radians if rad === false
        r = r*(Math.PI/180);
    }

    let resp = c, // Response variable
        x, y;

    c.forEach((v, i) => { // For every point in c, rotate
        x = v[0];
        y = v[1];

        resp[i][0] = ((x * Math.cos(r)) + (y * Math.sin(r)));
        resp[i][1] = ((-x * Math.sin(r)) + (y * Math.cos(r)));
    })

    return resp;
}


/**
 * Clamps number within range. Numbers out of range are set to the nearest min/max.
 * @param num - Number to clamp
 * @param min - Minimum allowed value
 * @param max - Maximum allowed value
 * @returns {number}
 */
Math.clamp = (num, min, max) => Math.min(Math.max(num, min), max); // Clamps number within range


/**
 * Run when mouse button is pressed in canvas
 * @param {MouseEvent} e
 * @private
 */
function _down(e) {
    if (isDown || e.button !== 0) { // left/main click === e.button of 0
        /*console.debug("Congratulations! You found an edge case!\nWe know about this, though it is not an issue :)");*/
        _up(e);
        return;
    }

    isDown = true;
    i = marks.length;

    let pos = getPosition(CSB_APP.canvas, e);
    current.x1 = pos.x;
    current.y1 = pos.y;

    TEXT_INFO.mouseDown.innerText = "True";

    let nr;
    switch (document.querySelector('input[type=radio][name=tool]:checked').value) {
        case "-2": // Edit Tool
            if ((nr = getNearest(CSB_APP.canvas, e, false)) === Infinity) break;

            slctd.i = nr;
            switch (marks[nr].type) {
                case 0: // Circle
                    let dst = distanceCalc(pos.x, pos.y, marks[nr].x, marks[nr].y);
                    console.debug(dst);
                    if (dst >= (marks[nr].r - SETTINGS.rszCircleThresh) && dst <= (marks[nr].r + SETTINGS.rszCircleThresh)) { // if distance to center is within threshold, do resize mode
                        console.debug('RESIZE');
                        slctd.mode = 1; // Resize Mode
                    } else { // else, do move mode
                        slctd.mode = 2; // Move mode continues to next case
                        slctd.offset = [(marks[nr].x - pos.x), (marks[nr].y - pos.y)];
                    }
                    break;
                case 1: // Line
                    /*slctd.offset = [[(marks[nr].x1 - pos.x), (marks[nr].y1 - pos.y)], [(marks[nr].x2 - pos.x), (marks[nr].y2 - pos.y)]];*/
                    slctd.endPtId = getEndPt(nr, pos);
                    break;
                case 2: // Point
                    slctd.offset = [(marks[nr].x - pos.x), (marks[nr].y - pos.y)];
                    break;
            }
            console.debug(slctd);
            break;
        case "-1": // Delete Tool
            nr = getNearest(CSB_APP.canvas, e);
            delMark(nr);
            return void(0);
        case "0": // Circle Tool
            // nice looking stuff
            TEXT_INFO.startCoords.innerText = `[${current.x1.toFixed(0)},${current.y1.toFixed(0)}]`;
            break;
        case "1": // Line Tool
            TEXT_INFO.startCoords.innerText = `[${current.x1.toFixed(0)},${current.y1.toFixed(0)}]`;
            break;
        case "2": // Point Tool
            addPoint(current.x1, current.y1, i);
            i++;
            break;
    }
    return void(0);
}


/**
 * Run when mouse is moved on canvas
 * @param {MouseEvent} e
 * @private
 */
function _move(e) {
    isHover = true;

    let pos = getPosition(CSB_APP.canvas, e);
    current.x2 = pos.x;
    current.y2 = pos.y;

    /// Setting Coords
    TEXT_INFO.coords.innerText = `[${current.x2},${current.y2}]`;

    let mk, nr, dst, x, y, x1, y1, x2, y2;
    switch (document.querySelector('input[type=radio][name=tool]:checked').value) {
        case "-2": // Edit Tool
            mk = marks[slctd.i];
            nr = getNearest(CSB_APP.canvas, e, false);
            reDraw(nr); // highlight selected

            if (slctd.i === undefined || mk === undefined) return; // if no selected index/mark exists, return
            switch (mk.type) {
                case 0: // Circle
                    dst = distanceCalc(pos.x, pos.y, mk.x, mk.y);
                    switch (slctd.mode) {
                        case 1: // Resize
                            addCirclePR(mk.x, mk.y, dst, slctd.i);
                            break;
                        case 2: // Move
                            x = pos.x + slctd.offset[0];
                            y = pos.y + slctd.offset[1];
                            addCirclePR(x, y, mk.r, slctd.i);
                            break;
                    }
                    break;
                case 1: // Line
                    /*x1 = pos.x + slctd.offset[0][0];
                    y1 = pos.y + slctd.offset[0][1];
                    x2 = pos.x + slctd.offset[1][0];
                    y2 = pos.y + slctd.offset[1][1];
                    drawLine(x1, y1, x2, y2, slctd.i);*/
                    switch (slctd.endPtId) {
                        case 1:
                            x1 = pos.x;
                            y1 = pos.y;
                            x2 = mk.x2;
                            y2 = mk.y2;
                            break;
                        case 2:
                            x1 = mk.x1;
                            y1 = mk.y1;
                            x2 = pos.x;
                            y2 = pos.y;
                            break;
                        default:
                            [x1, y1, x2, y2] = [mk.x1, mk.y1, mk.x2, mk.y2];
                            break;
                    }
                    drawLineP2P(x1, y1, x2, y2, slctd.i);
                    break;
                case 2: // Point
                    x = pos.x + slctd.offset[0];
                    y = pos.y + slctd.offset[1];
                    addPoint(x, y, slctd.i);
                    break;
            }
            reDraw(slctd.i);
            break;
        case "-1": // Delete Tool
            nr = getNearest(CSB_APP.canvas, e);
            reDraw(nr); // highlight selected
            break;
        case "0": // Circle Tool
            if (isDown) { // if not Tool but is mousedown
                /// draw ellipse
                addCircleP2P(current.x1, current.y1, current.x2, current.y2, i);
                reDraw();

                // Setting End Coords
                TEXT_INFO.endCoords.innerText = `[${current.x2},${current.y2}]`;
            }
            break;
        case "1": // Line Tool
            if (isDown) {
                // Draw Line
                drawLineP2P(current.x1, current.y1, current.x2, current.y2, i);

                // Setting End Coords
                TEXT_INFO.endCoords.innerText = `[${current.x2},${current.y2}]`;
            }
            break;
        case "2": // Point Tool
            break;
        default:
            console.debug("Just another edge case, nothing to worry about!\nHere is a cookie 🍪");
            break;
    }
    return void(0);
}


/**
 * Run when mouse button is released in canvas (or exiting canvas)
 * @param {MouseEvent} e
 * @private
 */
function _up(e) {
    isHover = false;

    // real work
    isDown = false; // clear isDown flag to stop drawing

    switch (document.querySelector('input[type=radio][name=tool]:checked').value) {
        case '-2': // Edit Tool
            if ((slctd.i === undefined)) return; // if none selected, don't do anything
            switch (marks[slctd.i].type) {
                case 0: // Circle
                    if (marks[slctd.i].d < SETTINGS.minCraterSize)
                        delMark(slctd.i);
                    break;
                case 1: // Line
                    if (marks[slctd.i].length < SETTINGS.minLineLength)
                        delMark(slctd.i);
                    break;
            }
            slctd = {};
            break;
        case '0': // Circle Tool
            if (marks[i] === undefined) return; // if already up, don't do anything
            if (marks[i].d < SETTINGS.minCraterSize)
                delMark(i);
            break;
        case '1': // Line Tool
            if (marks[i] === undefined) return; // if mark does not exist, don't do anything
            if (marks[i].length < SETTINGS.minLineLength)
                delMark(i);
            break;
        case '2': // Point
            if (marks[i] === undefined) return; // if mark does not exist, don't do anything
            break;
    }

    reDraw();

    // nice looking stuff
    let cv = getPosition(CSB_APP.canvas, e);
    TEXT_INFO.endCoords.innerText = `[${cv.x},${cv.y}]`;
    TEXT_INFO.mouseDown.innerText = 'False';

    i = marks.length;
    return void(0);
}


/**
 * Activated during click events
 * <br>
 * *Note click events are set to run immediately AFTER {@link _up mouseup} events
 * [src: {@link https://stackoverflow.com/questions/34715420/mouseup-vs-click|here}]
 * @param {MouseEvent} e
 * @private
 */
function _click(e) {
    isDown = false;
    TEXT_INFO.mouseDown.innerText = 'False';

    switch (document.querySelector('input[type=radio][name=tool]:checked').value) {
        case "-1": // Delete Tool
        case "-2":
            let nr = getNearest(CSB_APP.canvas, e);
            reDraw(nr); // highlight selected
            slctd = {};
            break;
    }
    return void(0);
}


/**
 * Clears the canvas
 */
function clearCanvas() {
    CSB_APP.ctx.clearRect(0, 0, CSB_APP.canvas.width, CSB_APP.canvas.height);
    return void(0);
}


/**
 * POSTs data (marks array) to post.php
 *
 * Proof of concept
 * @private
 */
function _send() {
    let data = `marks=${JSON.stringify(marks)}`;
    let http = new XMLHttpRequest();

    http.addEventListener('readystatechange', (r) => {
        let rsp = r.target;
        if (rsp.readyState === 4 && rsp.status === 200) {
            document.getElementById('data').innerText = rsp.responseText;
        }
    })
    http.open('POST', 'post.php');
    http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    http.send(data);
}


/**
 * GETs data from request.php
 *
 * Proof of concept
 * @private
 */
function _receive() {
    let http = new XMLHttpRequest();
    http.addEventListener('readystatechange', (r) => {
        let rsp = r.target;
        if (rsp.readyState === 4 && rsp.status === 200) {
            document.getElementById('data').innerText = rsp.responseText;
        }
    })
    http.open('GET', 'request.php');
    http.send();
}


/**
 * On keypress, run
 * @param {KeyboardEvent} e
 * @private
 */
function _keyPress(e) {
    if (!isHover) return;
    console.info(e.key);
    switch (e.key) {
        case 'd': // d - Delete
        case 'D':
            e.preventDefault();
            document.querySelector('#delTool').click();
            break;
        case 'c': // c - Circle
        case 'C':
            e.preventDefault();
            document.querySelector('#circleTool').click();
            break;
        case 'l': // l - Line
        case 'L':
            e.preventDefault();
            document.querySelector('#lineTool').click();
            break;
        case 'p': // p - Point
        case 'P':
            e.preventDefault();
            document.querySelector('#pointTool').click();
            break;
        case 'e': // e - Edit
        case 'E':
            e.preventDefault();
            document.querySelector('#editTool').click();
            break;
    }
}


// Event Listeners

/**
 * Prevents fast-clicks from keeping isDown true
 */
addEventListener('click', _click);

CSB_APP.canvas.addEventListener('mousedown', _down);

CSB_APP.canvas.addEventListener('mousemove', _move);

addEventListener('mouseup', _up);

addEventListener('mouseleave', _up);

addEventListener('mouseout', _up);

addEventListener('keypress', _keyPress);


reDraw();


/* Sources & Starting Points:
 *
 * How to calculate the new coordinates by rotation of axes
 * https://keisan.casio.com/exec/system/1223522781
 *
 *
 * https://stackoverflow.com/questions/32736999/remove-circle-drawn-in-html5-canvas-once-user-clicks-on-it
 *
 *
 * https://developer.mozilla.org/en-US/docs/Web/API/Path2D/Path2D
 *
 *
 * https://stackoverflow.com/questions/21594756/drawing-circle-ellipse-on-html5-canvas-using-mouse-events
*/