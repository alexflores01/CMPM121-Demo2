const app = document.querySelector<HTMLElement>("#app")!;

interface Point {
  x: number;
  y: number;
}

interface DrawCommand {
  display(ctx: CanvasRenderingContext2D): void;
  drag(point: Point): void;
}

class StrokeCommand implements DrawCommand {
  constructor(
    private points: Point[],
    private width: number,
    private color: string,
  ) {}

  drag(point: Point) {
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

class StickerCommand implements DrawCommand {
  constructor(private p: Point, private emoji: string, private size: number) {
  }

  drag(point: Point) {
    this.p = point;
  }
  display(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.font = `${this.size}px serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(this.emoji, this.p.x, this.p.y);
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

type Tool =
  | { label: string; kind: "marker"; width: number }
  | { label: string; kind: "sticker"; emoji: string; size: number };

const tools: Tool[] = [
  { label: "Thin", kind: "marker", width: 2 },
  { label: "Thick", kind: "marker", width: 8 },
  { label: "🎃", kind: "sticker", emoji: "🎃", size: 40 },
  { label: "❤️", kind: "sticker", emoji: "❤️", size: 40 },
  { label: "👀", kind: "sticker", emoji: "👀", size: 40 },
];

let selectedTool: Tool = tools[0];

const toolBar = document.createElement("div");
canvas.after(toolBar);

function buildPalette() {
  toolBar.replaceChildren();
  for (const tool of tools) {
    const b = document.createElement("button");
    b.textContent = tool.label;
    b.style.fontWeight = tool === selectedTool ? "bold" : "normal";
    b.addEventListener("click", () => {
      selectedTool = tool;
      buildPalette();
    });
    toolBar.append(b);
  }
}
buildPalette();
function createCommand(tool: Tool, p: Point): DrawCommand {
  return tool.kind === "marker"
    ? new StrokeCommand([p], tool.width, "black")
    : new StickerCommand(p, tool.emoji, tool.size);
}

const exportButton = document.createElement("button");
exportButton.textContent = "Export";
exportButton.addEventListener("click", () => {
  const out = document.createElement("canvas");
  out.width = canvas.width * 2;
  out.height = canvas.height * 2;
  const octx = out.getContext("2d")!;
  octx.scale(2, 2);
  for (const command of commands) command.display(octx);
  const a = document.createElement("a");
  a.href = out.toDataURL("image/png");
  a.download = "sketchpad.png";
  a.click();
});

redoButton.after(exportButton);

// State of program
const commands: DrawCommand[] = [];
const redoStack: DrawCommand[] = [];
let currentCommand: DrawCommand | null = null;

updateButtons();

// Rendering the program
function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (const command of commands) command.display(ctx);
  currentCommand?.display(ctx);
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
  currentCommand = createCommand(selectedTool, pos(e));
  render();
});

canvas.addEventListener("pointermove", (e) => {
  if (!currentCommand) return;
  currentCommand.drag(pos(e));
  render();
});

canvas.addEventListener("pointerup", () => {
  if (!currentCommand) return;
  commit(currentCommand);
  currentCommand = null;
  render();
});

canvas.addEventListener("pointercancel", () => {
  currentCommand = null;
  render();
});

// Redraw Check
redrawButton.addEventListener("click", () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  setTimeout(render, 800);
});
