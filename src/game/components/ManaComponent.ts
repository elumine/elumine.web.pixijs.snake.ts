import { Ticker } from "pixi.js";
import { Component } from "./Component";
import { Subject } from "rxjs";

export class ManaComponent extends Component {
    manaRegeneration = 1;
    maxMana = 10;
    mana = 0;
    onManaChanged = new Subject<ManaComponent>();
    rengerationTimerTickTime = 100;
    regenerationTimer: number;

    get manaPercentage() { return this.mana/this.maxMana }
    
    init() {
        super.init();
        this.mana = this.maxMana;
        this.regenerationTimer = setInterval(this.regenerate, this.rengerationTimerTickTime);
    }

    destroy() {
        super.destroy();
        clearInterval(this.regenerationTimer);
    }

    regenerate = () => {
        this.addMana(this.manaRegeneration * (this.rengerationTimerTickTime/1000));
    }

    addMana(delta: number) {
        this.mana = Math.min(this.maxMana, this.mana + delta);
        this.onManaChanged.next(this);
    }

    removeMana(delta: number) {
        this.mana = Math.max(0, this.mana - delta);
        this.onManaChanged.next(this);
    }
}
