// Settings

const minCraterSize     = 18; // Minimum crater size
const delCircleMaxDist  = 25; // Maximum distance to center to delete a circle (Delete Tool)
const pointRadius       = 10; // Radius of the point
const delPointMaxDist   = 10; // Maximum distance to delete a point (Delete Tool)
const delLineMaxDist    = 10; // Maximum distance to delete a line (Delete Tool)
const minLineLength     = 45;  // Minimum length of a line

const _tempTestOne = [{"timestamp":1665670727055,"type":0,"x":113,"y":270.5,"d":46.010868281309364,"r":23.005434140654682},{"timestamp":1665670729802,"type":0,"x":263.5,"y":13,"d":143.68368035375485,"r":71.84184017687743},{"timestamp":1665670733986,"type":0,"x":245,"y":181,"d":38.2099463490856,"r":19.1049731745428},{"timestamp":1665670738867,"type":0,"x":384.5,"y":40.5,"d":63.89053137985315,"r":31.945265689926575}];
const _tempTestTwo = [{"timestamp":1665688602591,"type":0,"x":263,"y":17,"d":136.23509092741122,"r":68.11754546370561},{"timestamp":1665688607196,"type":0,"x":386,"y":41,"d":62.12889826803627,"r":31.064449134018133},{"timestamp":1665688611451,"type":0,"x":110.5,"y":270,"d":45.044422518220834,"r":22.522211259110417},{"timestamp":1665688615594,"type":0,"x":274,"y":348,"d":36.76955262170047,"r":18.384776310850235},{"timestamp":1665688617920,"type":0,"x":363.5,"y":321.5,"d":26.870057685088806,"r":13.435028842544403},{"timestamp":1665688620896,"type":0,"x":375,"y":293.5,"d":26.92582403567252,"r":13.46291201783626},{"timestamp":1665688625697,"type":0,"x":32,"y":374,"d":48.33218389437829,"r":24.166091947189145},{"timestamp":1665688631893,"type":0,"x":241.5,"y":182.5,"d":38.28837943815329,"r":19.144189719076646}]

let debug = false;

// Setup Variables

const current = {};

const canvas = document.getElementById('canvas'); // The Canvas

const ctx = canvas.getContext("2d"); // Canvas context

// Debug Information bellow canvas
const crds = document.getElementById('coords');
const strc = document.getElementById('start-coords');
const cntr = document.getElementById('center-coords');
const endc = document.getElementById('end-coords');
const rdus = document.getElementById('radius');
const lnth = document.getElementById('length');
const angl = document.getElementById('angle');
const msdn = document.getElementById('mouse-down');

const marks = []; // Array of all the marks

let x1,                 /// start point
    y1,
    x2,                 /// end point
    y2,
    center,
    radius,
    i = 0,
    isHover = false,
    isDown = false;     /// if mouse button is down


// Setup Canvas

canvas.width = 450; // Width of the canvas
canvas.height = 450; // Height of the canvas


// Setup Classes

/**
 * Makes all circles standardized. Used in the marks array.
 */
