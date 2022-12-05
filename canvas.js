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

import { getPosition, reDraw, delMark, getNearest, getEndPt, distanceCalc } from './modules/temp.js';

import { addCircleP2P, addCirclePR } from './modules/circle.js';

import { drawLineP2P } from './modules/line.js';

import { addPoint } from './modules/point.js';

import { addRectangleP2P } from './modules/rectangle.js';


// Setup Canvas

CSB_APP.canvas.width = 450; // Width of the canvas
CSB_APP.canvas.height = 450; // Height of the canvas


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