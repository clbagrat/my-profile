import { InkManager } from "../ink/InkManager";
import { ParticleManager } from "../particle/ParticleManager";
import {Grid} from "./Grid";
import { InkBlockCreatorFactory } from "./_locals/PopulateInkBlock";

export const RunIntroExperience = (
  particleManager: ParticleManager,
  inkManager: InkManager,
  grid: Grid
): Promise<void> => {
  return new Promise((res) => {
    const create = InkBlockCreatorFactory(particleManager, inkManager);

    const introText = create(grid.get("centerTop"), {
      type: "TextBlock",
      text: "Strive for simplicity, doesn't matter how complex it is",
      fontSize: "16",
      fontFamily: "Fira Code",
      isComplete: false,
    })

    requestAnimationFrame(() => {
      const square = create(grid.get("centerCenter"), {
        type: "SquareBlock",
        particleAmount: introText.getParticleAmount(),
        isComplete: true
      });

      introText.onFull(() => {
        square.node.remove();
        inkManager.unregister(square);
      });

      introText.onComplete(() => {
          res();
      });

    });
  });
};
