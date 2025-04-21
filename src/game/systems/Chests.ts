import { Subject } from "rxjs";
import Game from "../Game";
import { Chest } from "../entities/Chest";
import { Float } from "../math/Float";
import { GameSystem } from "./GameSystem";

export class ChestsSystem extends GameSystem {
    maxChestsByActiveArenaLayer = {
        1: 2,
        2: 4,
        3: 6
    };
    maxChests = 5;
    chestsList: Chest[] = [];
    chestRespawnTimer: number;
    onChestSpawned = new Subject();
    onChestDestroyed = new Subject();

    override async init() {
        await super.init();
        this.updateMaxCount();
        this.registerSubscribtion(
            this.game.arena.onActiveLayerChanged.subscribe(() => this.updateMaxCount()));
        await this.spawnChest();
        this.chestRespawnTimer = setInterval(() => {
            if (this.chestsList.length < this.maxChests) {
                this.spawnChest();
            }
        }, Math.random() * 3000 + 2000);
    }

    override async destroy() {
        clearInterval(this.chestRespawnTimer);
        this.chestsList.forEach(c => {
            c.spawnLoot = false;
            c.off('destroyed', this.handleChestDestroyed)
        });
        await Promise.all(this.chestsList.map(c => c.destroy()));
        await super.destroy();
    }

    updateMaxCount() {
        this.maxChests = this.maxChestsByActiveArenaLayer[this.game.arena.activeLayer];
    }
    
    async spawnChest() {
        const chest = new Chest(this.game);
        this.game.world.viewport.addChild(chest);
        const w = 100, h = 100;
        const x = -w/2 + this.game.world.size.x/2 + this.game.arena.activeLayerRadius * Float.Lerp(-1, 1, Math.random());
        const y = -h/2 + this.game.world.size.y/2 + this.game.arena.activeLayerRadius * Float.Lerp(-1, 1, Math.random());
        chest.init(x, y, w, h);
        this.chestsList.push(chest);
        this.onChestSpawned.next(null);
        chest.on('destroyed', this.handleChestDestroyed);
    }

    handleChestDestroyed = (c) => {
        this.onChestDestroyed.next(null);
        this.chestsList.splice(this.chestsList.indexOf(c as Chest), 1);
    }
}