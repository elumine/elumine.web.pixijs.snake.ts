import { Graphics, PointData } from "pixi.js";
import { Character } from "./Character";
import { Player } from "./Player";
import Game from "../Game";
import { Vector2 } from "../math/Vector2";
import { AsyncCommon } from "../Async";

export class Enemy extends Character {
    characterAssetName = 'wizard_ice';
    healthBar: {
        bg: Graphics,
        bar: Graphics
    };
    ai = new EnemyAI(this);

    override async init(x: number, y: number, w: number, h: number) {
        super.init(x, y, w, h);
        this.health.healthRegeneration = 0;
        this.healthBar = {
            bg: new Graphics().rect(0, 0, w, h/4).fill(`rgba(0,0,0,255)`),
            bar: new Graphics().rect(0, 0, w, h/4).fill(`rgba(255,0,0,255)`)
        }
        this.healthBar.bg.zIndex = 1;
        this.healthBar.bg.position.set(-w/2, -h * 0.75);
        this.healthBar.bar.zIndex = 2;
        this.healthBar.bar.position.set(-w/2, -h * 0.75);
        this.addChild(this.healthBar.bg, this.healthBar.bar);
        this.ai.init();
    }

    override async destroy() {
        this.ai.destroy();
        await super.destroy();
    }

    override async die() {
        await super.die();
        await this.destroy();
    }

    async applyDamage(delta: number) {
        await super.applyDamage(delta);
        this.healthBar.bar.scale.x = this.health.healthPercentage;
    }
}

export class EnemyAI {
    game: Game;
    player: Player;
    updateTimerTickTime = 1000;
    updateTimer = 0;

    constructor(public enemy: Enemy) {
        this.game = enemy.game;
        this.player = enemy.game.player;
    }

    init() {
        this.updateTimer = setInterval(() => this.update(), this.updateTimerTickTime);
    }

    destroy() {
        clearInterval(this.updateTimer);
    }

    async update() {
        const r = Math.min(Math.random() * 750 + 250, this.game.arena.activeLayerRadius);
        const findPosition = async (): Promise<PointData> => {
            const p = this.getRandomPointNearPlayer(r);
            const onGround = this.game.arena.objectInCurrentRadius(p.x, p.y, this.enemy.width, this.enemy.height);
            if (onGround) {
                return p;
            } else {
                await AsyncCommon.Delay(0);
                return findPosition();
            }
        }
        const moveTo = await findPosition();
        this.moveToPosition(moveTo.x, moveTo.y, (Math.random() * 0.25 + 0.25));
        const wantFireball = Math.random() <= 0.25; // 4/s
        if (wantFireball) {
            const direction = Vector2.Normalize({
                x: this.player.position.x - this.enemy.position.x,
                y: this.player.position.y - this.enemy.position.y
            });
            this.enemy.castFireballInDirection(direction.x, direction.y);
        }
    }

    moveToPosition(x: number, y: number, scale: number) {
        this.enemy.movementInput.scale = scale;
        this.enemy.movementInput.direction = Vector2.Normalize({
            x: x - this.enemy.position.x,
            y: y - this.enemy.position.y
        });
    }

    getRandomPointNearPlayer(r: number) {
        const output = { x: 0, y: 0 }, r2 = r/2;
        output.x = this.player.position.x + (Math.random()* 2 - 1) * r2;
        output.y = this.player.position.y + (Math.random()* 2 - 1) * r2;
        return output;
    }
}