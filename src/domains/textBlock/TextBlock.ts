import "./_locals/textBlock.css";
import { Coordinate } from "../shared/types";
import { InkManager } from "../ink/InkManager";
import { Particle, ParticleManager } from "../particle/ParticleManager";
import {ExtractParticleCoordinates} from "./_locals/ExtractParticleCoordinates";


export class TextBlock {
  private particleCoordList: Coordinate[] = [];
  private particleCount: number = 0;
  private takenParticleCount: number = 0;
  private allocatedParticleCount: number = 0;
  private particlesInPossession: Particle[] = [];

  private fullText: string;
  private fullLetterCount: number;
  private revealedLetterCount: number = 0;
  private oneLetterWidth;

  private rect: DOMRect;

  constructor(
    private node: HTMLElement,
    private inkManager: InkManager,
    private particleManager: ParticleManager
  ) {
    const { text = "", font = "32", fontFamily = "Fira Code" } = node.dataset;

    node.classList.add("text-block");
    node.style.fontSize = `${font}px`;
    node.style.fontFamily = fontFamily;
    node.style.lineHeight = `${font}px`;

    this.fullText = text;
    this.fullLetterCount = text.length;
    this.updateText();

    this.rect = node.getBoundingClientRect();

    const [particleCoordList, oneLetterWidth] = ExtractParticleCoordinates(
      text,
      parseInt(font, 10),
      fontFamily,
      this.rect
    );

    this.particleCoordList = particleCoordList;
    this.oneLetterWidth = oneLetterWidth;
    this.particleCount = this.particleCoordList.length;

    this.assignEvents();
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

  receiveParticle(particle: Particle) {
    this.allocatedParticleCount -= 1;
    this.takenParticleCount += 1;

    this.particlesInPossession[this.takenParticleCount - 1] = particle;
    this.handleParticleAmountChange();
  }

  private handleParticleAmountChange() {
    const lastTakenParticleCoord = this.particleCoordList[
      this.takenParticleCount - 1
    ] || { x: 0, y: 0 };


    const x = Math.max(lastTakenParticleCoord.x - this.rect.x, 0);

    const expectedRevealedLettersCount = Math.floor((x) / this.oneLetterWidth);
    const isLastLetter = (this.fullLetterCount - this.revealedLetterCount) === 1;

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
        const p = this.particlesInPossession[i];
        if (p) {
          this.particleManager.release(p);
          delete this.particlesInPossession[i];
        }
      }

      this.updateText();
    }
  }

  private updateText() {
    const currentText = this.fullText.slice(0, this.revealedLetterCount) + this.fullText.slice(this.revealedLetterCount).replace(/\S/g, "&nbsp;")
    this.node.innerHTML = currentText;
  }

  private assignEvents() {
    this.node.addEventListener("contextmenu", (e) => {
      e.preventDefault();
    });

    this.node.addEventListener("mousedown", (e: MouseEvent) => {
      e.preventDefault();

      if (e.button === 0) {
        this.inkManager.provideInkTo(this);
      }

      if (e.button === 2) {
        this.inkManager.consumeInkFrom(this);
      }
    });
  }
}
