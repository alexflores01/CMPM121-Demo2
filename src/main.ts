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

const redrawButton = document.createElement("button");
redrawButton.textContent = "Redraw";

app.append(heading, message);

const ctx = canvas.getContext("2d")!;

// State of program
const commands: DrawCommand[] = [];
let currentStroke: StrokeCommand | null = null;

// Rendering the program
function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (const command of commands) command.display(ctx);
  currentStroke?.display(ctx);
}

// User Input
function pos(e: PointerEvent): Point {
  const rect = canvas.getBoundingClientRect();
  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top,
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
  commands.push(currentStroke); // commit on release
  currentStroke = null;
  render();
});

canvas.addEventListener("pointercancel", () => {
  currentStroke = null; // discard, never committed
  render();
});

// Redraw Check
redrawButton.addEventListener("click", () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  render();
});
