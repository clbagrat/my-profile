import { InkManager } from "../../ink/InkManager";
import { IInkBlock } from "../../inkBlock/IInkBlock";
import {ImageBlock} from "../../inkBlock/ImageBlock";
import { SquareBlock } from "../../inkBlock/SquareBlock";
import { TextBlock } from "../../inkBlock/TextBlock";
import { ParticleManager } from "../../particle/ParticleManager";

type InkBlockParams =
  | {
      type: "TextBlock";
      text: string;
      fontSize: string;
      fontFamily: string;
      isComplete: boolean;
    }
  | {
      type: "SquareBlock";
      particleAmount: number;
      isComplete: boolean;
    }
  | {
      type: "ImageBlock";
      imageBase64: string;
      isComplete: boolean;
    }


export const InkBlockCreatorFactory =
  (particleManager: ParticleManager, inkManager: InkManager) =>
  (parent: HTMLElement, params: InkBlockParams): IInkBlock => {
    const node = document.createElement("div");
    parent.appendChild(node);
    let inkBlock:IInkBlock | null = null;

    if (params.type === "TextBlock") {
      inkBlock = new TextBlock(
        node,
        particleManager,
        params.text,
        params.fontSize,
        params.fontFamily,
        params.isComplete
      );
    }

    if (params.type === "SquareBlock") {
      inkBlock = new SquareBlock(
        node,
        particleManager,
        params.particleAmount,
        params.isComplete
      );
    }

    if (params.type === "ImageBlock") {
      inkBlock = new ImageBlock(
        node,
        particleManager,
        params.imageBase64,
        params.isComplete
      );
    }

    if (!inkBlock) {
      throw new Error("unknown type");
    }


    inkManager.register(inkBlock);
      requestAnimationFrame(() => {

        inkManager.recalculateAll();
      })
      return inkBlock;
  };
