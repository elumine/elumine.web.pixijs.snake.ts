import { Ticker } from "pixi.js";
import { Component } from "./Component";
import { Subject } from "rxjs";
import { GameObject } from "../entities/GameObject";

export class HealthComponent extends Component {
    healthRegeneration = 0.25;
    health = 0;
    onHealthChanged = new Subject<HealthComponent>();
    rengerationTimerTickTime = 100;
    regenerationTimer: number;

    constructor(public owner: GameObject, public maxHealth = 10) {
        super(owner);
        this.health = this.maxHealth;
    }

    get healthPercentage() { return this.health/this.maxHealth }
    
    init() {
        super.init();
        this.regenerationTimer = setInterval(this.regenerate, this.rengerationTimerTickTime);
    }

    destroy() {
        super.destroy();
        clearInterval(this.regenerationTimer);
    }

    regenerate = () => {
        this.addHealth(this.healthRegeneration * (this.rengerationTimerTickTime/1000));
    }

    addHealth(delta: number) {
        this.health = Math.min(this.maxHealth, this.health + delta);
        this.onHealthChanged.next(this);
    }

    removeHealth(delta: number) {
        this.health = Math.max(0, this.health - delta);
        this.onHealthChanged.next(this);
    }
}
