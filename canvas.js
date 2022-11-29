/*
 * Name: Canvas
 * File: canvas.js
 * Author: The Real Fake Admin
 * Description: Runs the main portion of the CSB App Canvas
 *
 * NOTE FOR ALL FUTURE DEVELOPERS : The Y-Axis is inverted (top-to-bottom),
 *  the X-Axis still goes the common direction (right-to-left)!!!
 *  [0,0] is Top-Right
 */

Object.assign(window, {
    SETTINGS: {

        // --- Start of Settings --- //

        /// Circles / Craters
        minCraterSize: 18, // Minimum crater size
        rszCircleThresh: 5, // Threshold (like radius) of circle resize (Edit Tool)
        delCircleDistThresh: 5, // Maximum distance to center to delete a circle (Delete Tool)


        /// Points
        pointRadius: 10, // Radius of the point
        delPointMaxDist: 10, // Maximum distance to delete a point (Delete Tool)

        /// Lines
        delLineMaxDist: 10, // Maximum distance to delete a line (Delete Tool)
        minLineLength: 45, // Minimum length of a line
        endPtMaxDist: 5, // Maximum distance to select end-point (Edit Tool)

        // Rectangles
        delRectangleMaxDist: 10, // Maximum distance to delete a rectangle (Delete Tool)
        minRectangleSideLength: 5, // Minimum length of any side for a rectangle
        minRectangleArea: 0, // Minimum area of a rectangle
        maxVertexDistance: 10, // Maximum distance to vertex (Edit Tool)
        maxRectangleSideDist: 10, // Maximum distance to move rectangle (Edit Tool)

        // TODO : Do I make 3 objects in styles for each mode [default, selected, bad], or do I make a variable in styles for each variation [circleStroke, slctdCircleStroke, badCircleStroke]?
        styles: { // NOT USED YET - contains the styling for each mark
            // Circles
            circleStroke: "",
            circleFill: "",
            circleLineWidth: "",

            // Points
            pointStroke: "",
            pointFill: "",

            // Lines
            lineStroke: "",
            lineWidth: "",

            // Rectangles
            rectangleStroke: "",
            rectangleFill: "",
            rectangleLineWidth: ""
        }

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
        ctx: this.canvas.getContext("2d")
    },
    LOREM_IPSUM: { // TODO : Choose a better name
        marks: [], // List of all marks
        selected: {}, // Selected mark
        latest: {
            i: 0,
            center: undefined,
            radius: undefined
        }, // Latest information data, used for text bellow canvas
        isDown: false, // True when mouse is down over canvas
        isHover: false // True when mouse hovers over canvas
    },
    MARKS: new Map()
});


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


/**
 * Makes all rectangles standardized.
 *
 * @example new Rectangle(10, 12, 32, 64)
 */
