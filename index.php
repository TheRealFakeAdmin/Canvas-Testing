<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8" />
        <title>Canvas Testing</title>
        <link rel="icon" href="favicon.png" type="image/png">
        <link rel="stylesheet" type="text/css" href="style.css">
    </head>
    <body>

        <div>
            <canvas id="canvas">This browser does not support the HTML5 canvas tag.</canvas>
        </div>
        <div>
            Coords:         <i id="coords">[0,0]</i><br>
            Start Coords:   <i id="start-coords">[0,0]</i><br>
            Center Coords:  <i id="center-coords">[0,0]</i><br>
            End Coords:     <i id="end-coords">[0,0]</i><br>
            Radius:         <i id="radius">0.000</i><br>
            Length:         <i id="length">0.000</i><br>
            Angle:          <i id="angle">0.000&deg;</i><br>
            Mouse Down:     <i id="mouse-down">False</i><br>
            Data: <p id="data"><p>
        </div>
        <div>
            <button onclick="_send()">Send</button>
            <button onclick="_receive()">Receive</button><br>
            <button onclick="void(delMark(LOREM_IPSUM.marks.length - 1));">Undo</button>
            <button onclick="LOREM_IPSUM.marks.length = 0; reDraw();">Reset</button><br>
            <!--<input type="checkbox" id="delTool"><label for="delTool"> Delete Tool</label>-->
            <div>
                <p>Select tool:</p>
                <label>
                    <input type="radio" id="editTool" name="tool" value="-2">
                    <img src="images/icons/NewIcons-09-onLight.png" title="Edit" alt="Edit Tool">
                </label>
                <label>
                    <input type="radio" id="delTool" name="tool" value="-1">
                    <img src="images/icons/NewIcons-01-eraser.png" title="Delete" alt="Delete Tool">
                </label>
                <label>
                    <input checked="checked" type="radio" id="circleTool" name="tool" value="0">
                    <img src="images/icons/NewIcons-06-Crater.png" title="Crater" alt="Crater Tool">
                </label>
                <label>
                    <input type="radio" id="lineTool" name="tool" value="1">
                    <img src="images/icons/NewIcons-08-craterchain.png" title="Line" alt="Line Tool">
                </label>
                <label>
                    <input type="radio" id="pointTool" name="tool" value="2">
                    <img src="images/icons/NewIcons-12-rocks.png" title="Point" alt="Point Tool">
                </label>
                <label>
                    <input type="radio" id="rectangleTool" name="tool" value="3">
                    <img src="images/icons/NewIcons-17-asteroids.png" title="Rectangle" alt="Rectangle Tool">
                </label>
            </div>
        </div>

        <script>Object.assign(window, {
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
            });</script>
        <script type="module" src="canvas.js"></script>
        <!--<script type="text/javascript">
            <?php /*include 'test.js';
                  include 'canvas.js' */?>
        </script>-->
    </body>
</html>
