import { IInkBlock } from "../IInkBlock";
import "./inkBlockProgress.css";

export function InkBlockProgressDecorator(
  _target: any,
  _property: any,
  descriptor: PropertyDescriptor
) {
  const originalMethod = descriptor.value;

  descriptor.value = function (...args: any[]) {
    const self = this as IInkBlock;
    const taken = self.getTakenParticleAmount();
    const all = self.getParticleAmount();
    const progress = taken / all;

    if (!self.node.classList.contains("ink-block")) {
      self.node.classList.add("ink-block");
    }

    self.node.style.setProperty(
      "--progress",
      progress.toString()
    );

    return originalMethod.apply(self, args);
  };

  return descriptor;
}