class Rectangle {
    /**
     * Creates the representation of a rectangle. Used in marks array.
     * @param {number} x1 - Point-1 X-Coord
     * @param {number} y1 - Point-1 Y-Coord
     * @param {number} x2 - Point-2 X-Coord
     * @param {number} y2 - Point-2 Y-Coord
     *
     * @returns {{timestamp: number, type: 3, x1: number, y1: number, x2: number, y2: number, params: {x: number, y: number, width: number, height: number}, area: number}}
     */
    constructor(x1, y1, x2, y2) {
        this.timestamp = Date.now();
        this.type = 3;

        this.x1 = x1;
        this.y1 = y1;

        this.x2 = x2;
        this.y2 = y2;

        this.params = {
            x: ((x1 < x2) ? x1 : x2),
            y: ((y1 < y2) ? y1 : y2),
            width: (Math.abs(x1 - x2)),
            height: (Math.abs(y1 - y2))
        }
        /*
            v0     v1

            v3     v2
         */
        let v0x, v1x, v2x, v3x, v0y, v1y, v2y, v3y;

        if (x1 < x2) {
            if (y1 > y2) { // (x1 < x2 && y1 < y2)
                v0x = x1;
                v0y = y2;

                v1x = x2;
                v1y = y2;

                v2x = x2;
                v2y = y1;

                v3x = x1;
                v3y = y1;
            } else {       // (x1 < x2 && y2 < y1)
                v0x = x1;
                v0y = y1;

                v1x = x2;
                v1y = y1;

                v2x = x2;
                v2y = y2;

                v3x = x1;
                v3y = y2;
            }
        } else { // (x2 < x1)
            if (y1 > y2) { // (x2 < x1 && y1 < y2)
                v0x = x2;
                v0y = y2;

                v1x = x1;
                v1y = y2;

                v2x = x1;
                v2y = y1;

                v3x = x2;
                v3y = y1;
            } else {       // (x2 < x1 && y2 < y1)
                v0x = x2;
                v0y = y1;

                v1x = x1;
                v1y = y1;

                v2x = x1;
                v2y = y2;

                v3x = x2;
                v3y = y2;
            }
        }

        this.vertices = [
            { // v0
                x: v0x,
                y: v0y
            },
            { // v1
                x: v1x,
                y: v1y
            },
            { // v2
                x: v2x,
                y: v2y
            },
            { // v3
                x: v3x,
                y: v3y
            }
        ]

        let v = this.vertices;
        this.lines = [
            [
                {
                    x: v[0].x,
                    y: v[0].y
                },
                {
                    x: v[1].x,
                    y: v[1].y
                }
            ],
            [
                {
                    x: v[1].x,
                    y: v[1].y
                },
                {
                    x: v[2].x,
                    y: v[2].y
                }
            ],
            [
                {
                    x: v[2].x,
                    y: v[2].y
                },
                {
                    x: v[3].x,
                    y: v[3].y
                }
            ],
            [
                {
                    x: v[3].x,
                    y: v[3].y
                },
                {
                    x: v[0].x,
                    y: v[0].y
                }
            ]
        ]

        this.area = this.params.width + this.params.height;
    }
}


// Setup Functions

// /**
//  * Using the offset of the canvas from the page [0,0], the mouse position is calculated
//  * to get the position of the point [P0] in the canvas.
//  *
//  * @summary Gets mouse position using canvas as reference.
//  * @param {HTMLCanvasElement} canvas - Target canvas
//  * @param {MouseEvent} event - Mouse event
//  * @returns {{x: number, y: number}} - True coords
//  * @private
//  */
// function _getMousePos(canvas, event) { // REMEMBER : This is like a percentage/scale
//     let rect = canvas.getBoundingClientRect(); // Bounding box of the canvas
//     let scaleX = canvas.width / rect.width,    // relationship bitmap vs. element for x
//         scaleY = canvas.height / rect.height;  // relationship bitmap vs. element for y
//
//     return {
//         x: (event.clientX - rect.left) * scaleX,   // scale mouse coordinates after they have
//         y: (event.clientY - rect.top) * scaleY     // been adjusted to be relative to element
//     }
// }


/**
 * Using the offset of the canvas from the page [0,0], the mouse position is calculated
 * to get the position of the point [P0] in the canvas.
 *
 * @summary Get position of mouse relative to Canvas
 * @param {HTMLCanvasElement} canvas - Target canvas
 * @param {MouseEvent} event - Mouse event
 * @param {number|boolean} [toFixed=false] - `Number.prototype.toFixed` argument
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


function _Rectangle2D(x, y, width, height) {
    let rct = new Path2D();
    rct.rect(x, y, width, height);
    return rct;
}


function addRectangleP2P(x1, y1, x2, y2, index) {
    let rct = new Rectangle(x1, y1, x2, y2);

    if (typeof index === "number" && 0 <= index) // if index is specified
        LOREM_IPSUM.marks[index] = rct;
    else
        LOREM_IPSUM.marks.push(rct);

    return void(0);
}


/**
 * Clears canvas then loops through all marks to re-draw
 *
 * @param {number} [i] - index to highlight
 * @param {number} [mode=0] - Stroke mode [0: Default, 1: Stroke Only, 2: Fill Only]
 * @note ctx.strokeStyle = "#f8b31f";<br>ctx.fillStyle = "#f8b31f33";
 */
