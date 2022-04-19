import { Coordinate } from "../shared/types";
import "./_locals/particle.css";

const MOVE_TIME = 1000;

export type Particle = {
  node: HTMLElement;
  state: "pool" | "moving" | "occupied"
  resolver?: () => void
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
//    particle.node.style.setProperty('--transformTo', `translate(100000px, 1000000px)`);

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
    playAnimation = true
  ): Promise<unknown> {
    if (particle.state === "moving") {
      throw new Error("cant move particle twice");
    }
    particle.state = "moving";
    particle.node.style.opacity = 1..toString();
    particle.node.style.setProperty('--transformFrom', `translate(${from.x}px, ${from.y}px) scale(1)`);
    particle.node.style.setProperty(
      "--transformMiddle",
      `translate(${(0.5 - Math.random()) * 50 + from.x}px, ${
        (0.5 - Math.random()) * 20 + from.y
      }px) scale(2)`
    );
    particle.node.style.setProperty('--transformTo', `translate(${to.x}px, ${to.y}px) scale(1)`);
    if (playAnimation) {
      particle.node.classList.add("moving");
    }
    this.pool.delete(particle);
    this.moveStartCount += 1;
    return new Promise<void>((res) => {
      particle.resolver = res;
      if (playAnimation) {
        particle.node.addEventListener(
          "animationend",
          () => {
            this.moveEventCount += 1;
            res();
          },
          { once: true }
        );
      } else {
        res();
      }
    });
  }

  finishParticle(particle: Particle) {
    if (particle.state === "moving") {
      particle.node.style.opacity = 0..toString();
      particle.resolver?.();
    }
  }


   populateParticle() {
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
