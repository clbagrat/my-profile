import { CreateContext } from "../canvas/CreateContext";
import { PixelIterator } from "../canvas/PixelIterator";

export type ParticleCoordinate = { x: number; y: number };

//TODO: make LineHeightAdjustments depend on a browser UA
const LineHeightAdjustments= 0.14;

export function GenerateParticleCoordinates(
  text: string,
  fontSize: number,
  fontFamily: string,
  rect: DOMRect,
  offsets: {x: number, y: number}
): ParticleCoordinate[] {
  const { width, height} = rect;
  const context = CreateContext(width, height);

  if (!context) {
    throw new Error("No context");
  }

  context.fillStyle = "white";
  context.fillRect(0, 0, width, height);
  context.font = `${fontSize}px '${fontFamily}'`;
  context.fillStyle = "black";
  context.textBaseline = "top";
  context.fillText(text, 0, -offsets.y * (fontSize * 0.01) + fontSize * LineHeightAdjustments);
  const coords: ParticleCoordinate[] = [...PixelIterator(context, 240)];

  return coords;
}