function reDraw(i, mode=0) { if (DEBUG.enabled) console.debug(i, mode);
    let tmp, v, ctx = CSB_APP.ctx;
    clearCanvas();

    for(let j = 0; j < LOREM_IPSUM.marks.length; j++) {
        v = LOREM_IPSUM.marks[j];
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
                    switch (mode) {
                        case 0: // Highlight All
                            ctx.strokeStyle = "#fff";
                            ctx.fillStyle = "#fff3";
                            break;
                        case 1: // Highlight Stroke
                            ctx.strokeStyle = "#fff";
                            ctx.fillStyle = "#FF00CC33"; // #f8b31f33
                            break;
                        case 2: // Highlight Fill
                            ctx.strokeStyle = "#FF33D6"; // #f8b31f
                            ctx.fillStyle = "#fff3";
                            break;
                    }
                } else {
                    ctx.strokeStyle = "#FF33D6"; // #f8b31f
                    ctx.fillStyle = "#FF00CC33"; // #f8b31f33
                }

                ctx.stroke(tmp);
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
                    ctx.strokeStyle = "#6e35caaa"; // #5a368daa // #601a4aaa
                }
                ctx.closePath();
                ctx.stroke(tmp);
                break;
            case 2: // Point
                tmp = _Point2D(v.x, v.y);
                ctx.lineWidth = 0;
                if (j === i) { // if Selected
                    ctx.fillStyle = "#fffa";
                } else {
                    ctx.fillStyle = "#ff0a"; // #a77311aa
                }

                ctx.fill(tmp, "nonzero");
                break;
            case 3: // Rectangle
                tmp = _Rectangle2D(v.params.x, v.params.y, v.params.width, v.params.height);
                ctx.lineWidth = 2;
                if (v.params.width < SETTINGS.minRectangleSideLength || v.params.height < SETTINGS.minRectangleSideLength || v.area < SETTINGS.minRectangleArea) {
                    ctx.strokeStyle = "#f00";
                    ctx.fillStyle = "#f003";
                } else if (j === i) { // if Selected
                    ctx.strokeStyle = "#fff";
                    ctx.fillStyle = "#fff3";
                } else {
                    ctx.strokeStyle = "#33FF99"; // #f8b31f
                    ctx.fillStyle = "#00FF7F66"; // #f8b31f33
                }
                ctx.stroke(tmp);
                ctx.fill(tmp, "nonzero");
                break;
        }
    }
    return void(0);
}


/**
 * Deletes selected mark
 * @param {number} i - index of mark
 */
function delMark(i) {
    LOREM_IPSUM.marks.splice(i, 1);
    reDraw();
    return void(0);
}


/**
 * Deletes the latest mark*
 *
 * *Does not go off of timestamps
 */
function delLastMark() {
    delMark(LOREM_IPSUM.marks.length - 1);
    return void(0);
}


/**
 * Calculates the distance of all marks to the mouse cursor then returns the index of the nearest mark.
 * @param {HTMLCanvasElement} canvas - Target Canvas
 * @param {MouseEvent} e - Mouse Event
 * @param {number} [limit] - If 1, circle max distance is `radius+SETTINGS.rszCircleThresh`; If 2, only outlines
 * @returns {number} - Index of the nearest mark
 */
