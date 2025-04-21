import { Subject } from "rxjs";
import { GameObject } from "../entities/GameObject";
import { Component } from "./Component";

export class CooldownComponent extends Component {
    cooldownActive = false;
    progress = 0;
    onStateChanged = new Subject<CooldownComponent>();

    constructor(public game: GameObject, public duration: number) {
        super(game);
    }

    start() {
        if (this.cooldownActive) return;
        this.cooldownActive = true;
        this.progress = 0;
        const tickTime = 33;
        const interval = setInterval(() => {
            this.progress += (tickTime/1000) * (1000/this.duration);
            this.onStateChanged.next(this);
            if (this.progress >= 1) {
                clearInterval(interval);
                this.cooldownActive = false;
                this.progress = 0;
                this.onStateChanged.next(this);
            }
        }, tickTime);
    }
}