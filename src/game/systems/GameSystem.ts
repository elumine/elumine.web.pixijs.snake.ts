import { Subscription } from "rxjs";
import Game from "../Game";
import { DestroyOptions } from "pixi.js";

export class GameSystem {
    subscribtions: Subscription[] = [];
    
    constructor(
        public game: Game, ...args) {
    }

    async init() {
        console.info('GameSystem.init', this);
    }

    async destroy() {
        this.subscribtions.forEach(s => s.unsubscribe());
        console.warn('GameSystem.destroy', this);
    }
    
    registerSubscribtion(s: Subscription) { this.subscribtions.push(s); }
}