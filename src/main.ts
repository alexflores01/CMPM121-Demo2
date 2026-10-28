const app = document.querySelector<HTMLElement>("#app")!;

interface Point {
  x: number;
  y: number;
}

interface DrawCommand {
  display(ctx: CanvasRenderingContext2D): void;
}

class StrokeCommand implements DrawCommand {
  constructor(
    private points: Point[],
    private width: number,
    private color: string,
  ) {}

  addPoint(point: Point) {
    this.points.push(point);
  }

  display(ctx: CanvasRenderingContext2D) {
    if (this.points.length === 0) return;
    ctx.save();
    ctx.strokeStyle = this.color;
    ctx.lineWidth = this.width;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(this.points[0].x, this.points[0].y);
    for (const p of this.points.slice(1)) ctx.lineTo(p.x, p.y);
    if (this.points.length === 1) {
      ctx.lineTo(this.points[0].x, this.points[0].y);
    }
    ctx.stroke();
    ctx.restore();
  }
}

// UI Code
const heading = document.createElement("h1");
heading.textContent = "D2 Sketchpad";

const message = document.createElement("p");
message.textContent = "By Alex Flores and Umayr Rai.";

const canvas = document.createElement("canvas");
canvas.width = 500;
canvas.height = 500;
canvas.style.border = "2px solid black";
canvas.style.touchAction = "none";

// BUttons
const redrawButton = document.createElement("button");
redrawButton.textContent = "Redraw";
const undoButton = document.createElement("button");
undoButton.textContent = "Undo";
const redoButton = document.createElement("button");
redoButton.textContent = "Redo";

app.append(
  heading,
  message,
  canvas,
  document.createElement("br"),
  redrawButton,
  undoButton,
  redoButton,
);

undoButton.addEventListener("click", undo);
redoButton.addEventListener("click", redo);

const ctx = canvas.getContext("2d")!;

// State of program
const commands: DrawCommand[] = [];
const redoStack: DrawCommand[] = [];
let currentStroke: StrokeCommand | null = null;

updateButtons();

// Rendering the program
function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (const command of commands) command.display(ctx);
  currentStroke?.display(ctx);
}

// History Functions
function commit(command: DrawCommand) {
  commands.push(command);
  redoStack.length = 0;
  updateButtons();
  render();
}

function undo() {
  const command = commands.pop();
  if (!command) return;
  redoStack.push(command);
  updateButtons();
  render();
}

function redo() {
  const command = redoStack.pop();
  if (!command) return;
  commands.push(command);
  updateButtons();
  render();
}

function updateButtons() {
  undoButton.disabled = commands.length === 0;
  redoButton.disabled = redoStack.length === 0;
}

// User Input
function pos(e: PointerEvent): Point {
  const rect = canvas.getBoundingClientRect();
  return {
    x: e.clientX - rect.left - canvas.clientLeft,
    y: e.clientY - rect.top - canvas.clientTop,
  };
}

canvas.addEventListener("pointerdown", (e) => {
  canvas.setPointerCapture(e.pointerId);
  currentStroke = new StrokeCommand([pos(e)], 2, "black");
  render();
});

canvas.addEventListener("pointermove", (e) => {
  if (!currentStroke) return;
  currentStroke.addPoint(pos(e));
  render();
});

canvas.addEventListener("pointerup", () => {
  if (!currentStroke) return;
  commit(currentStroke);
  currentStroke = null;
  render();
});

canvas.addEventListener("pointercancel", () => {
  currentStroke = null;
  render();
});

// Redraw Check
redrawButton.addEventListener("click", () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  setTimeout(render, 800);
});
