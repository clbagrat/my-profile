export function CreateContext(width: number, height: number, ratio: number = 2): CanvasRenderingContext2D | null {
  const canvas: HTMLCanvasElement = document.createElement("canvas");
  const dpr = ratio;
  
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.width = `${width}px`
  canvas.style.height = `${height}px`

  const context = canvas.getContext("2d");
//  document.body.appendChild(canvas)
  
  context?.setTransform(dpr, 0, 0, dpr, 0, 0);

  return canvas.getContext("2d");
}
