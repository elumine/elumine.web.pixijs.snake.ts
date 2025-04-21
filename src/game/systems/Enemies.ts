import { Subject } from "rxjs";
import Game from "../Game";
import { Enemy } from "../entities/Enemy";
import { Float } from "../math/Float";
import { GameSystem } from "./GameSystem";

export class EnemiesSystem extends GameSystem {
    maxChestsByActiveArenaLayer = {
        1: 2,
        2: 3,
        3: 4
    };
    maxCount = 5;
    list: Enemy[] = [];
    respawnTimer: number;
    onEnemySpawned = new Subject();
    onEnemyDestroyed = new Subject();

    override async init() {
        await super.init();
        this.updateMaxCount();
        this.registerSubscribtion(
            this.game.arena.onActiveLayerChanged.subscribe(() => this.updateMaxCount()));
        await this.spawnEnemy();
        this.respawnTimer = setInterval(() => {
            if (this.list.length < this.maxCount) {
                this.spawnEnemy();
            }
        }, Math.random() * 3000 + 2000);
    }

    override async destroy() {
        clearInterval(this.respawnTimer);
        this.list.forEach(c => c.off('destroyed', this.onChestDestroyed));
        await Promise.all(this.list.map(c => c.destroy()));
        await super.destroy();
    }

    updateMaxCount() {
        this.maxCount = this.maxChestsByActiveArenaLayer[this.game.arena.activeLayer];
    }
    
    async spawnEnemy() {
        const chest = new Enemy(this.game);
        this.game.registerCharacter(chest);
        this.game.world.viewport.addChild(chest);
        const w = 100, h = 100;
        const x = -w/2 + this.game.world.size.x/2 + this.game.arena.activeLayerRadius/2 * Float.Lerp(-1, 1, Math.random());
        const y = -h/2 + this.game.world.size.y/2 + this.game.arena.activeLayerRadius/2 * Float.Lerp(-1, 1, Math.random());
        chest.init(x, y, 100, 100);
        this.list.push(chest);
        this.onEnemySpawned.next(null);
        chest.on('destroyed', this.onChestDestroyed);
    }

    onChestDestroyed = (c) => {
        this.onEnemyDestroyed.next(null);
        this.list.splice(this.list.indexOf(c as Enemy), 1);
    }
}