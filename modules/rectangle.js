// Setup Class

/**
 * Makes all rectangles standardized.
 *
 * @example new Rectangle(10, 12, 32, 64)
 */
class Rectangle {
    /**
     * Creates the representation of a rectangle. Used in marks array.
     * @param {number} x1 - Point-1 X-Coord
     * @param {number} y1 - Point-1 Y-Coord
     * @param {number} x2 - Point-2 X-Coord
     * @param {number} y2 - Point-2 Y-Coord
     *
     * @returns {{timestamp: number, type: 3, x1: number, y1: number, x2: number, y2: number, params: {x: number, y: number, width: number, height: number}, area: number}}
     */
    constructor(x1, y1, x2, y2) {
        this.timestamp = Date.now();
        this.type = 3;

        this.x1 = x1;
        this.y1 = y1;

        this.x2 = x2;
        this.y2 = y2;

        this.params = {
            x: ((x1 < x2) ? x1 : x2),
            y: ((y1 < y2) ? y1 : y2),
            width: (Math.abs(x1 - x2)),
            height: (Math.abs(y1 - y2))
        }
        /*
            v0     v1

            v3     v2
         */
        let v0x, v1x, v2x, v3x, v0y, v1y, v2y, v3y;

        if (x1 < x2) {
            if (y1 > y2) { // (x1 < x2 && y1 < y2)
                v0x = x1;
                v0y = y2;

                v1x = x2;
                v1y = y2;

                v2x = x2;
                v2y = y1;

                v3x = x1;
                v3y = y1;
            } else {       // (x1 < x2 && y2 < y1)
                v0x = x1;
                v0y = y1;

                v1x = x2;
                v1y = y1;

                v2x = x2;
                v2y = y2;

                v3x = x1;
                v3y = y2;
            }
        } else { // (x2 < x1)
            if (y1 > y2) { // (x2 < x1 && y1 < y2)
                v0x = x2;
                v0y = y2;

                v1x = x1;
                v1y = y2;

                v2x = x1;
                v2y = y1;

                v3x = x2;
                v3y = y1;
            } else {       // (x2 < x1 && y2 < y1)
                v0x = x2;
                v0y = y1;

                v1x = x1;
                v1y = y1;

                v2x = x1;
                v2y = y2;

                v3x = x2;
                v3y = y2;
            }
        }

        this.vertices = [
            { // v0
                x: v0x,
                y: v0y
            },
            { // v1
                x: v1x,
                y: v1y
            },
            { // v2
                x: v2x,
                y: v2y
            },
            { // v3
                x: v3x,
                y: v3y
            }
        ]

        let v = this.vertices;
        this.lines = [
            [
                {
                    x: v[0].x,
                    y: v[0].y
                },
                {
                    x: v[1].x,
                    y: v[1].y
                }
            ],
            [
                {
                    x: v[1].x,
                    y: v[1].y
                },
                {
                    x: v[2].x,
                    y: v[2].y
                }
            ],
            [
                {
                    x: v[2].x,
                    y: v[2].y
                },
                {
                    x: v[3].x,
                    y: v[3].y
                }
            ],
            [
                {
                    x: v[3].x,
                    y: v[3].y
                },
                {
                    x: v[0].x,
                    y: v[0].y
                }
            ]
        ]

        this.area = this.params.width + this.params.height;
    }
}

// Setup Functions

function _Rectangle2D(x, y, width, height) {
    let rct = new Path2D();
    rct.rect(x, y, width, height);
    return rct;
}


function addRectangleP2P(x1, y1, x2, y2, index) {
    let rct = new Rectangle(x1, y1, x2, y2);

    if (typeof index === "number" && 0 <= index) // if index is specified
        LOREM_IPSUM.marks[index] = rct;
    else
        LOREM_IPSUM.marks.push(rct);

    return void(0);
}

MARKS.set('Rectangle', {
    type: 3,
    Class: Rectangle,
    priv: _Rectangle2D,
    addP2P: addRectangleP2P
})

export { Rectangle, _Rectangle2D, addRectangleP2P }