import { Assets, Container, Graphics, Sprite } from "pixi.js";
import Game from "../Game";
import { Layout } from "@pixi/layout";



export class GameUI {
    // zIndex = 10;
    // elements: Layout;

    constructor(public game: Game) {
        //
    }

    async init() {
        // this.elements = new Layout({
        //     content: {
        //         content: Sprite.from(await Assets.load('/art/ui/hp-bar-ring.png')),
        //         styles: {
        //             position: "center",
        //             maxWidth: "100%",
        //             minHeight: "100%",
        //         },
        //     },
        //     styles: {
        //         background: "red",
        //         position: "center",
        //         width: `100%`,
        //         height: `100%`,
        //     },
        // });
        // this.elements.zIndex = 10;
    }
}