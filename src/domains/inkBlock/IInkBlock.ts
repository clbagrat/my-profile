import {Particle} from "../particle/ParticleManager";
import {Coordinate} from "../shared/types";

export interface IInkBlock {
  node: HTMLElement;
  onClick(callback: (ib: IInkBlock) => void): void;
  onComplete(callback: (ib: IInkBlock) => void): void;
  onFull(callback: (ib: IInkBlock) => void): void;
  onEmpty(callback: (ib: IInkBlock) => void): void;
  getMissingParticleAmount(): number;
  getParticleAmount(): number;
  getTakenParticleAmount(): number;
  allocateParticlePlaces(requestedAmountToAllocate: number): Coordinate[];
  wipeParticleAmount(requestedAmountToWipe: number): Coordinate[];
  receiveParticleCoord(coord: Coordinate): void;
  receiveParticle(particle: Particle): void;
  recalculate(): void;
}
