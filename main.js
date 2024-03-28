window.addEventListener("load", () => {
    const canvas = document.getElementById("canvas");
    const context = canvas.getContext("2d");

    // Resizing
    canvas.height = window.innerHeight * 0.8;
    canvas.width = window.innerWidth * 0.7;
});