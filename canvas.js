// Setup Variables

const canvas = document.getElementById('canvas'); // The Canvas

const ctx = canvas.getContext("2d");

// Text bellow the canvas
const crds = document.getElementById('coords');
const strc = document.getElementById('start-coords');
const endc = document.getElementById('end-coords');
const rdus = document.getElementById('radius');
const msdn = document.getElementById('mouse-down');

const circles = []; // Array of all the circles

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


// Setup Functions

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
 * @param canvas - The target canvas
 * @param {Event} event - Event input
 * @param {boolean|number} toFixed - `Number.prototype.toFixed` input
 * @returns {{x: (number|string), y: (number|string)}}
 */
function getPosition(canvas, event, toFixed=false) { // TODO : Is this useful? Is it dupe of getMousePos?
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
 * @param {number} x - x-position
 * @param {number} y - y-position
 * @param {number} radius - Radius of the circle
 * @returns {Path2D}
 * @constructor
 */
function Circle(x, y, radius) {
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
 * @param {number} i - Current index of `circles`
 */
function drawCircle(x1, y1, x2, y2, i) {

    center = {
            x: (x1 + x2) / 2,
            y: (y1 + y2) / 2
        }

    radius = Math.sqrt((Math.pow(x1 - center.x, 2)) + (Math.pow(y1 - center.y, 2)));

    console.log("p1: " + [x1,y1], "\npc: " + [center.x,center.y], "\np2: " + [x2,y2], "\nradius: " + radius);

    rdus.innerText = radius.toFixed(3);

    //circles[i] = Circle(center.x, center.y, radius);
    circles[i] = {x: center.x, y: center.y, d: (radius * 2), ts: Date.now()};

    //ctx.strokeStyle = "#f8b31f";
    //ctx.stroke(circles[i], "nonzero");
    reDraw();
}

/**
 * Clears canvas then loops through all circles to re-draw
 */
function reDraw() {
    let crcl;
    clearCanvas();
    for(let j = 0; j < circles.length; j++) {
        if (circles[j] == null) continue;
        crcl = Circle(circles[j].x, circles[j].y, (circles[j].d / 2)); // Circle with center [x,y] & radius = diameter/2
        ctx.strokeStyle = "#f8b31f";
        ctx.lineWidth = 2;
        ctx.fillStyle = "#f8b31f33";
        ctx.stroke(crcl, "nonzero");
        ctx.fill(crcl, "nonzero");
    }
}

/**
 * Run when mouse button is pressed in canvas
 * @param {Event} e
 * @private
 */
function _down(e) {
    if (isDown) console.log("how?");

    i = circles.length;

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

/**
 * Run when mouse is moved on canvas
 * @param {Event} e
 * @private
 */
function _move(e) {
    // real work
    /*rect = canvas.getBoundingClientRect();
    x2 = e.clientX - rect.left;
    y2 = e.clientY - rect.top;*/

    let pos = getPosition(canvas, e);
    x2 = pos.x;
    y2 = pos.y;

    /// Display Coords
    crds.innerText = `[${x2},${y2}]`;


    if (!isDown) return;

    /*/// clear canvas
    reDraw();*/

    endc.innerText = `[${x2},${y2}]`;

    /// draw ellipse
    drawCircle(x1, y1, x2, y2, i);

    // nice looking stuff
    let cv = _getMousePos(canvas, e, 0);
    crds.innerText = `[${cv.x},${cv.y}]`;
}

/**
 * Run when mouse button is released in canvas (or exiting canvas)
 * @param {Event} e
 * @private
 */
function _up(e) {
    if (!isDown) return; // if already up, don't do anything

    // real work
    isDown = false; // clear isDown flag to stop drawing

    reDraw();

    // nice looking stuff
    let cv = _getMousePos(canvas, e, 0);
    endc.innerText = `[${cv.x},${cv.y}]`;
    msdn.innerText = 'False';

    i = circles.length;
    void(0);
}

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}


/// draw ellipse from start point



// Event Listeners

canvas.addEventListener('mousedown', _down);

canvas.addEventListener('mousemove', _move);


canvas.addEventListener('mouseup', _up);

canvas.addEventListener('mouseleave', _up);

reDraw();


/* 
 * https://stackoverflow.com/questions/32736999/remove-circle-drawn-in-html5-canvas-once-user-clicks-on-it
 * https://developer.mozilla.org/en-US/docs/Web/API/Path2D/Path2D
 * https://stackoverflow.com/questions/21594756/drawing-circle-ellipse-on-html5-canvas-using-mouse-events
*/