import { Particle, ParticleManager } from "../particle/ParticleManager";
import { Coordinate } from "../shared/types";
import { IInkBlock } from "./IInkBlock";
import { CreateContext } from "./_locals/CreateContext";
import {InkBlockProgressDecorator} from "./_locals/InkBlockProgressDecorator";
import "./_locals/squareBlock.css";

export class SquareBlock implements IInkBlock {
  private particleCoordList: Coordinate[] = [];
  private particleCount = 0;
  private takenParticleCount = 0;
  private allocatedParticleCount = 0;
  private size: number;
  private context: CanvasRenderingContext2D;
  private canvas: HTMLElement;
  private rect: DOMRect = new DOMRect();

  constructor(
    public node: HTMLElement,
    private particleManager: ParticleManager,
    particleCount: number,
    isComplete: boolean
  ) {
    this.particleCount = Math.pow(Math.ceil(Math.sqrt(particleCount)), 2);
    const w = Math.sqrt(this.particleCount);
    const [context, canvas] = CreateContext(w, w, window.devicePixelRatio);
    this.context = context;
    this.size = w;
    this.canvas = canvas;
    this.canvas.classList.add("square-block");
    node.appendChild(canvas);

    requestAnimationFrame(() => {
      this.recalculate();
      if (isComplete) {
        this.takenParticleCount = this.particleCount;
      }

      this.updateSquare("full");
      this.addListener();
    });
  }

  recalculate(): void {
    this.rect = this.canvas.getBoundingClientRect();
    this.rect.x = window.scrollX + this.rect.x;
    this.rect.y = window.scrollY + this.rect.y;
    const w = Math.sqrt(this.particleCount);
    this.particleCoordList = [];
    for (let y = 0; y < w; y += 1) {
      for (let x = 0; x < w; x += 1) {
        this.particleCoordList.push({ x: x + this.rect.x, y: y + this.rect.y });
      }
    }
  }

  getParticleAmount(): number {
    return this.particleCount;
  }

  getTakenParticleAmount(): number {
    return this.takenParticleCount;
  }

  private onCompleteCallbacks: ((tb: IInkBlock) => void)[] = [];
  onComplete(callback: (ib: IInkBlock) => void): void {
    this.onCompleteCallbacks.push(callback);
  }

  private onFullCallbacks: ((tb: IInkBlock) => void)[] = [];
  onFull(callback: (ib: IInkBlock) => void): void {
    this.onFullCallbacks.push(callback);
  }

  private onEmptyCallbacks: ((tb: IInkBlock) => void)[] = [];
  onEmpty(callback: (ib: IInkBlock) => void): void {
    this.onEmptyCallbacks.push(callback);
  }

  private callbacks: ((ib: IInkBlock) => void)[] = [];
  onClick(callback: (inkBlock: IInkBlock) => void) {
    this.callbacks.push(callback);
  }

  getMissingParticleAmount(): number {
    return (
      this.particleCount - this.allocatedParticleCount - this.takenParticleCount
    );
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

    const takenCount = this.takenParticleCount;

    for (
      let i = takenCount - 1;
      i > takenCount - 1 - particleAmoutToWipe;
      i -= 1
    ) {
      res.push(this.particleCoordList[i]);
      this.takenParticleCount -= 1;
      this.handleParticleAmountChange(-1);
    }

    return res;
  }

  receiveParticleCoord(coord: Coordinate): void {
    this.allocatedParticleCount -= 1;
    this.takenParticleCount += 1;
    this.handleParticleAmountChange(1);
  }

  receiveParticle(particle: Particle): void {
    this.allocatedParticleCount -= 1;
    this.takenParticleCount += 1;

    this.handleParticleAmountChange(1);
    this.particleManager.release(particle);
  }

  @InkBlockProgressDecorator
  private handleParticleAmountChange(diff: number) {
    if (this.takenParticleCount === 0) {
      this.onEmptyCallbacks.forEach((c) => c(this));
    }

    if (
      this.takenParticleCount ===
      this.particleCount - this.allocatedParticleCount
    ) {
      this.onFullCallbacks.forEach((c) => c(this));
    }

    if (this.takenParticleCount === this.particleCount) {
      this.onCompleteCallbacks.forEach((c) => c(this));
    }
    if (diff > 0) {
      this.updateSquare("add");
    } else {
      this.updateSquare("remove");
    }
  }

  private addListener() {
    this.canvas.addEventListener("click", () => {
      this.callbacks.forEach((cb) => cb(this));
    });
  }

  private updateSquare(type: "full" | "add" | "remove") {
    this.context.fillStyle = "black";
    if (type === "add") {
      const coord = this.particleCoordList[this.takenParticleCount - 1];
      this.context.fillRect(coord.x - this.rect.x, coord.y - this.rect.y, 1, 1);
    }

    if (type === "remove") {
      const coord = this.particleCoordList[this.takenParticleCount - 1];
      if (coord) {
        this.context.clearRect(coord.x - this.rect.x, coord.y - this.rect.y, 1, 1);
      }
    }

    if (type === "full") {
      if (this.takenParticleCount > this.particleCount / 2) {
        this.context.fillRect(0, 0, this.size, this.size);
        for (
          let i = this.takenParticleCount - 1;
          i < this.particleCount;
          i += 1
        ) {
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
}
