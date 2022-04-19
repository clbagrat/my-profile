import { Coordinate } from "../../shared/types";

export function* PixelIterator(
  context: CanvasRenderingContext2D,
  colorThreshold: number,
  offset: Coordinate,
  lh: number
): Generator<Coordinate> {
  const canvas = context.canvas;
  const { width, height } = canvas;
  const colorBuffer = context.getImageData(0, 0, width, height).data;
  const lineHeight = lh * window.devicePixelRatio;
  const rows = Math.floor(height / lineHeight);

  for (let r = 0; r < rows; r += 1) {
    for (let w = 0; w < width; w += 1) {
      for (
        let h = r * lineHeight;
        h < Math.min(rows, r + 1) * lineHeight;
        h += 1
      ) {
        const i = h * 4 * width + w * 4;

        const color =
          (colorBuffer[i] + colorBuffer[i + 1] + colorBuffer[i + 2]) / 3;
        if (color >= colorThreshold) continue;

        yield {
          x: offset.x + w / window.devicePixelRatio,
          y: offset.y + h / window.devicePixelRatio,
        };
      }
    }
  }
}

