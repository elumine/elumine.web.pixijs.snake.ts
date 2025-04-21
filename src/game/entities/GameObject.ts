import { ColorMatrixFilter, Container, DestroyOptions, Graphics, Ticker } from "pixi.js";
import Game from "../Game";
import { AsyncCommon } from "../Async";
import { Subject, Subscription } from "rxjs";
import { Component } from "../components/Component";

export class GameObject extends Container {
    lifespan = 0;
    isDestroyed = false;
    components = new Array<Component>();
    subscribtions: Subscription[] = [];

    constructor(public game: Game) {
        super();
    }

    async init(x: number, y: number, w: number, h: number) {
        console.info('GameObject.init', this);
        // const debugOverlay = new Graphics().rect(-w/2, -h/2, w, h).fill(`rgba(0,0,0,0.5)`);
        // this.addChild(debugOverlay);
        this.components = Object.values(this).filter(v => v instanceof Component);
        this.position.set(x, y);
        this.width = w;
        this.height = h;
        await Promise.all(this.components.map(c => c.init()));
        if (this.tick) this.game.app.ticker.add(this.tick.bind(this));
        if (this.lifespan > 0) {
            setTimeout(() => this.destroy(), this.lifespan * 1000);
        }
    }
    
    override async destroy(options?: DestroyOptions) {
        if (!this.isDestroyed) {
            console.warn('GameObject.destroy', this);
            this.isDestroyed = true;
            this.subscribtions.forEach(s => s.unsubscribe());
            if (this.tick && this.game.app.ticker) this.game.app.ticker.remove(this.tick.bind(this));
            await Promise.all(this.components.map(c => c.destroy()));
            super.destroy(options);
        }
    }

    tick(ticker: Ticker) {}

    registerSubscribtion(s: Subscription) { this.subscribtions.push(s); }
}