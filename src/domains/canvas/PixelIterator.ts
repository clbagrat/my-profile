import { ParticleCoordinate } from "../particle/GenerateParticleCoordinates";

export function* PixelIterator(
  context: CanvasRenderingContext2D,
  colorThreshold: number,
) : Generator<ParticleCoordinate>{
  const canvas = context.canvas;
  const { width, height } = canvas;
  const colorBuffer = context.getImageData(0, 0, width, height).data;

  for (let i = 0; i < colorBuffer.length; i += 4) {
    const color = (colorBuffer[i] + colorBuffer[i+1] + colorBuffer[i+2]) / 3;
    if (color >= colorThreshold) continue;

    yield {
      x: (i / 4) % width,
      y: Math.floor((i / 4) / width)
    }
  }
}

