let setUpWhiteboard = function () {
    const whiteboard = document.getElementById('whiteboard-div');
    const canvas = document.getElementById('whiteboard-canvas');
    const ctx = canvas.getContext('2d');
    let drawing = false;
    let erasing = false;

    // Set canvas dimensions to match the whiteboard
    canvas.width = whiteboard.clientWidth;
    canvas.height = whiteboard.clientHeight;

    const startDrawing = (e) => {
        drawing = true;
        ctx.beginPath();
        ctx.moveTo(e.offsetX, e.offsetY);
    };

    const draw = (e) => {
        if (!drawing) return;
        ctx.lineTo(e.offsetX, e.offsetY);
        ctx.strokeStyle = erasing ? 'lightblue' : 'black';
        ctx.lineWidth = erasing ? 10 : 5;
        ctx.stroke();
    };

    const stopDrawing = () => {
        drawing = false;
        ctx.closePath();
    };

    const toggleEraser = () => {
        erasing = !erasing;
    };

    const clearCanvas = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    };

    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);

    document.getElementById('whiteboard-draw').addEventListener('click', () => { erasing = false; });
    document.getElementById('whiteboard-erase').addEventListener('click', toggleEraser);
    document.getElementById('whiteboard-clear').addEventListener('click', clearCanvas);
};

export {
    setUpWhiteboard
}