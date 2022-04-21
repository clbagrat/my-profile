import {Coordinate} from "../../shared/types";
import { PixelIterator } from "./PixelIterator";

export const ExtractParticleCoordinatesFromImage = (context: CanvasRenderingContext2D, image: HTMLImageElement, rect: DOMRect): Coordinate[] => {
  if (!context) {
    throw new Error("No context");
  }
  context.fillRect(0, 0, image.width, image.height);
  context.drawImage(image, 0, 0, image.width, image.height);
  return [
    ...PixelIterator(context, 240, { x: rect.x, y: rect.y }, image.height),
  ];
}
