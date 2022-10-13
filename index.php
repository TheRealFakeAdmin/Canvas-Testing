<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8" />
        <title>Canvas Testing</title>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml">
        <style>
            #canvas {
                background: url("images/moon-or-something.jpg");
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
            Mouse Down:     <i id="mouse-down">False</i><br>
            Data: <p id="data"><p>
        </div>
        <div>
            <button onclick="_send()">Send</button>
            <button onclick="_receive()">Receive</button><br>
            <button onclick="delLastMark();">Undo</button>
            <button onclick="marks.length = 0; reDraw();">Reset</button><br>
            <input type="checkbox" id="delTool"><label for="delTool"> Delete Tool</label>
        </div>

        <script src="canvas.js"></script>
    </body>
</html>
