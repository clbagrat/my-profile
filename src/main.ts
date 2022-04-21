import "./style.css";
import { InkManager } from "./domains/ink/InkManager";
import { ParticleManager } from "./domains/particle/ParticleManager";
import { ProfileExperienceManager } from "./domains/profileExperience/ProfileExperienceManager";
import { RunIntroExperience } from "./domains/profileExperience/IntroExperience";
import {RunMainExperience} from "./domains/profileExperience/MainExperience";
import {Grid} from "./domains/profileExperience/Grid";

window.devicePixelRatio = 2;
const particlePlace = document.querySelector(".particlePlace") as HTMLElement;
const particeManager = new ParticleManager(particlePlace, 2500);
const inkManager = new InkManager(particeManager);
const grid = new Grid(document.querySelector(".center") as HTMLElement);

window.addEventListener("resize", () => {
  requestAnimationFrame(() => {
    inkManager.recalculateAll();
  })
});

(window.fontLoaded as Promise<void>).then(() => {
  requestAnimationFrame(() => {
    RunIntroExperience(particeManager, inkManager, grid).then(
      () => {
        RunMainExperience(particeManager, inkManager, grid).then(
          alert.bind(null, "You've made it! Thanks a lot for your time")
        )
      }
    );
  });
});


//setTimeout(() => {
//  const textList = document.querySelectorAll<HTMLDivElement>("[data-text]");
//
//  console.log({ inkManager });
//  textList.forEach((node: HTMLDivElement) => {
//    const textBlock = TextBlock.CreateFromNode(node, particeManager);
//    inkManager.register(textBlock);
//    requestAnimationFrame(() => {
//    requestAnimationFrame(() => {
//      const squareblock = new SquareBlock(
//        document.querySelector("[data-square]") as HTMLElement,
//        textBlock.getMissingParticleAmount(),
//        true
//      );
//      inkManager.register(squareblock);
//      textBlock.onFull(() => {
//        document.querySelector("[data-square]")?.remove();
//      })
//    });
//    });
//  });
//
//}, 1000);