function getNearest(canvas, e, limit=1) {console.debug(`getNearest(${JSON.stringify(canvas)}, ${JSON.stringify(e)}, ${limit})`);
    let tempDist,                    // Temporary distance
        best = Infinity,
        bestDist = Infinity, // Best Mark, Best Distance
        msPs = getPosition(canvas, e),

        x0 = msPs.x,
        y0 = msPs.y,

        x, y, x1, y1, x2, y2;

    LOREM_IPSUM.marks.forEach((v, i) => {
        switch (v.type) { // Go by type of mark [0: Circle; 1: Line; 2: Point]
            case 0: // Circle
                x = v.x; // Center Point
                y = v.y;
                tempDist = distanceCalc(x, y, x0, y0);

                switch (limit) {
                    case 0: // Default | Outer Circle Selection Only
                        let bst = Math.abs(tempDist - v.r);
                        if (bestDist >= bst && (v.r + SETTINGS.delCircleDistThresh) >= tempDist && (v.r - SETTINGS.delCircleDistThresh) <= tempDist) { // closer or equal to last best & no further than radius
                            bestDist = bst;
                            best = i;
                        }
                        break;
                    case 1: // Full circle selection + rszThresh
                        if (bestDist >= tempDist && (v.r + SETTINGS.rszCircleThresh) >= tempDist && tempDist <= (v.r + SETTINGS.rszCircleThresh)) { // closer or equal to last best & no further than radius
                            bestDist = tempDist;
                            best = i;
                        }
                        break;
                }
                break;
            case 1: // Line
                x1 = v.x1; // End-Point 1
                y1 = v.y1;
                x2 = v.x2; // End-Point 2
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
                        let ang = (v.angle - 180), // Angle to get to 18
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
            case 3: // Rectangle
                let l = v.lines,
                    td,
                    b = Infinity,
                    bd = Infinity;

                for (let j = 0; j < l.length; j++) {
                    let ln = l[j];
                    x1 = ln[0].x;
                    y1 = ln[0].y;
                    x2 = ln[1].x;
                    y2 = ln[1].y;

                    switch (j) {
                        case 0: // AB ->
                            if (x0 <= x1) {
                                td = distanceCalc(x0, y0, x1, y1);
                            } else if (x0 >= x2) {
                                td = distanceCalc(x0, y0, x2, y2);
                            } else {
                                td = distanceCalc(x0, y0, x0, y1);
                            }
                            break;
                        case 1: // DA |v
                            if (y0 <= y1) {
                                td = distanceCalc(x0, y0, x1, y1);
                            } else if (y0 >= y2) {
                                td = distanceCalc(x0, y0, x2, y2);
                            } else {
                                td = distanceCalc(x0, y0, x1, y0);
                            }
                            break;
                        case 2: // CD <-
                            if (x0 >= x1) {
                                td = distanceCalc(x0, y0, x1, y1);
                            } else if (x0 <= x2) {
                                td = distanceCalc(x0, y0, x2, y2);
                            } else {
                                td = distanceCalc(x0, y0, x0, y1);
                            }
                            break;
                        case 3: // BC |^
                            if (y0 >= y1) {
                                td = distanceCalc(x0, y0, x1, y1);
                            } else if (y0 <= y2) {
                                td = distanceCalc(x0, y0, x2, y2);
                            } else {
                                td = distanceCalc(x0, y0, x1, y0);
                            }
                            break;
                    }


                    if (bd >= td && SETTINGS.maxRectangleSideDist >= td) { // closer than last best & no further than radius
                        bd = td;
                        b = i;
                    }
                    console.debug(bd, b, td);
                }

                if (bestDist >= bd && SETTINGS.delPointMaxDist >= bd) { // closer than last best & no further than radius
                    bestDist = bd;
                    best = i;
                }
                break;
        }
    })

    return best; // if none, Infinity deletes nothing in delMark
}


/**
 * Returns line endpoint nearest to the mouse
 * @param {number} index - Index number for `marks`
 * @param {{x: number, y: number}} msPs - Mouse position ({@link getPosition})
 * @returns {number} - Endpoint [P1=>1, P2=>2]
 */
function getEndPt (index, msPs) {
    let mk = LOREM_IPSUM.marks[index];
    let vt = Infinity, dist,
        x0 = msPs.x, y0 = msPs.y;
    switch (mk.type) {
        case 1: // Line // Represents which end-point is closest; 1 or 2
            let d1 = distanceCalc(x0, y0, mk.x1, mk.y1),
                d2 = distanceCalc(x0, y0, mk.x2, mk.y2),
                pn;
                dist = Math.min(d1, d2); // Gets the nearest distance

            switch (dist) {
                case d1:
                    pn = 1;
                    break;
                case d2:
                    pn = 2;
                    break;
            }

            if (SETTINGS.endPtMaxDist >= dist) { // if close enough to end point
                vt = pn;
            }
            break;
        case 3: // Rectangle
            let v = mk.vertices,
                v0d = distanceCalc(x0, y0, v[0].x, v[0].y), // Distances of different vertices
                v1d = distanceCalc(x0, y0, v[1].x, v[1].y),
                v2d = distanceCalc(x0, y0, v[2].x, v[2].y),
                v3d = distanceCalc(x0, y0, v[3].x, v[3].y),
                vn;
                dist = Math.min(v0d, v1d, v2d, v3d); // Returns the nearest vertex

            switch (dist) {
                case v0d:
                    vn = 0;
                    break;
                case v1d:
                    vn = 1;
                    break;
                case v2d:
                    vn = 2;
                    break;
                case v3d:
                    vn = 3;
                    break;
            }

            if (dist <= SETTINGS.maxVertexDistance) { // if close enough to vertex
                vt = vn;
            }
            break;
    }

    return vt;
}


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
 * @param {boolean} [rad=true] - Set as false to use degrees with r
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
 * Rotates a point around another.
 * @param {Array[[[x: number, y: number], ...[x: number, y: number]]]} c - Array of points to be rotated
 * @param {Array[[x: number, y: number]]} rp - Point to rotate around; Represented as an array
 * @param {number} r - Amount of rotation in radians
 * @param {boolean} [rad=true] - Set as false to use degrees with r
 */
