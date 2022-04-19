import { CreateContext } from "./CreateContext";
import { Coordinate } from "../../shared/types";
import { GetTextOffset } from "./GetTextOffset";
import { PixelIterator } from "./PixelIterator";

//TODO: make LineHeightAdjustments depend on a browser UA
const LineHeightAdjustments= 0.11;

export function ExtractParticleCoordinates(
  text: string,
  fontSize: number,
  fontFamily: string,
  rect: DOMRect,
): [Coordinate[], number, number[]] {
  const { width, height, x, y} = rect;
  console.log({width, height})
  const [context] = CreateContext(width, height, window.devicePixelRatio);
  const offsets = GetTextOffset(fontFamily);

  if (!context) {
    throw new Error("No context");
  }


  context.fillStyle = "white";
  context.fillRect(0, 0, width, height);
  context.font = `${fontSize}px '${fontFamily}'`;
  context.fillStyle = "black";
  context.textBaseline = "top";

//  context.canvas.style.position = "absolute";
//  context.canvas.style.left = rect.left + 'px';
//  context.canvas.style.top = rect.top + 'px';
//  document.body.appendChild(context.canvas);

  const textArray = text.split(" ");
  let lineCount = 0;
  let lastWordIndex = 0;
  let charsPerRow: number[] = [];

  for (let i = 0; i < textArray.length; i += 1) {
    const measure = context.measureText(
      textArray.slice(lastWordIndex, i + 1).join(" ")
    ).width;

    const targetIndex = i;
    if (measure > width) {
      const textSlice = textArray.slice(lastWordIndex, targetIndex).join(" ")+ ' ';

      context.fillText(
        textSlice,
        0,
        -offsets.y * (fontSize * 0.01) +
          fontSize * LineHeightAdjustments +
          lineCount * fontSize
      );

      charsPerRow.push(textSlice.length);
      lastWordIndex = i;
      lineCount += 1;
    }

  }
      context.fillText(
        textArray.slice(lastWordIndex).join(" "),
        0,
        -offsets.y * (fontSize * 0.01) +
          fontSize * LineHeightAdjustments +
          lineCount * fontSize
      );

//  const oneLetterWidth = context.measureText('T').width;
//  
//  context.beginPath()
//  context.strokeStyle = "black"
//  for (let i = 0; i < Math.floor(width/ oneLetterWidth) ; i += 1) {
//    context.moveTo(i * oneLetterWidth, 0);
//    context.lineTo(i * oneLetterWidth, 100);
//  }
//  context.stroke();

  return [
    [...PixelIterator(context, 240, { x, y }, fontSize)],
    context.measureText("T").width,
    charsPerRow
  ];
}
