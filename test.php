<!DOCTYPE html>
<html>
    <head>
        <style>
            hidden {
                display: none;
            }
        </style>
    </head>
    <body>

        <p>Image to use:</p>
        <img id="scream" width="220" height="277" src="img_the_scream.jpg" alt="The Scream">

        <p>Canvas:</p>
        <div id="main">
            <canvas id="myCanvas" width="240" height="297" style="border:1px solid #d3d3d3;">
            Your browser does not support the HTML5 canvas tag.
            </canvas>
        </div>
        <div id="coords">[0,0]</div>

        <script src="main.js"></script>

    </body>
</html>