function rotatePoint(c, rp, r, rad=true) {
    if (!Array.isArray(c) || !Number.isFinite(r)) return void(0); // if not correct types, return void

    if (rad === false) { // Converts to radians if rad === false
        r = r*(Math.PI/180);
    }

    let resp = c, // Response variable
        px, py, // Point to rotate
        cx = rp[0], // Center of rotation
        cy = rp[1],
        rx, ry; // Rotated point

    c.forEach((v, i) => { // For every point in c, rotate
        px = v[0];
        py = v[1];

        rx = Math.cos(r) * (px - cx) - Math.sin(r) * (py - cy) + cx;
        ry = Math.sin(r) * (px - cx) + Math.cos(r) * (py - cy) + cy;

        resp[i][0] = rx;
        resp[i][1] = ry;
    })

    return resp;
}


/**
 * Clears the canvas
 */
function clearCanvas() {
    CSB_APP.ctx.clearRect(0, 0, CSB_APP.canvas.width, CSB_APP.canvas.height);
    return void(0);
}


/**
 * Clamps number within range. Numbers out of range are set to the nearest min/max.
 * @param {number} num - Number to clamp
 * @param {number} min - Minimum allowed value
 * @param {number} max - Maximum allowed value
 * @returns {number}
 */
Math.clamp = (num, min, max) => Math.min(Math.max(num, min), max); // Clamps number within range


/**
 * Run when mouse button is pressed in canvas
 * @param {MouseEvent} e
 * @private
 */
