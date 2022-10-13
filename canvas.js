// Settings

const minCraterSize = 18;

// Setup Variables

const canvas = document.getElementById('canvas'); // The Canvas

const ctx = canvas.getContext("2d");

// Text bellow the canvas
const crds = document.getElementById('coords');
const strc = document.getElementById('start-coords');
const cntr = document.getElementById('center-coords');
const endc = document.getElementById('end-coords');
const rdus = document.getElementById('radius');
const msdn = document.getElementById('mouse-down');

// Form Stuff
const dltl = document.getElementById('delTool');

const marks = []; // Array of all the marks

let x1,                 /// start point
    y1,
    x2,                 /// end point
    y2,
    center,
    radius,
    i = 0,
    isDown = false;     /// if mouse button is down


// Setup Canvas

canvas.width = 450; // Width of the canvas
canvas.height = 450; // Height of the canvas


// Setup Classes

/**
 * Makes all circles the same layout
 */
class Circle {
    /**
     * Generates a circle representation
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
 * @example new Line(2, 5, 8, 13)
 */
class Line {

    constructor(x1, y1, x2, y2) {
        this.timestamp = Date.now();
        this.type = 1;

        this.p1 = {};
        this.p1.x = x1;
        this.p1.y = y1;

        this.p2 = {};
        this.p2.x = x2;
        this.p2.y = y2;

        this.length = Math.sqrt((Math.pow(this.p1.x - this.p2.x, 2)) + (Math.pow(this.p1.y - this.p2.y, 2)));
        this.angle = ((Math.atan2(y2-y1, x2-x1) * 180) / Math.PI) < 0 ? // Make math better
            ((Math.atan2(y2-y1, x2-x1) * 180) / Math.PI) + 180 : ((Math.atan2(y2-y1, x2-x1) * 180) / Math.PI);
    }
}

/**
 * Makes all points the same layout
 */
class Point {
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
 * Clears canvas then loops through all marks to re-draw
 */
function reDraw(i) {
    console.debug('reDraw');
    let crcl;
    clearCanvas();
    for(let j = 0; j < marks.length; j++) {
        if (marks[j] == null) continue;
        crcl = _Circle2D(marks[j].x, marks[j].y, (marks[j].d / 2)); // Circle with center [x,y] & radius = diameter/2
        ctx.lineWidth = 2;
        if (j === i) {
            ctx.strokeStyle = "#fff";
            ctx.fillStyle = "#fff3";
        } else if ((marks[j].d) < minCraterSize) {
            ctx.strokeStyle = "#f00";
            ctx.fillStyle = "#f003";
        } else {
            ctx.strokeStyle = "#f8b31f";
            ctx.fillStyle = "#f8b31f33";
        }
        ctx.stroke(crcl, "nonzero");
        ctx.fill(crcl, "nonzero");
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
        temp = Math.sqrt((Math.pow(msPs.x - v.x, 2)) + (Math.pow(msPs.y - v.y, 2)));
        if (bestDist > temp && (v.d / 2) >= temp) { // closer than last best & no further than radius
            bestDist = temp;
            best = i;
        }
    })
    return best; // if none, Infinity deletes nothing in delMark
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

    if (dltl.checked) { // if Delete Tool is checked
        let nr = getNearest(canvas, e);
        delMark(nr);
        isDown = false;
        return void(0);
    } else {

        i = marks.length;

        /// get corrected mouse position and store as first point
        /*rect = canvas.getBoundingClientRect();
        x1 = e.clientX - rect.left;
        y1 = e.clientY - rect.top;*/
        let pos = getPosition(canvas, e);
        x1 = pos.x;
        y1 = pos.y;

        isDown = true;

        // nice looking stuff
        strc.innerText = `[${x1.toFixed(0)},${y1.toFixed(0)}]`;
        msdn.innerText = "True";

    }
}


/**
 * Run when mouse is moved on canvas
 * @param {Event} e
 * @private
 */
function _move(e) {
    console.debug('_move');
    // real work
    /*rect = canvas.getBoundingClientRect();
    x2 = e.clientX - rect.left;
    y2 = e.clientY - rect.top;*/

    let pos = getPosition(canvas, e);
    x2 = pos.x;
    y2 = pos.y;

    /// Display Coords
    crds.innerText = `[${x2},${y2}]`;

    if (dltl.checked) { // if Delete Tool is checked
        let nr = getNearest(canvas, e);
        reDraw(nr); // highlight selected
    } else if (isDown) { // if not delTool but is mousedown
        endc.innerText = `[${x2},${y2}]`;

        /// draw ellipse
        drawCircle(x1, y1, x2, y2, i);

        // nice looking stuff
        let cv = _getMousePos(canvas, e);
        crds.innerText = `[${cv.x},${cv.y}]`;
    }
}


/**
 * Run when mouse button is released in canvas (or exiting canvas)
 * @param {Event} e
 * @private
 */
function _up(e) {
    console.debug('_up');
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


reDraw();


/* 
 * https://stackoverflow.com/questions/32736999/remove-circle-drawn-in-html5-canvas-once-user-clicks-on-it
 * https://developer.mozilla.org/en-US/docs/Web/API/Path2D/Path2D
 * https://stackoverflow.com/questions/21594756/drawing-circle-ellipse-on-html5-canvas-using-mouse-events
*/