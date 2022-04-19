import { Particle } from "../particle/ParticleManager";
import { Coordinate } from "../shared/types";
import { IInkBlock } from "./IInkBlock";
import {CreateContext} from "./_locals/CreateContext";

export class SquareBlock implements IInkBlock {
  private callbacks: ((ib: IInkBlock) => void)[] = [];
  private particleCoordList: Coordinate[] = []
  private particleCount: number = 0;
  private takenParticleCount: number = 0;
  private allocatedParticleCount: number = 0;
  private particlesInPossession: Particle[] = [];
  private size: number;
  private context: CanvasRenderingContext2D;
  private rect: DOMRect = new DOMRect();

  constructor(node:HTMLElement, particleCount: number, isComplete: boolean) {
    console.log({particleCount});
    this.particleCount = Math.pow(Math.ceil(Math.sqrt(particleCount)), 2);
    const w = Math.sqrt(this.particleCount);
    const [context, canvas] = CreateContext(w, w, window.devicePixelRatio);
    this.context = context;
    this.size = w;
    node.appendChild(canvas);

    requestAnimationFrame(() => {
      const rect = canvas.getBoundingClientRect();
      this.rect = rect;
      for (let y = 0; y < w; y += 1) {
        for (let x = 0; x < w; x += 1) {
          this.particleCoordList.push({ x: x + rect.x, y: y + rect.y });
        }
      }

      if (isComplete) {
        this.takenParticleCount = this.particleCount;
      }

      this.updateSquare();
    });


  }

  onClick(callback: (inkBlock: IInkBlock) => void) {
    this.callbacks.push(callback);
  }

  getMissingParticleAmount(): number {
    return this.particleCount - this.allocatedParticleCount - this.takenParticleCount;
  }

  allocateParticlePlaces(requestedAmountToAllocate: number): Coordinate[] {
    const res: Coordinate[] = [];
    const reservedParticlePlacesCount =
      this.takenParticleCount + this.allocatedParticleCount;

    const possibleAmountToAllocate = Math.min(
      this.particleCount - reservedParticlePlacesCount,
      requestedAmountToAllocate
    );

    this.allocatedParticleCount += possibleAmountToAllocate;

    for (
      let i = reservedParticlePlacesCount;
      i < reservedParticlePlacesCount + possibleAmountToAllocate;
      i += 1
    ) {
      res.push(this.particleCoordList[i]);
    }

    return res;
  }

  wipeParticleAmount(requestedAmountToWipe: number): Coordinate[] {
    const res: Coordinate[] = [];

    if (this.takenParticleCount === 0) {
      return res;
    }

    const particleAmoutToWipe = Math.min(
      this.takenParticleCount,
      requestedAmountToWipe
    );


    for (
      let i = this.takenParticleCount - 1 ;
      i > this.takenParticleCount - 1 - particleAmoutToWipe;
      i -= 1
    ) {
      res.push(this.particleCoordList[i]);
    }

    this.takenParticleCount -= particleAmoutToWipe;
    this.handleParticleAmountChange();
    return res;
  }

  receiveParticleCoord(coord: Coordinate): void {
    this.allocatedParticleCount -= 1;
    this.takenParticleCount += 1;
    this.handleParticleAmountChange();
  }

  receiveParticle(particle: Particle): void {
    this.allocatedParticleCount -= 1;
    this.takenParticleCount += 1;

    this.particlesInPossession[this.takenParticleCount - 1] = particle;
    this.handleParticleAmountChange();
  }

  private handleParticleAmountChange() {
    this.updateSquare();
    if (this.takenParticleCount === 67) {
      this.context.canvas.style.opacity = 0..toString();
    }
  }

  private updateSquare() {
    this.context.fillStyle = "black";
    if (this.takenParticleCount > this.particleCount / 2) {
      this.context.fillRect(0, 0, this.size, this.size);
      for (let i = this.takenParticleCount - 1; i < this.particleCount; i += 1) {
        const coord = this.particleCoordList[i];
        this.context.clearRect(
          coord.x - this.rect.x,
          coord.y - this.rect.y,
          1,
          1
        );
      }
    } else {
      this.context.clearRect(0, 0, this.size, this.size);

      for (let i = 0; i < this.particleCount; i += 1) {
        if (i >= this.takenParticleCount) {
          break;
        }
        const coord = this.particleCoordList[i];
        this.context.fillRect(
          coord.x - this.rect.x,
          coord.y - this.rect.y,
          1,
          1
        );
      }
    }

  }
}