class Circle {
    /**
     * Creates the representation of a circle. Used in the marks array.
     * @param x - Center x-coord
     * @param y - Center y-coord
     * @param radius - radius of the circle
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
 *
 * @example new Line(2, 5, 8, 13);
 */
class Line {
    /**
     * Creates the representation of a line. Used in the marks array.
     *
     * @param x1 - Point-1 X-Coord
     * @param y1 - Point-1 Y-Coord
     * @param x2 - Point-2 X-Coord
     * @param y2 - Point-2 Y-Coord
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
     * @param x - X-Coord
     * @param y - Y-Coord
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
 * Gets scaled mouse position inside canvas.
 * @param {HTMLCanvasElement} canvas - Target canvas
 * @param {Event} event - Input event
 * @returns {{x: number, y: number}} - Scaled coords
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
 * Get position of mouse relative to Canvas
 * @param {HTMLCanvasElement} canvas - Target canvas
 * @param {Event} event - Event input
 * @param {false|number} toFixed - `Number.prototype.toFixed` argument
 * @returns {{x: (number|string), y: (number|string)}}
 */
function getPosition(canvas, event, toFixed=false) { // TODO : Is this useful? Is it dupe of _getMousePos?
    let mp = _getMousePos(canvas, event);
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
 * Creates a circle Path2D
 * @param {number} x - Center x-position
 * @param {number} y - Center y-position
 * @param {number} radius - Radius of the circle
 * @returns {Path2D} - Circle wrapped in a Path2D // FIXME : is it wrapped?
 * @private
 */
function _Circle2D(x, y, radius) { // TODO : Re-Think what is considered a private function ("_" prefix) and what is not
    let crcl = new Path2D();
    crcl.arc(x, y, radius, 0, Math.PI * 2);
    return crcl;
}


/**
 * Draws circle using 2 points
 * @param {number} x1 - Point 1 x-coord
 * @param {number} y1 - Point 1 y-coord
 * @param {number} x2 - Point 2 x-coord
 * @param {number} y2 - Point 2 y-coord
 * @param {number} i - Current index of `marks`
 */
function drawCircle(x1, y1, x2, y2, i) {
    center = {
        x: (x1 + x2) / 2,
        y: (y1 + y2) / 2
    }

    radius = distanceCalc(center.x, center.y, x1, y1);

    cntr.innerText = `[${center.x},${center.y}]`;
    console.debug("p1: " + [x1,y1], "\npc: " + [center.x,center.y], "\np2: " + [x2,y2], "\nradius: " + radius);

    rdus.innerText = radius.toFixed(3);

    addCircle(center.x, center.y, radius, i);
}


/**
 * Creates a circle mark then re-draws the canvas
 * @param {number} x - center x-coord
 * @param {number} y - center y-coord
 * @param {number} radius - radius
 * @param {number} [index] - index of circle
 */
function addCircle(x, y, radius, index) {
    let crcl = new Circle(x, y, radius);

    if (typeof index === "number" && 0 <= index <= marks.length) // if index is specified
        marks[index] = crcl;
    else
        marks.push(crcl);
    reDraw();
}


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
function drawLine(x1, y1, x2, y2, index) {
    console.log(x1, y1, x2, y2, index);
    let ln = new Line(x1, y1, x2, y2);
    if (typeof index === "number" && 0 <= index <= marks.length) // if index is specified
        marks[index] = ln;
    else
        marks.push(ln);
    reDraw();

    lnth.innerText = ln.length.toFixed(3);
    angl.innerText = `${ln.angle.toFixed(3)}\u00b0`;
    cntr.innerText = `[${ln.center.x},${ln.center.y}]`;

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
    pt.arc(x, y, pointRadius, 0, Math.PI * 2);
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
}


/**
 * Clears canvas then loops through all marks to re-draw
 *
 * @note ctx.strokeStyle = "#f8b31f";<br>ctx.fillStyle = "#f8b31f33";
 */
function reDraw(i) {
    let tmp, v;
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
                if (j === i) { // if Selected
                    ctx.strokeStyle = "#fff";
                    ctx.fillStyle = "#fff3";
                } else if ((v.d) < minCraterSize) { // if too small
                    ctx.strokeStyle = "#f00";
                    ctx.fillStyle = "#f003";
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
                if (j === i) { // if Selected
                    ctx.strokeStyle = "#fffa";
                } else if (v.length < minLineLength) { // if no long enough
                    ctx.strokeStyle = "#f00a";
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
}


/**
 * Deletes selected mark
 * @param {number} i - index of mark
 */
function delMark(i) {
    marks.splice(i, 1);
    reDraw();
}


/**
 * Deletes the latest mark*
 *
 * *Does not go off of timestamps
 */
function delLastMark() {
    delMark(marks.length - 1);
}


/**
 * Calculates the distance of all marks then returns the nearest mark's index number.
 * @param {HTMLCanvasElement} canvas - Target Canvas
 * @param {Event} e - Mouse Event
 * @returns {number} - Index of the nearest mark
 */
function getNearest(canvas, e) {
    let tempDist,                    // Temporary distance
        best = Infinity,
        bestDist = Infinity, // Best Mark, Best Distance
        msPs = getPosition(canvas, e),

        x0 = msPs.x,
        y0 = msPs.y,

        x, y;

    marks.forEach((v, i) => {
        switch (v.type) { // Go by type of mark [0: Circle; 1: Line; 2: Point]
            case 0: // Circle
                x = v.x;
                y = v.y;
                tempDist = distanceCalc(x, y, x0, y0);

                if (bestDist >= tempDist && v.r >= tempDist && tempDist <= delCircleMaxDist) { // closer or equal to last best & no further than radius
                    bestDist = tempDist;
                    best = i;
                }
                break;
            case 1: // Line
                let x1 = v.x1,
                    y1 = v.y1,
                    x2 = v.x2,
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

                        /*console.clear();
                        console.debug([[x0,y0], [x1,y1], [x2,y2]]);
                        console.debug(pr);*/
                        let rx0 = pr[0][0], // Save new point values
                            rx1 = pr[1][0],
                            ry1 = pr[1][1],
                            rx2 = pr[2][0],
                            ry2 = pr[2][1];

                        /* I need the point on the line rotated-back for the answer, need to use the rotated line for checks
                        * !!!READ ME!!!
                        *
                        * You do not need to rotate the line back, just the new point!!!
                        *
                        * Start at ln480
                        * */

                        ang *= -1; // Angle to undo rotation to 180°
                        /*console.debug(rotateAxis([[x0,y0], [x1,y1], [x2,y2]], ang, false));*/

                        if (rx0 <= rx1) {
                            pf = [x1,y1];
                        } else if (rx0 >= rx2) {
                            pf = [x2,y2];
                        } else {
                            pf = rotateAxis([[rx0,ry1]], ang, false)[0];
                            console.debug(pf);
                        }
                        if (i === 0 && debug === true) {
                            drawLine(rx1,ry1,rx2,ry2, 1);
                            addPoint(pf[0], pf[1], 2);
                            addPoint(x0, y0, 3);
                        }

                        tempDist = distanceCalc(x0, y0, pf[0], pf[1]);

                        //tempDist = Math.abs((x2-x1) * (y1-y0) - (x1-x0) * (y2-y1)) / Math.sqrt((x2-x1)**2 + (y2-y1)**2);
                        break;
                }
                if (bestDist >= tempDist && delLineMaxDist >= tempDist) { // closer than last best & no further than radius
                    bestDist = tempDist;
                    best = i;
                }
                break;
            case 2: // Point
                x = v.x;
                y = v.y;
                tempDist = distanceCalc(v.x, v.y, msPs.x, msPs.y);

                if (bestDist >= tempDist && delPointMaxDist >= tempDist) { // closer than last best & no further than radius
                    bestDist = tempDist;
                    best = i;
                }
                break;
        }
    })
    console.debug(best, bestDist);
    return best; // if none, Infinity deletes nothing in delMark
}


/**
 * Returns the distance between two points.
 * @param x1 - Point 1 X-Position
 * @param y1 - Point 1 Y-Position
 * @param x2 - Point 2 X-Position
 * @param y2 - Point 2 Y-Position
 * @returns {number} - Distance between [x1,y1] & [x2,y2]
 */
function distanceCalc(x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1)**2 + (y2 - y1)**2); // sqrt of ((x2 - x1)^2 + (y2 - y1)^2)
}


/**
 * Rotate the axis.
 * @param {Array} c - Array of points [[x1,y1],[x2,y2],[x3,y3],...]
 * @param {number} r - Amount of rotation in radians.
 * @param {boolean} [rad] - Set to false to use degrees with r.
 */
function rotateAxis(c, r, rad=true) {
    if (!Array.isArray(c) || !Number.isFinite(r)) return void(0);
    if (rad !== true) {
        r = r*(Math.PI/180);
    }
    let resp = c,
        x, y;

    c.forEach((v, i) => {
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


rotateLine = (i, r, rad=true) => {
    let ln = marks[i],
        x1 = ln.x1,
        y1 = ln.y1,
        x2 = ln.x2,
        y2 = ln.y2,
        rt;

    rt = rotateAxis([[x1,y1],[x2,y2]], r, rad);
    drawLine(rt[0][0], rt[0][1], rt[1][0], rt[0][1], i);
    return marks[i];
}


/**
 * Run when mouse button is pressed in canvas
 * @param {Event} e
 * @private
 */
function _down(e) {
    if (isDown || e.button !== 0) { // left/main click === e.button of 0
        console.debug("Congratulations! You found an edge case!\nWe know about this, though it is not an issue :)");
        _up(e);
        return;
    }

    isDown = true;
    i = marks.length;

    let pos = getPosition(canvas, e);
    current.x1 = pos.x;
    current.y1 = pos.y;

    msdn.innerText = "True";

    switch (document.querySelector('input[type=radio][name=tool]:checked').value) {
        case "-1": // Delete Tool
            let nr = getNearest(canvas, e);
            delMark(nr);
            return void(0);
        case "0": // Circle Tool
            // nice looking stuff
            strc.innerText = `[${current.x1.toFixed(0)},${current.y1.toFixed(0)}]`;
            break;
        case "1": // Line Tool
            strc.innerText = `[${current.x1.toFixed(0)},${current.y1.toFixed(0)}]`;
            break;
        case "2": // Point Tool
            addPoint(current.x1, current.y1, i);
            i++;
            break;
    }
}


/**
 * Run when mouse is moved on canvas
 * @param {Event} e
 * @private
 */
function _move(e) {
    isHover = true;

    let pos = getPosition(canvas, e);
    current.x2 = pos.x;
    current.y2 = pos.y;

    /// Setting Coords
    crds.innerText = `[${current.x2},${current.y2}]`;

    switch (document.querySelector('input[type=radio][name=tool]:checked').value) {
        case "-1": // Delete Tool
            let nr = getNearest(canvas, e);
            reDraw(nr); // highlight selected
            break;
        case "0": // Circle Tool
            if (isDown) { // if not Tool but is mousedown
                /// draw ellipse
                drawCircle(current.x1, current.y1, current.x2, current.y2, i);

                // Setting End Coords
                endc.innerText = `[${current.x2},${current.y2}]`;
            }
            break;
        case "1": // Line Tool
            if (isDown) {
                // Draw Line
                drawLine(current.x1, current.y1, current.x2, current.y2, i);

                // Setting End Coords
                endc.innerText = `[${current.x2},${current.y2}]`;
            }
            break;
        case "2": // Point Tool
            break;
        default:
            console.debug("Just another edge case, nothing to worry about!\nHere is a cookie 🍪");
            break;
    }
}


/**
 * Run when mouse button is released in canvas (or exiting canvas)
 * @param {Event} e
 * @private
 */
function _up(e) {
    isHover = false;
    if (!isDown || marks[i] === undefined) return; // if already up, don't do anything

    // real work
    isDown = false; // clear isDown flag to stop drawing

    switch (document.querySelector('input[type=radio][name=tool]:checked').value) {
        case '0': // Circle Tool
            if (marks[i].d < minCraterSize)
                delMark(i);
            break;
        case '1': // Line Tool
            if (marks[i].length < minLineLength)
                delMark(i);
            break;
        case '2': // Point
            break;
    }

    reDraw();

    // nice looking stuff
    let cv = _getMousePos(canvas, e);
    endc.innerText = `[${cv.x},${cv.y}]`;
    msdn.innerText = 'False';

    i = marks.length;
    void(0);
}


/**
 * Clears the canvas
 */
function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
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

function _keyPress(e) {
    if (!isHover) return;
    switch (e.keyCode) {
        case 100: // d
            e.preventDefault();
            document.querySelector('#delTool').click();
            break;
        case 99: // c
            e.preventDefault();
            document.querySelector('#circleTool').click();
            break;
        case 108: // l
            e.preventDefault();
            document.querySelector('#lineTool').click();
            break;
        case 112: // p
            e.preventDefault();
            document.querySelector('#pointTool').click();
            break;
    }
}


/// draw ellipse from start point



// Event Listeners

/**
 * Prevents fast-clicks from keeping isDown true
 */
addEventListener('click', () => {
    isDown = false;
    msdn.innerText = 'False';
});

//addEventListener('click', _up);

canvas.addEventListener('mousedown', _down);

canvas.addEventListener('mousemove', _move);


addEventListener('mouseup', _up);

addEventListener('mouseleave', _up);

addEventListener('mouseout', _up);

addEventListener('keypress', _keyPress);


reDraw();


/* 
 * https://stackoverflow.com/questions/32736999/remove-circle-drawn-in-html5-canvas-once-user-clicks-on-it
 * https://developer.mozilla.org/en-US/docs/Web/API/Path2D/Path2D
 * https://stackoverflow.com/questions/21594756/drawing-circle-ellipse-on-html5-canvas-using-mouse-events
 * https://keisan.casio.com/exec/system/1223522781
*/