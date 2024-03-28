const canvas = document.getElementById("canvas");
const color_picker = document.getElementById("color-picker");
const color_box = document.getElementById("color-box");

const SCREEN_HEIGHT = window.innerHeight;
const SCREEN_WIDTH = window.innerWidth;

// Mouse

let mousePressed = false;

document.body.onmousedown = () => { mousePressed = true;  };
document.body.onmouseup   = () => { mousePressed = false; };

// Color

const make_color = (r, g, b) => { return "rgb(" + r + "," + g + "," + b + ")"; };

let selected_color = make_color(0, 0, 0);
let hovered_color = make_color(0, 0, 0);

// Initialize

const init_canvas = () => {
    canvas.height = SCREEN_HEIGHT * 0.8;
    canvas.width = SCREEN_WIDTH * 0.7;
};

const init_color_picker = () => {
    const WIDTH = 25;
    const HEIGHT = 12;
    const PIXEL_SIZE = SCREEN_WIDTH / 110;

    console.log(PIXEL_SIZE);

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

            pixel.onclick      = () => { selected_color = color; };
            pixel.onmouseenter = () => { hovered_color = color; };
            pixel.onmouseleave = () => { hovered_color = selected_color; }

            row.appendChild(pixel);
        }

        color_picker.appendChild(row);
    }
};

const init_color_box = () => {
    color_box.style.height = (SCREEN_HEIGHT / 10) + "px";
    color_box.style.width = color_box.style.height;
};

window.addEventListener("load", () => {
    init_canvas();
    init_color_picker();
    init_color_box();
});

// Update

const update_color_box = () => {
    color_box.style.background = hovered_color;
};

const update_screen = () => {
    update_color_box();
};

const FPS = 60;
setInterval(update_screen, 1000 / FPS);