import { InkManager } from "../ink/InkManager";
import { ParticleManager } from "../particle/ParticleManager";
import { InkBlockCreatorFactory } from "./_locals/PopulateInkBlock";
import text from "./_locals/MainText.json";
import { CellLocation, Grid } from "./Grid";
import "./_locals/Experience.css";
import {image} from "./_locals/image.json";
import {IInkBlock} from "../inkBlock/IInkBlock";

export const RunMainExperience = (
  particleManager: ParticleManager,
  inkManager: InkManager,
  grid: Grid
): Promise<void> => {
  return new Promise((res) => {
    const create = InkBlockCreatorFactory(particleManager, inkManager);

    create(grid.get("centerCenter"), {
      type: "TextBlock",
      text: "Before I introduced myself, I have to say something",
      fontSize: "14",
      fontFamily: "Fira Code",
      isComplete: false,
    }).onComplete(() => {
      create(grid.get("centerCenter"), {
        type: "TextBlock",
        text: "We're short on ink",
        fontSize: "14",
        fontFamily: "Fira Code",
        isComplete: false,
      }).onComplete(() => {
        create(grid.get("centerCenter"), {
          type: "TextBlock",
          text: "Now we have to be curious. Where we can get that ink from?",
          fontSize: "14",
          fontFamily: "Fira Code",
          isComplete: false,
        }).onComplete(() => {
          create(grid.get("centerCenter"), {
            type: "TextBlock",
            text: "You should try to TAB around",
            fontSize: "14",
            fontFamily: "Fira Code",
            isComplete: false,
          }).onComplete(() => {
            create(grid.get("centerCenter"), {
              type: "TextBlock",
              text: text.text,
              fontSize: "14",
              fontFamily: "Fira Code",
              isComplete: false,
            }).onComplete(() => {
              create(grid.get("centerCenter"), {
                type: "TextBlock",
                text: text.text1,
                fontSize: "14",
                fontFamily: "Fira Code",
                isComplete: false,
              }).onComplete(() => {
                create(grid.get("leftCenter"), {
                  type: "ImageBlock",
                  imageBase64: image,
                  isComplete: false,
                });
                const lastPresses: string[] = [];
                window.addEventListener("keydown", ({ key }) => {
                  lastPresses.push(key);
                  if (lastPresses.length > 4) {
                    lastPresses.shift();
                  }
                  if (
                    lastPresses.join("") ===
                    "ArrowRightArrowUpArrowLeftArrowDown"
                  ) {
                    create(grid.get("leftCenter"), {
                      type: "TextBlock",
                      text: "Here you go! I'm happy that you came up with an idea to use arrow keys! By the way, did you check console? Maybe there is a way to hack this ink situation?",
                      fontSize: "14",
                      fontFamily: "Fira Code",
                      isComplete: true,
                    });
                    console.log(
                      "%c Oh, look who is here, the curious one!",
                      "font-weight: bold; font-size: 50px;color: red; text-shadow: 3px 3px 0 rgb(217,31,38) , 6px 6px 0 rgb(226,91,14) , 9px 9px 0 rgb(245,221,8) , 12px 12px 0 rgb(5,148,68) , 15px 15px 0 rgb(2,135,206) , 18px 18px 0 rgb(4,77,145) , 21px 21px 0 rgb(42,21,113)"
                    );
                    console.log(
                      "%c I did all the hacking for you and discovered this method: InkMachine_GiveMeSecretLine()",
                      "color: green"
                    );

                    let isHacked = false;
                    window.InkMachine_GiveMeSecretLine = () => {
                      if (inkManager.isBusy()) {
                        console.log("wait for the end of animation");
                        return;
                      }
                      if (isHacked) {
                        throw new Error("you can't hack twice, cmon");
                      }
                      isHacked = true;
                      create(grid.get("rightCenter"), {
                        type: "TextBlock",
                        text: "Tssssss. This is very secret message. I really wanted you to question - How did he do this animation? Well, if I succeed and you're interested, I suggest to visit this my github repo clbagrat/my-profile and read sources.",
                        fontSize: "14",
                        fontFamily: "Fira Code",
                        isComplete: true,
                      }).onClick(() => {
                        window.open("https://github.com/clbagrat/my-profile", "_blank")
                      });
                    console.log(
                      "%c DONE!",
                      "font-weight: bold; font-size: 50px;color: red; text-shadow: 3px 3px 0 rgb(217,31,38) , 6px 6px 0 rgb(226,91,14) , 9px 9px 0 rgb(245,221,8) , 12px 12px 0 rgb(5,148,68) , 15px 15px 0 rgb(2,135,206) , 18px 18px 0 rgb(4,77,145) , 21px 21px 0 rgb(42,21,113)"
                    );
                    };
                  }
                });
              });
              const lastText = create(grid.get("centerCenter"), {
                type: "TextBlock",
                text: text.text2,
                fontSize: "14",
                fontFamily: "Fira Code",
                isComplete: false,
              });
              const squares:IInkBlock[] = [];
              lastText.onComplete(() => {
                alert("Thats it, thanks for your attention.");
                squares.forEach((s) => {
                  inkManager.unregister(s)
                  s.node.remove();
                });
                requestAnimationFrame(() => {
                  inkManager.recalculateAll();
                })
              });
              let hashChaned = false;
              window.addEventListener('hashchange', ({newURL}: HashChangeEvent) => {
                if (hashChaned) return;
                if (newURL.split("#")[1] === 'i_want_to_see_all') {
                hashChaned = true;
                  const particles = lastText.getParticleAmount();
                  const allParticles = inkManager.getAllInk();
                  const requredParticles = particles - allParticles
                  for (let i = 0; i < Math.floor((requredParticles)/9000) + 1; i += 1) {
                    const location = ["leftTop", "rightBottom", "rightCenter", "centerBottom", "centerTop", "leftCenter"][i%6] as CellLocation;
                    squares.push(create(grid.get(location), {
                      type: "SquareBlock",
                      particleAmount: Math.min(9000, requredParticles - i * 9000),
                      isComplete: true,
                    }));
                  }
                }
              })
            });
          });
        });
      });
    });

    const tabButton = document.createElement("button");
    tabButton.classList.add("invisible-button");

    tabButton.addEventListener("click", () => {
      tabButton.remove();
      create(grid.get("rightCenter"), {
        type: "TextBlock",
        text: "Nice catch! Here the advice for you: You can double click to SCROLL though the ink faster.",
        fontSize: "14",
        fontFamily: "Fira Code",
        isComplete: true,
      });

      let wheelcount = 10;
      const onWheel = () => {
        wheelcount -= 1;
        if (wheelcount === 0) {
          create(grid.get("leftTop"), {
            type: "TextBlock",
            text: "Look at you scroll! What other I/O devices you have in your posession?",
            fontSize: "14",
            fontFamily: "Fira Code",
            isComplete: true,
          });

          let keypressDone = false;
          window.addEventListener("keypress", (e) => {
            if (keypressDone) return;
            e.preventDefault();
            const box = create(grid.get("rightTop"), {
              type: "TextBlock",
              text: "Yep, thats the keyboard! I guess we can continue reading :)",
              fontSize: "14",
              fontFamily: "Fira Code",
              isComplete: true,
            });
            keypressDone = true;
          });
        }
      };

      document.addEventListener("mousewheel", onWheel);
      document.addEventListener("wheel", onWheel);
      document.addEventListener("scroll", onWheel);
    });

    grid.get("rightCenter").appendChild(tabButton);
  });
};
