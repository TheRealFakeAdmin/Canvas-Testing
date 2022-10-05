<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8" />
        <title>Canvas Testing</title>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml">
        <style>
            #canvas {
                background: url("images/20190328T204207S996_pol_iofL2pan.png");
                background-size: 100%;
            }
        </style>
    </head>
    <body>
        <div>
            <canvas id="canvas">This browser does not support the HTML5 canvas tag.</canvas>
        </div>
        <div>
            Coords:       <i id="coords">[0,0]</i><br>
            Start Coords: <i id="start-coords">[0,0]</i><br>
            End Coords:   <i id="end-coords">[0,0]</i><br>
            Radius:       <i id="radius">0.000</i><br>
            Mouse Down:   <i id="mouse-down">False</i>
        </div>
        <!--<button onclick="circles = circles.splice(0,circles.length); reDraw()">Reset</button>-->
        
        <script src="canvas.js"></script>
    </body>
</html>
