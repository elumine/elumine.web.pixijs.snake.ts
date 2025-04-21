import { Application } from "pixi.js";
import Game from "./Game";
import { Viewport } from "pixi-viewport";
import { Bodies, Body } from "matter-js";

export class World {
    size = {
        x: 0,
        y: 0
    };
    viewWidth = 0;
    viewHeight = 0;
    viewport: Viewport;
    bodies: Body[] = [];

    constructor(
        public game: Game) {
    }

    setViewSize(w: number, h: number) {
        this.viewWidth = w;
        this.viewHeight = h;
        this.viewport.screenWidth = w;
        this.viewport.screenHeight = h;
    }

    async init(woldWidth: number, worldHeight: number) {
        this.viewWidth = this.game.container.clientWidth;
        this.viewHeight = this.game.container.clientHeight;;
        this.size.x = woldWidth;
        this.size.y = worldHeight;
        this.viewport = new Viewport({
            worldWidth: woldWidth,
            worldHeight: worldHeight,
            screenWidth: this.viewWidth,
            screenHeight: this.viewHeight,
            events: this.game.app.renderer.events,
            // ticker: this.game.app.ticker
        });
        this.viewport.zIndex = 1;
        this.game.app.stage.addChild(this.viewport);
        this.bodies = [
            Bodies.rectangle(this.size.x/2, -10, this.size.x, 10),
            Bodies.rectangle(this.size.x/2, this.size.y, this.size.x, 10),
            Bodies.rectangle(-10, this.size.y/2, 10, this.size.y),
            Bodies.rectangle(this.size.x + 10, this.size.y/2, 10, this.size.y),
        ];
        this.bodies.forEach(b => Body.setStatic(b, true));
        this.game.physics.registerBodies(this.bodies);
    }

    async destroy() {
        this.game.physics.unRegisterBodies(this.bodies);
    }
}