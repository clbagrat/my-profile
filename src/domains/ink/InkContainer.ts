import {InkManager} from "./InkManager";
import './_locals/inkContainer.css';

const INK_IN_SPOT = 3000;

export class InkContainer {
  private spotAmount = 0;
  private currentInkSpot: HTMLElement | undefined;

  constructor(private inkManager: InkManager, private node: HTMLElement) {
    requestAnimationFrame(this.draw);
  }

  private calcScale (index: number): number {
    return  Math.max((20 - index), 1) * 0.05;
  }

  private calcAnimation (scale: number): string {
    return Math.max(4, (30 * scale)) + 's';
  } 

  draw = () => {
    const ink = this.inkManager.currentInkAmount;
    const requiredAmountOfSpots = Math.floor(ink / INK_IN_SPOT) + 1;
    const delta = requiredAmountOfSpots - this.spotAmount;


    if (delta > 0) {
      for (let i = 0; i < delta; i += 1) {
        const inkSpot = document.createElement('div');
        const maxScale = this.calcScale(i);
        inkSpot.classList.add('ink-spot');
        inkSpot.style.setProperty('--startPointX', `${(0.5 - Math.random()) * 20 }px`);
        inkSpot.style.setProperty('--startPointY', `${(0.5 - Math.random()) * 20 }px`);
        inkSpot.style.setProperty('--middlePointX', `${(0.5 - Math.random()) * 20 }px`);
        inkSpot.style.setProperty('--middlePointY', `${(0.5 - Math.random()) * 20 }px`);
        inkSpot.style.setProperty('--endPointX', `${(0.5 - Math.random()) * 20 }px`);
        inkSpot.style.setProperty('--endPointY', `${(0.5 - Math.random()) * 20 }px`);
        inkSpot.style.setProperty('--scale', maxScale.toString());
        inkSpot.style.setProperty('--time', this.calcAnimation(maxScale));
        inkSpot.style.opacity =  (0.4 + 1 - maxScale).toString();
        this.node.appendChild(inkSpot);
        this.currentInkSpot = inkSpot;
      }

    }

    if (delta < 0) {
      for (let i = 0; i < Math.abs(delta); i += 1) {
        this.node.removeChild(this.currentInkSpot as HTMLElement);
        this.currentInkSpot = this.node.children[this.node.children.length - 1] as HTMLElement;
      }
    }

    this.spotAmount = requiredAmountOfSpots;
    const scale = (ink % INK_IN_SPOT / INK_IN_SPOT) * this.calcScale(this.spotAmount + 1);
    (this.currentInkSpot as HTMLElement).style.setProperty("--scale", scale.toString());
    (this.currentInkSpot as HTMLElement).style.setProperty("--time", this.calcAnimation(scale));
     (this.currentInkSpot as HTMLElement).style.opacity = (0.4 + 1 - scale).toString();
    requestAnimationFrame(this.draw);
  }
}
