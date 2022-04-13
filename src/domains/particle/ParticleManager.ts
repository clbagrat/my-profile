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
    particle.node.style.setProperty('--transformTo', `translate(${to.x}px, ${to.y}px)`);
    this.pool.delete(particle);

    return new Promise((res) => {
      setTimeout(res, MOVE_TIME)
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
