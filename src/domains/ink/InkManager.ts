import {ParticleManager} from "../particle/ParticleManager";
import {Coordinate} from "../shared/types";
import {TextBlock} from "../textBlock/TextBlock";
const PARTICLE_STEP = 30;
const inkPlace: HTMLElement | null = document.querySelector('.ink');

export class InkManager {
  private _currentInkAmount: number = 10800;

  get currentInkAmount() {
    return this._currentInkAmount;
  }

  set currentInkAmount(value: number) {
    (inkPlace as HTMLElement).innerHTML = value.toString();
    this._currentInkAmount = value
  }

  constructor(private particleManager: ParticleManager) {}

  provideInkTo(textBlock: TextBlock) {
    const step = Math.min(PARTICLE_STEP, this.currentInkAmount);
    const allocatedParticlePlaces = textBlock.allocateParticlePlaces(step);
    const allocatedCount = allocatedParticlePlaces.length;

    if (allocatedCount) {
      this.currentInkAmount -= allocatedCount;
      console.log(allocatedParticlePlaces);
      allocatedParticlePlaces.forEach((destination: Coordinate) => {
        const particle = this.particleManager.getParticleFromPool();
        this.particleManager
          .moveParticle(particle, { x: 100, y: 100 }, destination)
          .then(() => {
            textBlock.receiveParticle(particle);
          });
      });
      window.requestAnimationFrame(() => this.provideInkTo(textBlock));
    } else {
      console.log("DONE")
    }
  }

  consumeInkFrom(textBlock: TextBlock) {
    const step = PARTICLE_STEP;
    const particleCoordList = textBlock.wipeParticleAmount(step);

    if (particleCoordList.length) {
      particleCoordList.forEach((coord) => {
        const particle = this.particleManager.getParticleFromPool();
        this.particleManager
          .moveParticle(particle, coord, {x: 100, y: 100})
          .then(() => {
            this.currentInkAmount += 1;
            this.particleManager.release(particle);
          });
      });

      window.requestAnimationFrame(() => this.consumeInkFrom(textBlock));
    }
  }
}
