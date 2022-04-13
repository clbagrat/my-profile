import { CreateContext } from "./CreateContext";
import { Coordinate } from "../../shared/types";
import { GetTextOffset } from "./GetTextOffset";
import { PixelIterator } from "./PixelIterator";

//TODO: make LineHeightAdjustments depend on a browser UA
const LineHeightAdjustments= 0.14;

export function ExtractParticleCoordinates(
  text: string,
  fontSize: number,
  fontFamily: string,
  rect: DOMRect,
): [Coordinate[], number] {
  const { width, height} = rect;
  const context = CreateContext(width, height);
  const offsets = GetTextOffset(fontFamily);

  if (!context) {
    throw new Error("No context");
  }

  context.fillStyle = "white";
  context.fillRect(0, 0, width, height);
  context.font = `${fontSize}px '${fontFamily}'`;
  context.fillStyle = "black";
  context.textBaseline = "top";
  context.fillText(text, 0, -offsets.y * (fontSize * 0.01) + fontSize * LineHeightAdjustments);
  console.log(context.measureText('T'));

  return [[...PixelIterator(context, 240)], context.measureText('T').width];
}
