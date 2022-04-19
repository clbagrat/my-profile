import {Particle} from "../particle/ParticleManager";
import {Coordinate} from "../shared/types";

export interface IInkBlock {
  onClick(callback: (ib: IInkBlock) => void): void;
  getMissingParticleAmount(): number;
  allocateParticlePlaces(requestedAmountToAllocate: number): Coordinate[];
  wipeParticleAmount(requestedAmountToWipe: number): Coordinate[];
  receiveParticleCoord(coord: Coordinate): void;
  receiveParticle(particle: Particle): void;
}
