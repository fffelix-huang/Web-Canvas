const canvas = document.getElementById("canvas");
const color_picker = document.getElementById("color-picker");
const color_box = document.getElementById("color-box");

const ctx = canvas.getContext("2d");

const SCREEN_HEIGHT = window.innerHeight;
const SCREEN_WIDTH = window.innerWidth;

const CANVAS_HEIGHT = SCREEN_HEIGHT * 0.8;
const CANVAS_WIDTH  = SCREEN_WIDTH  * 0.7;

// Mouse

let mousePressed = false;

document.body.onmousedown = () => { mousePressed = true;  };
document.body.onmouseup   = () => { mousePressed = false; };

// Color

const make_color = (r, g, b) => { return "rgb(" + r + "," + g + "," + b + ")"; };

let selected_color = make_color(0, 0, 0);
let hovered_color = make_color(0, 0, 0);

// Canvas Tools

const pencil = document.getElementById("pencil");
const eraser = document.getElementById("eraser");
const text = document.getElementById("text");
const line = document.getElementById("line");
const circle = document.getElementById("circle");
const triangle = document.getElementById("triangle");
const rectangle = document.getElementById("rectangle");
const upload = document.getElementById("upload");
const download = document.getElementById("download");
const undo = document.getElementById("undo");
const redo = document.getElementById("redo");
const clear = document.getElementById("clear");

const line_thickness = document.getElementById("line-thickness");

let tool_state = "pencil";
let operations = [];
let font = "sans-serif";

// Initialize

const init_tools = () => {
    pencil.onclick    = () => { tool_state = "pencil"; };
    eraser.onclick    = () => { tool_state = "eraser"; }
    text.onclick      = () => { tool_state = "text"; }
    line.onclick      = () => { tool_state = "line"; }
    circle.onclick    = () => { tool_state = "circle"; }
    triangle.onclick  = () => { tool_state = "triangle"; }
    rectangle.onclick = () => { tool_state = "rectangle"; }

    download.onclick = () => {
        let a = document.createElement("a");
        a.href = canvas.toDataURL();
        a.download = "canvas.png";

        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    clear.onclick = () => { ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT); };
};

const init_canvas = () => {
    canvas.height = CANVAS_HEIGHT;
    canvas.width  = CANVAS_WIDTH;

    let lastX = -1;
    let lastY = -1;

    let currentTextBox = null;

    const drawText = () => {
        let textInfo = currentTextBox.value;
        let x = parseInt(currentTextBox.style.left, 10);
        let y = parseInt(currentTextBox.style.top, 10);

        ctx.textBaseline = "top";
        ctx.textAlign = "left";
        ctx.font = line_thickness.value * 2 + "px " + font;
        ctx.fillText(textInfo, x - SCREEN_WIDTH * 0.03, y - SCREEN_HEIGHT * 0.03);

        document.body.removeChild(currentTextBox);
        currentTextBox = null;
    };

    canvas.onclick = function(e) {
        if(currentTextBox != null) {
            drawText();
        }

        if(tool_state != "text") {
            return;
        }

        currentTextBox = document.createElement("input");
        currentTextBox.type = "text";
        currentTextBox.style.position = "fixed";
        currentTextBox.style.left = (e.clientX - 4) + "px";
        currentTextBox.style.top = (e.clientY - 4) + "px";

        currentTextBox.onkeydown = function(key) {
            if(key.keyCode == 13) {
                drawText();
            }
        };

        currentTextBox.onmousedown = function() {
            drawText();
        }

        document.body.appendChild(currentTextBox);
        currentTextBox.focus();
    }

    canvas.onmousedown = function(e) {
        let mouseX = e.pageX - this.offsetLeft;
        let mouseY = e.pageY - this.offsetTop;

        if(tool_state == "pencil" || tool_state == "eraser") {
            lastX = mouseX;
            lastY = mouseY;
        }
    };

    canvas.onmousemove = function(e) {
        if(!mousePressed) {
            return;
        }

        let mouseX = e.pageX - this.offsetLeft;
        let mouseY = e.pageY - this.offsetTop;

        if(tool_state == "pencil" || tool_state == "eraser") {
            // Reference: https://stackoverflow.com/questions/10122553/create-a-realistic-pencil-tool-for-a-painting-app-with-html5-canvas
            let x1 = mouseX;
            let x2 = lastX;
            let y1 = mouseY;
            let y2 = lastY;

            let steep = (Math.abs(y2 - y1) > Math.abs(x2 - x1));
            if(steep) {
                let xtmp = x1;
                x1 = y1;
                y1 = xtmp;

                let ytmp = y2;
                y2 = x2;
                x2 = ytmp;
            }

            if(x1 >  x2) {
                let xtmp = x1;
                x1 = x2;
                x2 = xtmp;

                let ytmp = y1;
                y1 = y2;
                y2 = ytmp;
            }

            let dx = x2 - x1;
            let dy = Math.abs(y2 - y1);
            let error = 0;
            let delta = dy / dx;
            let yStep = -1;
            let y = y1;

            if(y1 < y2) {
                yStep = 1;
            }

            for(let x = x1; x < x2; x++) {
                let thickness = line_thickness.value;

                if(tool_state == "pencil") {
                    if(steep) {
                        ctx.fillRect(y, x, thickness, thickness);
                    } else {
                        ctx.fillRect(x, y, thickness, thickness);
                    }
                } else {
                    if(steep) {
                        ctx.clearRect(y, x, thickness, thickness);
                    } else {
                        ctx.clearRect(x, y, thickness, thickness);
                    }
                }

                error += delta;

                if(error >= 0.5) {
                    y += yStep;
                    error -= 1;
                }
            }

            lastX = mouseX;
            lastY = mouseY;
        }
    };
};

const init_color_picker = () => {
    const WIDTH = 25;
    const HEIGHT = 12;
    const PIXEL_SIZE = SCREEN_WIDTH / 110;

    color_picker.innerHTML = "";

    for(let i = 0; i < HEIGHT; i++) {
        const row = document.createElement("div");
        row.classList.add("row");

        for(let j = 0; j < WIDTH; j++) {
            const pixel = document.createElement("button");
            pixel.classList.add("pixel");

            pixel.style.height = PIXEL_SIZE + "px";
            pixel.style.width = PIXEL_SIZE + "px";

            let color = make_color(i * (255 / HEIGHT), j * (255 / WIDTH), 255 / 2);
            pixel.style.background = color;

            pixel.onclick = () => {
                selected_color = color;
                color_box.style.background = selected_color;
                ctx.fillStyle = selected_color;
            };

            pixel.onmouseenter = () => { color_box.style.background = color; };
            pixel.onmouseleave = () => { color_box.style.background = selected_color; }

            row.appendChild(pixel);
        }

        color_picker.appendChild(row);
    }
};

const init_color_box = () => {
    color_box.style.height = (SCREEN_HEIGHT / 10) + "px";
    color_box.style.width = color_box.style.height;
    color_box.style.background = selected_color;
};

window.addEventListener("load", () => {
    init_tools();
    init_canvas();
    init_color_picker();
    init_color_box();
});