function _down(e) {
    if (LOREM_IPSUM.isDown || e.button !== 0) { // left/main click === e.button of 0
        _up(e);
        return;
    }

    LOREM_IPSUM.isDown = true;
    LOREM_IPSUM.latest.i = LOREM_IPSUM.marks.length;

    let pos = getPosition(CSB_APP.canvas, e);
    LOREM_IPSUM.latest.x1 = pos.x;
    LOREM_IPSUM.latest.y1 = pos.y;

    TEXT_INFO.mouseDown.innerText = "True";

    let nr;
    switch (document.querySelector('input[type=radio][name=tool]:checked').value) {
        case "-2": // Edit Tool
            if ((nr = getNearest(CSB_APP.canvas, e)) === Infinity) break;

            LOREM_IPSUM.selected.i = nr;
            switch (LOREM_IPSUM.marks[nr].type) {
                case 0: // Circle
                    let dst = distanceCalc(pos.x, pos.y, LOREM_IPSUM.marks[nr].x, LOREM_IPSUM.marks[nr].y);

                    if (dst >= (LOREM_IPSUM.marks[nr].r - SETTINGS.rszCircleThresh) && dst <= (LOREM_IPSUM.marks[nr].r + SETTINGS.rszCircleThresh)) { // if distance to center is within threshold, do resize mode
                        LOREM_IPSUM.selected.mode = 1; // Resize Mode
                    } else { // else, do move mode
                        LOREM_IPSUM.selected.mode = 2; // Move mode continues to next case
                        LOREM_IPSUM.selected.offset = [(LOREM_IPSUM.marks[nr].x - pos.x), (LOREM_IPSUM.marks[nr].y - pos.y)];
                    }
                    break;
                case 1: // Line
                    LOREM_IPSUM.selected.vertexId = getEndPt(nr, pos);
                    break;
                case 2: // Point
                    LOREM_IPSUM.selected.offset = [(LOREM_IPSUM.marks[nr].x - pos.x), (LOREM_IPSUM.marks[nr].y - pos.y)];
                    break;
                case 3: // Rectangle
                    LOREM_IPSUM.selected.vertexId = getEndPt(LOREM_IPSUM.selected.i, pos);
                    switch (LOREM_IPSUM.selected.vertexId) {
                        case 0: // Top-Left Vertex
                            LOREM_IPSUM.selected.x2 = LOREM_IPSUM.marks[nr].vertices[2].x; // Opposite Vertex
                            LOREM_IPSUM.selected.y2 = LOREM_IPSUM.marks[nr].vertices[2].y;
                            break;
                        case 1: // Top-Right Vertex
                            LOREM_IPSUM.selected.x2 = LOREM_IPSUM.marks[nr].vertices[3].x; // Opposite Vertex
                            LOREM_IPSUM.selected.y2 = LOREM_IPSUM.marks[nr].vertices[3].y;
                            break;
                        case 2: // Bottom-Right Vertex
                            LOREM_IPSUM.selected.x2 = LOREM_IPSUM.marks[nr].vertices[0].x; // Opposite Vertex
                            LOREM_IPSUM.selected.y2 = LOREM_IPSUM.marks[nr].vertices[0].y;
                            break;
                        case 3: // Bottom-Left Vertex
                            LOREM_IPSUM.selected.x2 = LOREM_IPSUM.marks[nr].vertices[1].x; // Opposite Vertex
                            LOREM_IPSUM.selected.y2 = LOREM_IPSUM.marks[nr].vertices[1].y;
                            break;
                        default: // Infinity / Move Mode
                            LOREM_IPSUM.selected.offset = [
                                [(LOREM_IPSUM.marks[nr].x1 - pos.x), (LOREM_IPSUM.marks[nr].y1 - pos.y)],
                                [(LOREM_IPSUM.marks[nr].x2 - pos.x), (LOREM_IPSUM.marks[nr].y2 - pos.y)]
                            ];
                            break;
                    }
                    break;
            }
            break;
        case "-1": // Delete Tool
            nr = getNearest(CSB_APP.canvas, e, 0);
            delMark(nr);
            return void(0);
        case "0": // Circle Tool
            // nice looking stuff
            TEXT_INFO.startCoords.innerText = `[${LOREM_IPSUM.latest.x1.toFixed(0)},${LOREM_IPSUM.latest.y1.toFixed(0)}]`;
            break;
        case "1": // Line Tool
            TEXT_INFO.startCoords.innerText = `[${LOREM_IPSUM.latest.x1.toFixed(0)},${LOREM_IPSUM.latest.y1.toFixed(0)}]`;
            break;
        case "2": // Point Tool
            addPoint(LOREM_IPSUM.latest.x1, LOREM_IPSUM.latest.y1, LOREM_IPSUM.latest.i);
            reDraw();
            LOREM_IPSUM.latest.i++;
            break;
        case "3": // Rectangle Tool
            TEXT_INFO.startCoords.innerText = `[${LOREM_IPSUM.latest.x1.toFixed(0)},${LOREM_IPSUM.latest.y1.toFixed(0)}]`;
            break
    }
    return void(0);
}


/**
 * Run when mouse is moved on canvas
 * @param {MouseEvent} e
 * @private
 */
