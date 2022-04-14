import { Coordinate } from "../../shared/types";

export function* PixelIterator(
  context: CanvasRenderingContext2D,
  colorThreshold: number,
  offset: Coordinate
) : Generator<Coordinate>{
  const canvas = context.canvas;
  const { width, height } = canvas;
  const colorBuffer = context.getImageData(0, 0, width, height).data;

  for (let w = 0; w < width; w += 1) {
    for(let h = 0; h < height; h += 1) {
      const i = h * 4 * width + w * 4;

      const color = (colorBuffer[i] + colorBuffer[i+1] + colorBuffer[i+2]) / 3;
      if (color >= colorThreshold) continue;

      yield {
        x: offset.x + w / window.devicePixelRatio,
        y: offset.y + h / window.devicePixelRatio
      }
    }
  }

//  for (let i = 0; i < colorBuffer.length; i += 4) {
//    const color = (colorBuffer[i] + colorBuffer[i+1] + colorBuffer[i+2]) / 3;
//    if (color >= colorThreshold) continue;
//
//    yield {
//      x: (i / 4) % width,
//      y: Math.floor((i / 4) / width)
//    }
//  }
}

