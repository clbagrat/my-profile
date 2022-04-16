import { ParticleManager } from "../particle/ParticleManager";
import {GetAverageFps} from "../performance/MeasureFps";
import { Coordinate } from "../shared/types";
import { TextBlock } from "../textBlock/TextBlock";

const PARTICLE_STEP = 10;
const inkPlace: HTMLElement | null = document.querySelector('.ink');

export class InkManager {
  private _currentInkAmount: number = 0;

  get currentInkAmount() {
    return this._currentInkAmount;
  }

  set currentInkAmount(value: number) {
//    (inkPlace as HTMLElement).innerHTML = value.toString();
    this._currentInkAmount = value
  }

  constructor(private particleManager: ParticleManager) {
    this.currentInkAmount = 10000;
  }

  provideInkTo(textBlock: TextBlock) {
    const step = Math.min(PARTICLE_STEP, this.currentInkAmount);
    const allocatedParticlePlaces = textBlock.allocateParticlePlaces(step);
    const allocatedCount = allocatedParticlePlaces.length;

    if (allocatedCount) {
      this.currentInkAmount -= allocatedCount;
      allocatedParticlePlaces.forEach((destination: Coordinate) => {
        const particle = this.particleManager.getParticleFromPool();
        this.particleManager
          .moveParticle(
            particle,
            {
              x: destination.x + Math.random() * 100,
              y: destination.y + (0.5 - Math.random()) * 100,
            },
            destination
          )
          .then(() => {
            textBlock.receiveParticle(particle);
          });
      });
      window.requestAnimationFrame(() => this.provideInkTo(textBlock));
    } else {
      setTimeout(() => {

      const [fps] = GetAverageFps("textBlock");
      document.body.innerHTML += `<br /> <br /><br />\n \n ${fps.toString()}`;
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
