import "./_locals/textBlock.css";
import { Coordinate } from "../shared/types";
import { Particle, ParticleManager } from "../particle/ParticleManager";
import { ExtractParticleCoordinates } from "./_locals/ExtractParticleCoordinates";
import { IInkBlock } from "./IInkBlock";
import { InkBlockProgressDecorator } from "./_locals/InkBlockProgressDecorator";

export class TextBlock implements IInkBlock {
  private particleCoordList: Coordinate[] = [];
  private particleCount = 0;
  private takenParticleCount = 0;
  private allocatedParticleCount = 0;
  private particlesInPossession: Particle[] = [];

  private fullText: string;
  private fullLetterCount: number;
  private revealedLetterCount = 0;
  private oneLetterWidth = 0;
  private oneLetterHeight = 0;
  private lettersPerRow: number[] = [];

  private rect: DOMRect = new DOMRect();

  constructor(
    public node: HTMLElement,
    private particleManager: ParticleManager,
    private text: string,
    private font: string,
    private fontFamily: string,
    private isComplete: boolean
  ) {
    node.classList.add("text-block", "ink-block");
    node.style.fontSize = `${font}px`;
    node.style.fontFamily = fontFamily;
    node.style.lineHeight = `${font}px`;

    this.fullText = text;
    this.fullLetterCount = text.length;
    this.updateText();

    requestAnimationFrame(() => {
      this.recalculate();

      if (isComplete) {
        this.revealedLetterCount = this.fullText.length;
        this.takenParticleCount = this.particleCoordList.length;
        this.allocatedParticleCount = 0;
        this.updateText();
      }

      this.assignEvents();
    });
  }
  recalculate(): void {
      this.rect = this.node.getBoundingClientRect();
      this.rect.x = window.scrollX + this.rect.x;
      this.rect.y = window.scrollY + this.rect.y;

      const [particleCoordList, oneLetterWidth, lettersPerRow] =
        ExtractParticleCoordinates(
          this.text,
          parseInt(this.font, 10),
          this.fontFamily,
          this.rect
        );
      this.particleCoordList = particleCoordList;
      this.oneLetterWidth = oneLetterWidth;
      this.oneLetterHeight = parseInt(this.font, 10);
      this.lettersPerRow = lettersPerRow;
      this.particleCount = this.particleCoordList.length;

      if (this.takenParticleCount > this.particleCount) {
        this.takenParticleCount = this.particleCount;
      }
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

  getTakenParticleAmount(): number {
    return this.takenParticleCount;
  }

  getParticleAmount(): number {
    return this.particleCount;
  }

  getMissingParticleAmount(): number {
    const reservedParticlePlacesCount =
      this.takenParticleCount + this.allocatedParticleCount;
    return this.particleCount - reservedParticlePlacesCount;
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

  private releaseParticle(index: number) {
    const p = this.particlesInPossession[index];
    if (!p) return;
    this.particleManager.release(p);
    delete this.particlesInPossession[index];
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
      this.releaseParticle(i);
    }

    this.takenParticleCount -= particleAmoutToWipe;
    this.handleParticleAmountChange();

    return res;
  }

  receiveParticleCoord(coord: Coordinate) {
    this.allocatedParticleCount -= 1;
    this.takenParticleCount += 1;
    this.handleParticleAmountChange();
  }

  receiveParticle(particle: Particle) {
    this.allocatedParticleCount -= 1;
    this.takenParticleCount += 1;

    this.particlesInPossession[this.takenParticleCount - 1] = particle;
    this.handleParticleAmountChange();
  }

  private callbacks: ((tb: IInkBlock) => void)[] = [];

  onClick(callback: (textBlock: IInkBlock) => void) {
    this.callbacks.push(callback);
  }

  @InkBlockProgressDecorator
  private handleParticleAmountChange() {
    if (this.takenParticleCount === 0) {
      this.onEmptyCallbacks.forEach((c) => c(this));
      this.onEmptyCallbacks = [];
    }

    if (
      this.takenParticleCount ===
      this.particleCount - this.allocatedParticleCount
    ) {
      this.onFullCallbacks.forEach((c) => c(this));
      this.onFullCallbacks = [];
    }

    if (this.takenParticleCount === this.particleCount) {
      this.onCompleteCallbacks.forEach((c) => c(this));
      this.onCompleteCallbacks = [];
    }

    const lastTakenParticleCoord = this.particleCoordList[
      this.takenParticleCount - 1
    ] || { x: 0, y: 0 };

    const x = Math.max(lastTakenParticleCoord.x - this.rect.x, 0);
    const y = Math.max(lastTakenParticleCoord.y - this.rect.y, 0);
    const expectedRow = Math.floor(y / this.oneLetterHeight);
    const prevRowLetters = this.lettersPerRow
      .slice(0, expectedRow)
      .reduce((acc, c) => c + acc, 0);

    const expectedRevealedLettersCount =
      Math.floor(x / this.oneLetterWidth) + prevRowLetters;
    const isLastLetter = this.fullLetterCount - this.revealedLetterCount === 1;

    if (
      this.takenParticleCount === this.particleCount ||
      this.revealedLetterCount !== expectedRevealedLettersCount
    ) {
      if (isLastLetter && this.takenParticleCount === this.particleCount) {
        this.revealedLetterCount = this.fullLetterCount;
      } else {
        this.revealedLetterCount = expectedRevealedLettersCount;
      }

      for (let i = 0; i < this.takenParticleCount; i += 1) {
        this.releaseParticle(i);
      }

      this.updateText();
    }
  }

  private updateText() {
    const currentText =
      this.fullText.slice(0, this.revealedLetterCount) +
      this.fullText.slice(this.revealedLetterCount).replace(/\S/g, "&nbsp;");
    const nextLetter =
      this.fullText.slice(0, this.revealedLetterCount + 1) +
      this.fullText
        .slice(this.revealedLetterCount + 1)
        .replace(/\S/g, "&nbsp;");
    this.node.innerHTML = `${currentText}<div>${nextLetter}</div>`;
    requestAnimationFrame(() => {
      this.node.querySelector("div")?.classList.add("animate");
    });
  }

  private assignEvents() {
    this.node.addEventListener("click", (e: MouseEvent) => {
      e.preventDefault();

      if (e.button === 0) {
        this.callbacks.forEach((cb) => cb(this));
      }
    });
  }
}