function _move(e) {
    LOREM_IPSUM.isHover = true;

    let pos = getPosition(CSB_APP.canvas, e);
    LOREM_IPSUM.latest.x2 = pos.x;
    LOREM_IPSUM.latest.y2 = pos.y;

    /// Setting Coords
    TEXT_INFO.coords.innerText = `[${LOREM_IPSUM.latest.x2},${LOREM_IPSUM.latest.y2}]`;

    let mk, nr, dst, x, y, x1, y1, x2, y2, skip=false; // Keeping skip for now, not sure if it will be needed again
    switch (document.querySelector('input[type=radio][name=tool]:checked').value) {
        case "-2": // Edit Tool
            mk = LOREM_IPSUM.marks[LOREM_IPSUM.selected.i];
            nr = LOREM_IPSUM.selected.i ?? getNearest(CSB_APP.canvas, e); // If none selected, use nearest
            reDraw(nr); // highlight selected

            if (LOREM_IPSUM.selected.i === undefined || mk === undefined) return; // if no selected index/mark exists, return

            switch (mk.type) {
                case 0: // Circle
                    switch (LOREM_IPSUM.selected.mode) {
                        case 1: // Resize
                            switch (skip) {
                                case false:
                                    dst = distanceCalc(pos.x, pos.y, mk.x, mk.y);
                                    addCirclePR(mk.x, mk.y, dst, LOREM_IPSUM.selected.i);
                                    reDraw(nr, 1); // highlight selected
                                    break;
                                case true:
                                    reDraw(nr, 1); // highlight selected
                                    return;
                            }
                            break;
                        case 2: // Move
                            switch (skip) {
                                case false:
                                    x = pos.x + LOREM_IPSUM.selected.offset[0];
                                    y = pos.y + LOREM_IPSUM.selected.offset[1];
                                    addCirclePR(x, y, mk.r, LOREM_IPSUM.selected.i);
                                    reDraw(nr, 2); // highlight selected
                                    break;
                                case true:
                                    reDraw(nr, 2); // highlight selected
                                    return;
                            }
                            break;
                    }
                    break;
                case 1: // Line
                    if (skip) return;

                    switch (LOREM_IPSUM.selected.vertexId) {
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
                    drawLineP2P(x1, y1, x2, y2, LOREM_IPSUM.selected.i);
                    reDraw(nr); // highlight selected
                    break;
                case 2: // Point
                    if (skip) return;
                    x = pos.x + LOREM_IPSUM.selected.offset[0];
                    y = pos.y + LOREM_IPSUM.selected.offset[1];
                    addPoint(x, y, LOREM_IPSUM.selected.i);
                    reDraw(nr); // highlight selected
                    break;
                case 3: // Rectangle
                    x = pos.x;
                    y = pos.y;

                    switch (LOREM_IPSUM.selected.vertexId) {
                        case Infinity: // Infinity / Move Mode
                            let o = LOREM_IPSUM.selected.offset;

                            x1 = (x + o[0][0]);
                            y1 = (y + o[0][1]);
                            x2 = (x + o[1][0]);
                            y2 = (y + o[1][1]);

                            addRectangleP2P(x1, y1, x2, y2, nr);
                            reDraw(nr);
                            break;
                        default: // Vertex Selection
                            x2 = LOREM_IPSUM.selected.x2; // Opposite Vertex
                            y2 = LOREM_IPSUM.selected.y2;

                            addRectangleP2P(x, y, x2, y2, nr);
                            reDraw(nr);
                            break;
                    }
            }
            //reDraw(LOREM_IPSUM.selected.i);
            break;
        case "-1": // Delete Tool
            nr = getNearest(CSB_APP.canvas, e, 0);
            reDraw(nr); // highlight selected
            break;
        case "0": // Circle Tool
            if (LOREM_IPSUM.isDown) { // if not Tool but is mousedown
                /// draw ellipse
                addCircleP2P(LOREM_IPSUM.latest.x1, LOREM_IPSUM.latest.y1, LOREM_IPSUM.latest.x2, LOREM_IPSUM.latest.y2, LOREM_IPSUM.latest.i);
                reDraw(LOREM_IPSUM.latest.i, 1);

                // Setting End Coords
                TEXT_INFO.endCoords.innerText = `[${LOREM_IPSUM.latest.x2},${LOREM_IPSUM.latest.y2}]`;
            }
            break;
        case "1": // Line Tool
            if (LOREM_IPSUM.isDown) {
                // Draw Line
                drawLineP2P(LOREM_IPSUM.latest.x1, LOREM_IPSUM.latest.y1, LOREM_IPSUM.latest.x2, LOREM_IPSUM.latest.y2, LOREM_IPSUM.latest.i);
                reDraw(LOREM_IPSUM.latest.i);

                // Setting End Coords
                TEXT_INFO.endCoords.innerText = `[${LOREM_IPSUM.latest.x2},${LOREM_IPSUM.latest.y2}]`;
            }
            break;
        case "2": // Point Tool
            break;
        case "3": // Rectangle Tool
            if (LOREM_IPSUM.isDown) {
                // Draw Rectangle
                addRectangleP2P(LOREM_IPSUM.latest.x1, LOREM_IPSUM.latest.y1, LOREM_IPSUM.latest.x2, LOREM_IPSUM.latest.y2, LOREM_IPSUM.latest.i);
                reDraw(LOREM_IPSUM.latest.i);

                // Setting End Coords
                TEXT_INFO.endCoords.innerText = `[${LOREM_IPSUM.latest.x2},${LOREM_IPSUM.latest.y2}]`;
            }
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
    LOREM_IPSUM.isHover = false;

    // real work
    LOREM_IPSUM.isDown = false; // clear isDown flag to stop drawing

    switch (document.querySelector('input[type=radio][name=tool]:checked').value) {
        case '-2': // Edit Tool
            if ((LOREM_IPSUM.selected.i === undefined)) return; // if none selected, don't do anything
            switch (LOREM_IPSUM.marks[LOREM_IPSUM.selected.i].type) {
                case 0: // Circle
                    if (LOREM_IPSUM.marks[LOREM_IPSUM.selected.i].d < SETTINGS.minCraterSize)
                        delMark(LOREM_IPSUM.selected.i);
                    break;
                case 1: // Line
                    if (LOREM_IPSUM.marks[LOREM_IPSUM.selected.i].length < SETTINGS.minLineLength)
                        delMark(LOREM_IPSUM.selected.i);
                    break;
                case 3: // Rectangle
                    let v = LOREM_IPSUM.marks[LOREM_IPSUM.selected.i];
                    if (v.params.width < SETTINGS.minRectangleSideLength || v.params.height < SETTINGS.minRectangleSideLength || v.area < SETTINGS.minRectangleArea)
                        delMark(LOREM_IPSUM.selected.i);
                    break;
            }
            LOREM_IPSUM.selected = {};
            break;
        case '0': // Circle Tool
            if (LOREM_IPSUM.marks[LOREM_IPSUM.latest.i] === undefined) return; // if already up, don't do anything
            if (LOREM_IPSUM.marks[LOREM_IPSUM.latest.i].d < SETTINGS.minCraterSize)
                delMark(LOREM_IPSUM.latest.i);
            break;
        case '1': // Line Tool
            if (LOREM_IPSUM.marks[LOREM_IPSUM.latest.i] === undefined) return; // if mark does not exist, don't do anything
            if (LOREM_IPSUM.marks[LOREM_IPSUM.latest.i].length < SETTINGS.minLineLength)
                delMark(LOREM_IPSUM.latest.i);
            break;
        case '2': // Point
            if (LOREM_IPSUM.marks[LOREM_IPSUM.latest.i] === undefined) return; // if mark does not exist, don't do anything
            break;
        case '3': // Rectangle Tool
            if (LOREM_IPSUM.marks[LOREM_IPSUM.latest.i] === undefined) return; // if mark does not exist, don't do anything

            let v = LOREM_IPSUM.marks[LOREM_IPSUM.latest.i];
            if (v.params.width < SETTINGS.minRectangleSideLength || v.params.height < SETTINGS.minRectangleSideLength || v.area < SETTINGS.minRectangleArea)
                delMark(LOREM_IPSUM.latest.i);
            break;
    }

    reDraw();

    // nice looking stuff
    let cv = getPosition(CSB_APP.canvas, e);
    TEXT_INFO.endCoords.innerText = `[${cv.x},${cv.y}]`;
    TEXT_INFO.mouseDown.innerText = 'False';

    LOREM_IPSUM.latest.i = LOREM_IPSUM.marks.length;
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
    LOREM_IPSUM.isDown = false;
    TEXT_INFO.mouseDown.innerText = 'False';

    switch (document.querySelector('input[type=radio][name=tool]:checked').value) {
        case "-1": // Delete Tool
            if (e.target.id === "canvas") {
                let nr = getNearest(CSB_APP.canvas, e, 0);
                reDraw(nr); // highlight selected
            }
            LOREM_IPSUM.selected = {};
            break;
        case "-2": // Edit Tool
            if (e.target.id === "canvas") {
                let nr = getNearest(CSB_APP.canvas, e);
                reDraw(nr); // highlight selected
            }
            LOREM_IPSUM.selected = {};
            break;
    }
    return void(0);
}




/**
 * POSTs data (marks array) to post.php
 *
 * Proof of concept
 * @private
 */
function _send() {
    let data = `marks=${JSON.stringify(LOREM_IPSUM.marks)}`;
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
    if (!LOREM_IPSUM.isHover) return;
    if (DEBUG.enabled) console.info(e.key);
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
        case 'r':
        case 'R':
            e.preventDefault();
            document.querySelector('#rectangleTool').click();
            break;
        default:
            return;
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