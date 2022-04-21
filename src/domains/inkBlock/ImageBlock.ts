import { Particle, ParticleManager } from "../particle/ParticleManager";
import { Coordinate } from "../shared/types";
import { IInkBlock } from "./IInkBlock";
import { CreateContext } from "./_locals/CreateContext";
import {ExtractParticleCoordinatesFromImage} from "./_locals/ExtractParticleCoordinateFromImage";
import {GetImageData} from "./_locals/GetImageData";
import {InkBlockProgressDecorator} from "./_locals/InkBlockProgressDecorator";
import "./_locals/squareBlock.css";

export class ImageBlock implements IInkBlock {
  private particleCoordList: Coordinate[] = [];
  private particleCount = 0;
  private takenParticleCount = 0;
  private allocatedParticleCount = 0;
  private context: CanvasRenderingContext2D | undefined;
  private canvas: HTMLElement | undefined;
  private rect: DOMRect = new DOMRect();
  private image: HTMLImageElement;

  constructor(
    public node: HTMLElement,
    private particleManager: ParticleManager,
    imageBase64: string,
    isComplete: boolean
  ) {
    const image = GetImageData(imageBase64);
    this.image = image;
    image.onload = () => {
      const [context, canvas] = CreateContext(
        image.width,
        image.height,
        window.devicePixelRatio
      );
      console.log(image.width)
      this.context = context;
      this.canvas = canvas;
      this.canvas.classList.add("square-block");
      node.appendChild(canvas);

      requestAnimationFrame(() => {
        this.recalculate();
        if (isComplete) {
          this.takenParticleCount = this.particleCount;
        }

        this.addListener();
      });
    };
  }

  recalculate(): void {
    if (!this.canvas || !this.context) {
      return
    }
    this.rect = this.canvas.getBoundingClientRect();
    this.rect.x = window.scrollX + this.rect.x;
    this.rect.y = window.scrollY + this.rect.y;
    this.particleCoordList = ExtractParticleCoordinatesFromImage(
      this.context,
      this.image,
      this.rect
    );
    this.particleCount = this.particleCoordList.length;
    this.updateSquare();
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

    for (
      let i = this.takenParticleCount - 1;
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
    this.handleParticleAmountChange();
    this.particleManager.release(particle)
  }

  @InkBlockProgressDecorator
  private handleParticleAmountChange() {
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
    this.updateSquare();
  }

  private addListener() {
    this.canvas?.addEventListener("click", () => {
      this.callbacks.forEach((cb) => cb(this));
    });
  }

  private updateSquare() {
    if (!this.context) {return}
    this.context.fillStyle = "black";
    this.context.clearRect(0, 0, 1000, 1000);
    for (let i = 0; i < this.takenParticleCount; i += 1) {
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
