// Settings

const minCraterSize     = 18; // Minimum crater size
const delCircleMaxDist  = 25; // Maximum distance to center to delete a circle
const pointRadius       = 10; // Radius of the point
const delPointMaxDist   = 10; // Maximum distance to delete a point

const _tempTestOne = [{"timestamp":1665670727055,"type":0,"x":113,"y":270.5,"d":46.010868281309364,"r":23.005434140654682},{"timestamp":1665670729802,"type":0,"x":263.5,"y":13,"d":143.68368035375485,"r":71.84184017687743},{"timestamp":1665670733986,"type":0,"x":245,"y":181,"d":38.2099463490856,"r":19.1049731745428},{"timestamp":1665670738867,"type":0,"x":384.5,"y":40.5,"d":63.89053137985315,"r":31.945265689926575}];


// Setup Variables

const canvas = document.getElementById('canvas'); // The Canvas

const ctx = canvas.getContext("2d");

// Text bellow the canvas
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

        let a = ((Math.atan2(y2-y1, x2-x1) * 180) / Math.PI)
        this.angle = a < 0 ? a + 180 : a;

        this.length = Math.sqrt((Math.pow(x1 - x2, 2)) + (Math.pow(y1 - y2, 2)));
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
    console.debug(`_getMousePos`);
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
 * @param {boolean|number} toFixed - `Number.prototype.toFixed` input
 * @returns {{x: (number|string), y: (number|string)}}
 */
function getPosition(canvas, event, toFixed=false) { // TODO : Is this useful? Is it dupe of _getMousePos?
    console.debug('getPosition');
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
 * @constructor
 */
function _Circle2D(x, y, radius) { // TODO : Re-Think what is considered a private function ("_" prefix) and what is not
    console.debug('Circle');
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
    console.debug('drawCircle');

    center = {
        x: (x1 + x2) / 2,
        y: (y1 + y2) / 2
    }

    radius = Math.sqrt((Math.pow(x1 - center.x, 2)) + (Math.pow(y1 - center.y, 2)));

    cntr.innerText = `[${center.x},${center.y}]`;
    console.log("p1: " + [x1,y1], "\npc: " + [center.x,center.y], "\np2: " + [x2,y2], "\nradius: " + radius);

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
    console.debug('addCircle');
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


function drawLine(x1, y1, x2, y2, index) {
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
    console.debug('addCircle');
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
    console.debug('reDraw');
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
                } else if ((v.d) < minCraterSize) {
                    ctx.strokeStyle = "#f00";
                    ctx.fillStyle = "#f003";
                } else {
                    ctx.strokeStyle = "#f8b31f";
                    ctx.fillStyle = "#f8b31f33";
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
                } else {
                    ctx.strokeStyle = "#f8b31faa";
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
                    ctx.fillStyle = "#f8b31faa";
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
    console.debug('delMark');
    marks.splice(i, 1);
    reDraw();
}


/**
 * Deletes the latest mark*
 *
 * *Does not go off of timestamps
 */
function delLastMark() {
    console.debug('delLastMark');
    delMark(marks.length - 1);
}


/**
 *
 * @param {HTMLCanvasElement} canvas - Target Canvas
 * @param {Event} e - Mouse Event
 * @returns {number} - Index of the nearest mark
 */
function getNearest(canvas, e) {
    let temp, best = Infinity, bestDist = Infinity; // Temporary, Best Mark, Best Distance
    let msPs = getPosition(canvas, e);

    marks.forEach((v, i) => {
        switch (v.type) {
            case 0: // Circle
                temp = Math.sqrt((Math.pow(msPs.x - v.x, 2)) + (Math.pow(msPs.y - v.y, 2)));
                if (bestDist > temp && v.r >= temp && temp <= delCircleMaxDist) { // closer than last best & no further than radius
                    bestDist = temp;
                    best = i;
                }
                break;
            case 1: // Line
                break;
            case 2: // Point
                temp = Math.sqrt((Math.pow(msPs.x - v.x, 2)) + (Math.pow(msPs.y - v.y, 2)));
                if (bestDist > temp && delPointMaxDist >= temp) { // closer than last best & no further than radius
                    bestDist = temp;
                    best = i;
                }
        }
    })
    return best; // if none, Infinity deletes nothing in delMark
}


/**
 * Run when mouse button is pressed in canvas
 * @param {Event} e
 * @private
 */
function _down(e) {
    console.debug('_down');
    if (isDown || e.button !== 0) { // left/main click === e.button of 0
        console.debug("Congratulations! You found an edge case!\nWe know about this, though it is not an issue :)");
        _up(e);
        return;
    }

    isDown = true;
    i = marks.length;

    let pos = getPosition(canvas, e);
    x1 = pos.x;
    y1 = pos.y;

    msdn.innerText = "True";

    switch (document.querySelector('input[type=radio][name=tool]:checked').value) {
        case "-1": // Delete Tool
            let nr = getNearest(canvas, e);
            delMark(nr);
            return void(0);
        case "0": // Circle Tool
            // nice looking stuff
            strc.innerText = `[${x1.toFixed(0)},${y1.toFixed(0)}]`;
            break;
        case "1": // Line Tool
            strc.innerText = `[${x1.toFixed(0)},${y1.toFixed(0)}]`;
            break;
        case "2": // Point Tool
            addPoint(pos.x, pos.y, i);
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
    console.debug('_move');
    isHover = true;

    let pos = getPosition(canvas, e);
    x2 = pos.x;
    y2 = pos.y;

    /// Setting Coords
    crds.innerText = `[${x2},${y2}]`;

    switch (document.querySelector('input[type=radio][name=tool]:checked').value) {
        case "-1": // Delete Tool
            let nr = getNearest(canvas, e);
            reDraw(nr); // highlight selected
            break;
        case "0": // Circle Tool
            if (isDown) { // if not Tool but is mousedown
                /// draw ellipse
                drawCircle(x1, y1, x2, y2, i);

                // Setting End Coords
                endc.innerText = `[${x2},${y2}]`;
            }
            break;
        case "1": // Line Tool
            if (isDown) {
                // Draw Line
                drawLine(x1, y1, x2, y2, i);

                // Setting End Coords
                endc.innerText = `[${x2},${y2}]`;
            }
            break;
        case "2": // Point Tool
            break;
        default:
            console.log("Just another edge case, nothing to worry about!\nHere is a cookie 🍪");
            break;
    }
}


/**
 * Run when mouse button is released in canvas (or exiting canvas)
 * @param {Event} e
 * @private
 */
function _up(e) {
    console.debug('_up');
    isHover = false;
    if (!isDown || marks[i] === undefined) return; // if already up, don't do anything

    // real work
    isDown = false; // clear isDown flag to stop drawing
    if (marks[i].d < minCraterSize) {
        delMark(i);
    }

    reDraw();

    // nice looking stuff
    let cv = _getMousePos(canvas, e);
    endc.innerText = `[${cv.x},${cv.y}]`;
    msdn.innerText = 'False';

    i = marks.length;
    _send();
    void(0);
}


/**
 * Clears the canvas
 */
function clearCanvas() {
    console.debug('clearCanvas');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}


/**
 * POSTs data (marks array) to post.php
 *
 * Proof of concept
 * @private
 */
function _send() {
    console.debug('_send');
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
    console.debug('_receive');
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
    console.debug('click');
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
*/