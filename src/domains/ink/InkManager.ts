import { Particle, ParticleManager } from "../particle/ParticleManager";
import { GetAverageFps, MeasureFps } from "../performance/MeasureFps";
import { Coordinate } from "../shared/types";
import { IInkBlock } from "../inkBlock/IInkBlock";
import { shuffleArray } from "../shared/shuffleArray";

const PARTICLE_STEP = 10;
const ANIMATE_EVERY = 1;

export class InkManager {
  private inkBlocks: IInkBlock[] = [];
  private inkBlockInProgress: IInkBlock | null = null;
  private isInsta = false;
  private isFast = false;
  private movingParticles: Set<Particle> = new Set();

  constructor(private particleManager: ParticleManager) {
  }

  register(inkBlock: IInkBlock) {
    this.inkBlocks.push(inkBlock);
    inkBlock.onClick(this.handleOnInkBlockClick.bind(this));
  }
  
  unregister(inkBlock: IInkBlock) {
    this.inkBlocks = this.inkBlocks.filter(ib => ib !== inkBlock);
  }

  recalculateAll() {
    this.inkBlocks.forEach(ib => ib.recalculate());
  }

  private handleOnInkBlockClick(ib: IInkBlock) {
    if (this.inkBlockInProgress)  {
      if (this.inkBlockInProgress === ib) {
        if (this.isFast) {
        [...this.movingParticles].forEach((p) => {
          this.particleManager.finishParticle(p);
        });
        this.isInsta = true;

        } else {
          this.isFast = true;
        }
      }
      return;
    }
    MeasureFps(this.inkBlocks.indexOf(ib).toString());
    this.provideInkTo(ib);
  }

  getAllInk(): number {
    return this.inkBlocks.reduce((acc, cur) => acc + cur.getTakenParticleAmount(), 0);
  }


  getInkForInkBlock(inkBlock: IInkBlock, amount: number): Coordinate[] {
    const res: Coordinate[] = [];
    let needToCollect = amount;
    const emptyBlocks = [inkBlock];

    while(needToCollect && emptyBlocks.length !== this.inkBlocks.length) {
      const blocks = shuffleArray([...this.inkBlocks.filter(ib => !emptyBlocks.includes(ib)).slice(0, 5)]);
      blocks.forEach((block) => {
        const request = Math.floor(needToCollect / blocks.length);
        const coordsFromBlock = block.wipeParticleAmount(request || needToCollect);
        if (coordsFromBlock.length === 0) {
          emptyBlocks.push(block);
        }
        needToCollect -= coordsFromBlock.length; 
        res.push(...coordsFromBlock);
      });
    }
    
    return res;
  }

  provideInkTo(textBlock: IInkBlock) {
    this.inkBlockInProgress = textBlock;
    const step = this.isFast ? PARTICLE_STEP * 5 : PARTICLE_STEP;
    const animateEvery = this.isFast ? ANIMATE_EVERY * 5 : ANIMATE_EVERY;
    const providedInkCoords = this.getInkForInkBlock(
      textBlock,
      this.isInsta
        ? textBlock.getMissingParticleAmount()
        : Math.min(step, textBlock.getMissingParticleAmount())
    );
    const allocatedParticlePlaces = textBlock.allocateParticlePlaces(providedInkCoords.length);
    const allocatedCount = allocatedParticlePlaces.length;

    if (allocatedCount) {
      if (this.isInsta) {
        for (let i = 0; i < allocatedParticlePlaces.length; i += 1) {
          textBlock.receiveParticleCoord(allocatedParticlePlaces[i]);
        }
      } else {
        for (
          let i = 0;
          i < allocatedParticlePlaces.length;
          i += animateEvery
        ) {
          const destination = allocatedParticlePlaces[i];
          const from = providedInkCoords[i];
          const particle = this.particleManager.getParticleFromPool();
          this.movingParticles.add(particle);
          this.particleManager
            .moveParticle(particle, from, destination, true)
            .then(() => {
              this.movingParticles.delete(particle);
              textBlock.receiveParticle(particle);
              for (
                let d = i + 1;
                d < Math.min(i + animateEvery, allocatedParticlePlaces.length);
                d += 1
              ) {
                textBlock.receiveParticleCoord(allocatedParticlePlaces[d]);
              }
            });
        }
      }
      window.requestAnimationFrame(() => this.provideInkTo(textBlock));
    } else {
      this.inkBlockInProgress = null;
      this.isInsta = false;
      this.isFast = false;
      const [fps, time] = GetAverageFps(
        this.inkBlocks.indexOf(textBlock).toString()
      );
      const node = document.createElement("div");
      node.innerHTML = `${fps}, ${time}`;
      document.body.appendChild(node);
    }
  }
}
