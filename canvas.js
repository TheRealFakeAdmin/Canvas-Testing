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
    i = -1,
    isDown = false;     /// if mouse button is down


// Setup Canvas

canvas.width = 450 * 2; // Width of the canvas
canvas.height = 450 * 2; // Height of the canvas


// Setup Functions

function getMousePos(canvas, event) { // REMEMBER : This is like a percentage/scale
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
    let mp = getMousePos(canvas, event);
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
    let c = new Path2D();
    c.arc(x, y, radius, 0, Math.PI * 2);
    return c;
}


/* Src: https://stackoverflow.com/questions/21594756/drawing-circle-ellipse-on-html5-canvas-using-mouse-events */

/*function drawEllipse(x1, y1, x2, y2) {

    let radiusX = (x2 - x1) * 0.5,   /// radius for x based on input
        radiusY = (y2 - y1) * 0.5,   /// radius for y based on input
        centerX = x1 + radiusX,      /// calc center
        centerY = y1 + radiusY,
        step = 0.01,                 /// resolution of ellipse
        a = step,                    /// counter
        pi2 = Math.PI * 2 - step;    /// end angle

    let thing = (radiusX ^ 2) + (radiusY) ^ 2;

    console.log(thing);

    /// start a new path
    ctx.beginPath();

    /// set start point at angle 0
    ctx.moveTo(centerX + thing * Math.cos(0),
        centerY + thing * Math.sin(0));

    /// create the ellipse    
    for (; a < pi2; a += step) {
        ctx.lineTo(centerX + radiusX * Math.cos(a),
            centerY + radiusY * Math.sin(a));
    }

    /// close it and stroke it for demo
    ctx.closePath();
    ctx.strokeStyle = '#000';
    ctx.stroke();
}*/

/**
 * Draws circle using 2 points
 * @param {number} x1 - Point 1 x-coord
 * @param {number} y1 - Point 1 y-coord
 * @param {number} x2 - Point 2 x-coord
 * @param {number} y2 - Point 2 y-coord
 */
function drawCircle(x1, y1, x2, y2) { // TODO : Handle i in array of Path2D

    let center = {
            x: (x1 + x2) / 2,
            y: (y1 + y2) / 2
        }

    let radius = Math.sqrt((Math.pow(x1 - center.x, 2)) + (Math.pow(y1 - center.y, 2)));

    console.log("p1: " + [x1,y1], "\npc: " + [center.x,center.y], "\np2: " + [x2,y2], "\nradius: " + radius);

    rdus.innerText = radius.toFixed(3);

    let c = Circle(center.x, center.y, radius);

    circles[0] = c; // will be push in future

    ctx.strokeStyle = "#f8b31f";
    ctx.stroke(c, "nonzero");
}

/**
 * Clears canvas then loops through all circles to re-draw
 */
function reDraw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for(let i = 0; i < circles.length; i++) {
        ctx.strokeStyle = "#f8b31f";
        ctx.stroke(circles[i], "nonzero");
    }
}

function _down(e) {
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

    /// clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    endc.innerText = `[${x2},${y2}]`;

    /// draw ellipse
    drawCircle(x1, y1, x2, y2);

    // nice looking stuff
    let cv = getMousePos(canvas, e, 0);
    crds.innerText = `[${cv.x},${cv.y}]`;
}

function _up(e) {
    if (!isDown) return; // if already up, don't do anything

    // real work
    isDown = false; // clear isDown flag to stop drawing

    // nice looking stuff
    let cv = getMousePos(canvas, e, 0);
    endc.innerText = `[${cv.x},${cv.y}]`;
    msdn.innerText = 'False';
}



/// draw ellipse from start point



// Event Listeners

canvas.addEventListener('mousedown', (e) => { // handle mouse down
    _down(e);
})

canvas.addEventListener('mousemove', (e) => { // handle mouse move
    _move(e);
})


canvas.addEventListener('mouseup', (e) => { // handle mouse up
    _up(e);
})

canvas.addEventListener('mouseleave', (e) => { // handle mouse leave (backup for mouseup)
    _up(e);
})


/* 
 * https://stackoverflow.com/questions/32736999/remove-circle-drawn-in-html5-canvas-once-user-clicks-on-it
 * https://developer.mozilla.org/en-US/docs/Web/API/Path2D/Path2D
 * https://stackoverflow.com/questions/21594756/drawing-circle-ellipse-on-html5-canvas-using-mouse-events
*/