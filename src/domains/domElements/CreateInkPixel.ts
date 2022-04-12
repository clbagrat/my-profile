import { ParticleCoordinate } from "../particle/GenerateParticleCoordinates";
import "./inkStyle.css";

export function CreateInkPixel(
  coords: ParticleCoordinate,
  inkSize: number = 5
) {
  const node = document.createElement("div");
  node.classList.add("inkPixel");
  node.style.setProperty("--inkSize", `${inkSize/window.devicePixelRatio}px`);

//  node.style.transform = `translateX(${coords.x * inkSize}px) translateY(${
//    coords.y * inkSize
//  }px)`;

  document.querySelector('.pixelSpace')?.appendChild(node);
}
