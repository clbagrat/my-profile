export function GetTextOffset(font: string = "Fira Code") {
  const size = 32;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("no context");
  }

  ctx.font = `100px '${font}'`;
  ctx.fillStyle = "#f00";
  ctx.textBaseline = "top"; 
  ctx.fillText("F", 0, 0);

  const data = ctx.getImageData(0, 0, size, size).data;
  let p;

  let from = data.length - size * 4;

  for (p = from; p < data.length; p += 4) {
    if (data[p]) break;
  }

  const x = (p - from) / 4;

  from = (size - 1) * 4;
  for (p = from; p < data.length; p += size * 4) {
    if (data[p]) break;
  }

  const y = (p - from) / (size * 4);

  return {x, y}
}
