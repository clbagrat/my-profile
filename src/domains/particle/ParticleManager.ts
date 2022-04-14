import { Coordinate } from "../shared/types";
import "./_locals/particle.css";

const MOVE_TIME = 1000;

export type Particle = {
  node: HTMLElement;
  state: "pool" | "moving" | "occupied"
}

export class ParticleManager {
  private pool: Set<Particle> = new Set();

  constructor(private particleSpace: HTMLElement, warmUpAmount: number) {
    for (let i = 0; i < warmUpAmount; i += 1) {
      this.populateParticle();
    }
  }

  release(particle: Particle) {
    particle.node.style.opacity = (0).toString();
    particle.state = "pool";
    particle.node.classList.remove('moving');
    this.pool.add(particle);
  }

  getParticleFromPool(): Particle {
    if (this.pool.size === 0) {
      this.populateParticle();
    }

    const [particle] = this.pool;

    this.pool.delete(particle);

    return particle as Particle;
  }

  moveStartCount = 0;
  moveFinishCount = 0;
  moveEventCount = 0;
  moveParticle(
    particle: Particle,
    from: Coordinate,
    to: Coordinate,
  ): Promise<unknown> {
    if (particle.state === "moving") {
      throw new Error("cant move particle twice");
    }
    particle.state = "moving";
    particle.node.style.opacity = 1..toString();
    particle.node.style.setProperty('--transformFrom', `translate(${from.x}px, ${from.y}px)`);
    particle.node.style.setProperty('--transformTo', `translate(${to.x}px, ${to.y}px)`);
    particle.node.classList.add('moving');
    this.pool.delete(particle); 
    this.moveStartCount += 1
    return new Promise<void>((res) => {
      particle.node.addEventListener(
        "animationend",
        () => {
          this.moveEventCount += 1;
        },
        { once: true }
      );
      setTimeout(() => {
        this.moveFinishCount += 1;
        res();
      }, MOVE_TIME);
    })
  }


  private populateParticle() {
    const inkSize = 1;
    const node = document.createElement("div");
    node.classList.add("particle");
    node.style.setProperty(
      "--particleSize",
      `${inkSize / window.devicePixelRatio}px`
    );

    this.particleSpace.appendChild(node);
    this.pool.add({
      node,
      state: "pool"
    });
  }
}
