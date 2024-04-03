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
let font_style = "sans-serif";

// Histories

let history = [];
let history_pointer = 0;

const cleanHistory = () => {
    while(history.length > history_pointer) {
        history.pop();
    }
};

const drawFillRect = (x, y, width, height, color) => {
    cleanHistory();

    const args = {
        func: "fillRect",
        x: x,
        y: y,
        width: width,
        height: height,
        color: color
    };

    history.push(args);
    history_pointer++;

    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);
};

const drawClearRect = (x, y, width, height) => {
    cleanHistory();

    const args = {
        func: "clearRect",
        x: x,
        y: y,
        width: width,
        height: height
    };

    history.push(args);
    history_pointer++;

    ctx.clearRect(x, y, width, height);
};

const drawFillText = (text_info, x, y, font_size, font_style) => {
    cleanHistory();

    const args = {
        func: "fillText",
        text_info: text_info,
        x: x,
        y: y,
        font_size: font_size,
        font_style: font_style
    }

    history.push(args);
    history_pointer++;

    ctx.textBaseline = "top";
    ctx.textAlign = "left";
    ctx.font = font_size + "px " + font_style;

    ctx.fillText(text_info, x, y);
};

const stampHistory = () => {
    cleanHistory();

    const args = {
        func: "stamp"
    };

    history.push(args);
    history_pointer++;
};

const redoCanvas = () => {
    if(history_pointer >= history.length) {
        return;
    }

    history_pointer++;

    while(history_pointer < history.length) {
        let args = history[history_pointer];

        if(args.func == "stamp") {
            return;
        }

        if(args.func == "fillRect") {
            ctx.fillStyle = args.color;
            ctx.fillRect(args.x, args.y, args.width, args.height);
        } else if(args.func == "clearRect") {
            ctx.clearRect(args.x, args.y, args.width, args.height);
        } else if(args.func == "fillText") {
            ctx.textBaseline = "top";
            ctx.textAlign = "left";
            ctx.font = args.font_size + "px " + args.font_style;

            ctx.fillText(args.text_info, args.x, args.y);
        }

        history_pointer++;
    }
};

const undoCanvas = () => {
    if(history_pointer <= 0) {
        return;
    }

    history_pointer--;
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    let prevStamp = history_pointer;

    while(prevStamp > 0) {
        let args = history[prevStamp];

        if(args.func == "stamp") {
            break;
        }

        prevStamp--;
    }

    history_pointer = 0;

    while(history_pointer < prevStamp) {
        redoCanvas();
    }
};

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

    undo.onclick = () => { undoCanvas(); }
    redo.onclick = () => { redoCanvas(); }

    clear.onclick = () => {
        stampHistory();
        drawClearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    };
};

const init_canvas = () => {
    canvas.height = CANVAS_HEIGHT;
    canvas.width  = CANVAS_WIDTH;

    let lastX = -1;
    let lastY = -1;

    let currentTextBox = null;

    const writeText = () => {
        let textInfo = currentTextBox.value;
        let x = parseInt(currentTextBox.style.left, 10);
        let y = parseInt(currentTextBox.style.top, 10);

        stampHistory();
        drawFillText(textInfo, x - SCREEN_WIDTH * 0.03, y - SCREEN_HEIGHT * 0.03, line_thickness.value * 2, font_style);

        document.body.removeChild(currentTextBox);
        currentTextBox = null;
    };

    canvas.onclick = function(e) {
        if(currentTextBox != null) {
            writeText();
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
                writeText();
            }
        };

        currentTextBox.onmousedown = function() {
            writeText();
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

            stampHistory();
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
                        drawFillRect(y, x, thickness, thickness);
                    } else {
                        drawFillRect(x, y, thickness, thickness);
                    }
                } else {
                    if(steep) {
                        drawClearRect(y, x, thickness, thickness);
                    } else {
                        drawClearRect(x, y, thickness, thickness);
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
