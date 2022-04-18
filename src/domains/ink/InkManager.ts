import { ParticleManager } from "../particle/ParticleManager";
import { GetAverageFps } from "../performance/MeasureFps";
import { Coordinate } from "../shared/types";
import { TextBlock } from "../textBlock/TextBlock";

const PARTICLE_STEP = 10;
const ANIMATE_EVERY = 1;

export class InkManager {
  private _currentInkAmount: number = 0;

  get currentInkAmount() {
    return this._currentInkAmount;
  }

  set currentInkAmount(value: number) {
    this._currentInkAmount = value;
  }

  constructor(private particleManager: ParticleManager) {
    this.currentInkAmount = 100000;
  }

  provideInkTo(textBlock: TextBlock) {
    const step = Math.min(PARTICLE_STEP, this.currentInkAmount);
    const allocatedParticlePlaces = textBlock.allocateParticlePlaces(step);
    const allocatedCount = allocatedParticlePlaces.length;

    if (allocatedCount) {
      this.currentInkAmount -= allocatedCount;
      for (let i = 0; i < allocatedParticlePlaces.length; i += ANIMATE_EVERY) {
        const destination = allocatedParticlePlaces[i];
        const from = {
          x: destination.x + Math.random() * 200,
          y: destination.y + (0.5 - Math.random()) * 80,
        };
        const particle = this.particleManager.getParticleFromPool();
        this.particleManager
          .moveParticle(particle, from, destination, true)
          .then(() => {
            textBlock.receiveParticle(particle);
            for (let d = i + 1; d < Math.min(i + ANIMATE_EVERY, allocatedParticlePlaces.length); d += 1) {
              textBlock.receiveParticleCoord(allocatedParticlePlaces[d]);
//              const particle = this.particleManager.getParticleFromPool();
//              this.particleManager
//                .moveParticle(particle, from, allocatedParticlePlaces[d], false)
//                .then(() => {
//                  textBlock.receiveParticle(particle);
//                });
            }
          });
      }
      window.requestAnimationFrame(() => this.provideInkTo(textBlock));
    } else {
      setTimeout(() => {

      const [fps, sum] = GetAverageFps("textBlock");
      document.body.innerHTML += `<br /> <br /><br />\n \n ${fps.toString()} ${sum.toString()}`;
      console.log("DONE", )
      }, 1000);
    }
  }

  consumeInkFrom(textBlock: TextBlock) {
    const step = PARTICLE_STEP;
    const particleCoordList = textBlock.wipeParticleAmount(step);

    if (particleCoordList.length) {
      particleCoordList.forEach((coord) => {
        const particle = this.particleManager.getParticleFromPool();
        this.particleManager
          .moveParticle(particle, coord, {
              x: window.myTransform.x + (0.5 - Math.random()) * 30,
              y: window.myTransform.y + (0.5 - Math.random()) * 30,
          })
          .then(() => {
            this.currentInkAmount += 1;
            this.particleManager.release(particle);
          });
      });

      window.requestAnimationFrame(() => this.consumeInkFrom(textBlock));
    }
  }
}
