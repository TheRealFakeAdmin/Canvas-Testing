import { _Circle2D } from './circle.js';
import { _Line2D } from './line.js';
import { _Point2D } from './point.js';
import { _Rectangle2D } from './rectangle.js';

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
function getNearest(canvas, e, limit=1) {
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
                            
                            // Save new point values
                            rx0 = pr[0][0], // Rotated Point 0 [Mouse]
                            ry0 = pr[0][1],
                            rx1 = pr[1][0], // Rotated Point 1 [P1]
                            ry1 = pr[1][1],
                            rx2 = pr[2][0], // Rotated Point 2 [P2]
                            ry2 = pr[2][1];

                        if (rx0 <= rx1) {
                            tempDist = distanceCalc(rx0, ry0, rx1, ry1);
                        } else if (rx0 >= rx2) {
                            tempDist = distanceCalc(rx0, ry0, rx2, ry2);
                        } else {
                            tempDist = distanceCalc(rx0, ry0, rx0, ry1);
                        }
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

export { getPosition, reDraw, delMark, delLastMark, getNearest, getEndPt, distanceCalc, rotateAxis, rotatePoint, clearCanvas }