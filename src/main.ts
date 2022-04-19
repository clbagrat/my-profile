import "./style.css";
import { TextBlock } from "./domains/inkBlock/TextBlock";
import { InkManager } from "./domains/ink/InkManager";
import { ParticleManager } from "./domains/particle/ParticleManager";
import {InkContainer} from "./domains/ink/InkContainer";
import {SquareBlock} from "./domains/inkBlock/SquareBlock";
//import { GenerateParticleCoordinates, ParticleCoordinate } from "./domains/particle/GenerateParticleCoordinates";
//import { CreateInkPixel } from "./domains/domElements/CreateInkPixel";
//
//
window.devicePixelRatio = 2;
window.myTransform = { x: 0, y: 0 };
//
document.addEventListener("mousemove", (e) => {
  window.myTransform.x = e.clientX;
  window.myTransform.y = e.clientY;
});
//
//const setPixelsInPlace = (pixels: HTMLDivElement[], wordCoords: ParticleCoordinate[], rect: DOMRect, reverse?: boolean) => {
//  const nodes = pixels.splice(0, 120);
//  const coords = wordCoords.splice(0, 120);
//  nodes.forEach((node, i) => {
//    const inkSize = 0.5;
//    const coord = coords[i];
//    const x = coord.x * inkSize + rect.x;
//    const y = coord.y * inkSize + rect.y;
//
//    if (reverse) {
//      node.style.setProperty(
//        "--transformTo",
//        `translate(${myTransform.x}px, ${myTransform.y}px)`
//      );
//      node.style.setProperty("--transformFrom", `translate(${x}px, ${y}px)`);
//      node.classList.remove("moving");
//      node.classList.add("removing");
//    } else {
//      node.style.setProperty(
//        "--transformFrom",
//        `translate(${myTransform.x}px, ${myTransform.y}px)`
//      );
//      node.style.setProperty("--transformTo", `translate(${x}px, ${y}px)`);
//      node.classList.add("moving");
//    }
//
//  });
//
//  if (pixels.length) {
//    requestAnimationFrame(() => {
//      setPixelsInPlace(pixels, wordCoords, rect, reverse);
//    });
//  }
//  else {
//    if (reverse) {
//      (document.querySelector('.text') as HTMLDivElement).style.opacity = '0';
//      (document.querySelector('.pixelSpace') as HTMLDivElement).style.opacity = '1';
//    } else {
//      setTimeout(() => {
//        (document.querySelector(".text") as HTMLDivElement).style.opacity = "1";
//        (
//          document.querySelector(".pixelSpace") as HTMLDivElement
//        ).style.opacity = "0";
//      }, 1000);
//    }
//  }
//}
//
//function shuffle(array: any[]) {
//  let currentIndex = array.length,  randomIndex;
//
//  // While there remain elements to shuffle.
//  while (currentIndex != 0) {
//
//    // Pick a remaining element.
//    randomIndex = Math.floor(Math.random() * currentIndex);
//    currentIndex--;
//
//    // And swap it with the current element.
//    [array[currentIndex], array[randomIndex]] = [
//      array[randomIndex], array[currentIndex]];
//  }
//
//  return array;
//}
//
//document.fonts.onloadingdone = () => {
//  const textList = document.querySelectorAll<HTMLDivElement>("[data-text]");
//  textList.forEach((node: HTMLDivElement) => {
//    const { text = "", font = "32", fontFamily = "" } = node.dataset;
//    node.innerHTML = text;
//    node.style.fontSize = `${font}px`;
//    node.style.fontFamily = fontFamily;
//    node.style.lineHeight = `${font}px`;
//
//    const rect = node.getBoundingClientRect();
//    const offsets = GetTextOffset();
//
//    const wordCoords = GenerateParticleCoordinates(
//      text,
//      parseInt(font, 10),
//      fontFamily,
//      rect,
//      offsets
//    );
//
//
//    let count = 0;
//    for (let coord of wordCoords) {
//      CreateInkPixel(coord, 1);
//      count++;
//    }
//    console.log({count})
//    document.addEventListener("click", () => {
//      setPixelsInPlace(
//        Array.from(document.querySelectorAll<HTMLDivElement>(".inkPixel")),
//        shuffle([...wordCoords]),
//        rect,
//      );
//    }, {once: true});
//
//  });
//};
//

const particlePlace = document.querySelector(".particlePlace") as HTMLElement;
const particeManager = new ParticleManager(particlePlace, 2500);

const inkManager = new InkManager(particeManager);
//const inkContainer = new InkContainer(inkManager, document.querySelector(".ink-container") as HTMLElement);

setTimeout(() => {
  const textList = document.querySelectorAll<HTMLDivElement>("[data-text]");

  console.log({ inkManager });
  textList.forEach((node: HTMLDivElement) => {
    const textBlock = new TextBlock(node, particeManager);
    console.log(textBlock)
    inkManager.register(textBlock);
    requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const squareblock = new SquareBlock(
        document.querySelector("[data-square]") as HTMLElement,
        textBlock.getMissingParticleAmount(),
        true
      );
      console.log(squareblock)
      inkManager.register(squareblock);
    });
    });
  });

}, 1000);
