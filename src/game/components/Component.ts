import { Ticker } from "pixi.js";
import { GameObject } from "../entities/GameObject";

export class Component {

    constructor(public owner: GameObject, ...args) {}

    init() {
        console.info('Component.init', this);
        if (this.tick) this.owner.game.app.ticker.add(this.tick);
    }

    destroy() {
        console.warn('Component.destroy', this);
        if (this.tick && this.owner.game.app.ticker) this.owner.game.app.ticker.remove(this.tick);
    }

    tick: (ticker: Ticker) => void;
}
