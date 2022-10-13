<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8" />
        <title>Canvas Testing</title>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml">
        <style>
            #canvas {
                background: url("images/moon-tutorial-2.png");
                background-size: 100%;
            }
        </style>
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
            <button onclick="delLastMark();">Undo</button>
            <button onclick="marks.length = 0; reDraw();">Reset</button><br>
            <!--<input type="checkbox" id="delTool"><label for="delTool"> Delete Tool</label>-->
            <div>
                <p>Select tool:</p>
                <input type="radio" id="delTool" name="tool" value="-1">
                <label for="delTool">Delete Tool</label><br>
                <input checked="checked" type="radio" id="circleTool" name="tool" value="0">
                <label for="circleTool">Circle Tool</label><br>
                <input type="radio" id="lineTool" name="tool" value="1">
                <label for="lineTool">Line Tool</label><br>
                <input type="radio" id="pointTool" name="tool" value="2">
                <label for="pointTool">Point Tool</label>
            </div>
        </div>

        <script src="canvas.js"></script>
    </body>
</html>
