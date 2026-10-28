const app = document.querySelector<HTMLElement>("#app")!;

const heading = document.createElement("h1");
heading.textContent = "D2 project";

const message = document.createElement("p");
message.textContent = "Your project starts here.";

const canvas = document.createElement("canvas");
canvas.width = 500;
canvas.height = 500;
canvas.style.border = "2px solid black";
canvas.style.touchAction = "none";

app.append(heading, message);

const ctx = canvas.getContext("2d")!;
let isDrawing = false;

function pos(e: PointerEvent) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top,
  };
}

canvas.addEventListener("pointerdown", (e) => {
  isDrawing = true;
  const { x, y } = pos(e);
  ctx.beginPath();
  ctx.moveTo(x, y);
});
canvas.addEventListener("pointermove", (e) => {
  if (!isDrawing) return;
  const { x, y } = pos(e);
  ctx.lineTo(x, y);
  ctx.stroke();
});

canvas.addEventListener("pointerup", () => {
  isDrawing = false;
});
canvas.addEventListener("pointerleave", () => {
  isDrawing = false;
});
canvas.addEventListener("pointercancel", () => {
  isDrawing = false;
});
