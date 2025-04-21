import Matter, { Bodies, Body, Events, IEventCollision } from "matter-js";
import { AnimatedSprite, Assets, DestroyOptions, Sprite, Texture } from "pixi.js";
import { GameObject } from "./GameObject";
import { AssetsCommon } from "../Assets";
import { AsyncCommon } from "../Async";
import { PhysicsComponent } from "../components/PhysicsComponent";
import Game from "../Game";
import { Player } from "./Player";


export enum ChestState {
    Closed, Opening
}
export class Chest extends GameObject {
    zIndex = 3;
    body: Body;
    sprite: AnimatedSprite;
    state: ChestState;
    texturesMap = new Map<ChestState, Texture[]>();
    spawnLoot = true;

    async init(x: number, y: number, w: number, h: number) {
        super.init(x, y, w, h);
        this.body = Bodies.rectangle(x, y, w, h);
        Body.setStatic(this.body, true);
        Events.on(this.body, 'fireball', async () => {
            if (this.state === ChestState.Closed) {
                this.destroy();
            }
        });
        this.game.physics.registerBodies([this.body]);
        this.texturesMap.set(ChestState.Closed,  [await Assets.load(`/art/chests/chest_closed.png`)]);
        this.texturesMap.set(ChestState.Opening, await AssetsCommon.LoadTextures(5, (i) => `/art/chests/chest-opened_${i+1}.png`));
        this.sprite = new AnimatedSprite(this.texturesMap.get(ChestState.Closed));
        this.sprite.anchor.set(0.5);
        this.sprite.width = w;
        this.sprite.height = h;
        this.addChild(this.sprite);
        this.setState(ChestState.Closed);
    }

    async destroy(options?: DestroyOptions) {
        if (this.spawnLoot && this.state !== ChestState.Opening) {
            this.game.physics.unRegisterBodies([this.body]);
            this.setState(ChestState.Opening);
            this.spawnItems(GoldChestItem, [1, 0.75, 0.5, 0.25]);
            this.spawnItems(HealthPotionChestItem, [1, 0.75, 0.25]);
            this.spawnItems(ManaPotionChestItem, [0.75, 0.25]);
            await AsyncCommon.Delay(500);
            super.destroy(options);
        }
    }

    async spawnItems(itemClass: ChestItemClass, chanceList: number[]) {
        for (let i = 0; i < chanceList.length; i++) {
            if (Math.random() <= chanceList[i]) {
                this.spawnItem(itemClass);
            } else {
                break;
            }
        }
    }

    async spawnItem(itemClass: ChestItemClass) {
        const gold = new itemClass(this.game);
        this.game.world.viewport.addChild(gold);
        await gold.init(this.position.x, this.position.y, 50, 50);
        gold.fly(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 0.05 + 0.05);
    }

    setState(state: ChestState) {
        if (this.state !== state) {
            this.state = state;
            this.sprite.textures = this.texturesMap.get(this.state);
            this.sprite.animationSpeed = 0.1;
            this.sprite.play();
        }
    }
}

export type ChestItemClass = new (game: Game) => ChestItem;

export class ChestItem extends GameObject {
    lifespan = 5;
    body: Body;
    physics = new PhysicsComponent(this);

    async init(x: number, y: number, w: number, h: number) {
        this.body = Bodies.circle(x, y, w/2);
        this.physics.setBody(this.body);
        Events.on(this.body, 'fireball', () => {
            this.destroy();
        });
        Matter.Events.on(this.game.physics.engine, 'collisionStart', this._onCollision);
        this.game.physics.registerBodies([this.body]);
        super.init(x, y, w, h);
    }

    fly(x: number, y: number, flyingForce: number) {
        const dt = this.game.app.ticker.deltaMS/1000;
        Body.applyForce(this.body, this.body.position, Matter.Vector.create(x * dt * flyingForce, y * dt * flyingForce));
    }

    async destroy(options?: DestroyOptions) {
        Matter.Events.off(this.game.physics.engine, 'collisionStart', this._onCollision);
        this.game.physics.unRegisterBodies([this.body]);
        await super.destroy(options);
    }

    _onCollision = async (e: IEventCollision<any>) => {
        const pair = e.pairs[0];
        const isPlayer = (() => {
            return  (pair.bodyB.id === this.body.id && pair.bodyA.id === this.game.player.body.id) || 
                    (pair.bodyA.id === this.body.id && pair.bodyB.id === this.game.player.body.id)
        })();
        if (isPlayer) {
            this.onPlayerInteraction(this.game.player);
            this.destroy();
        }
    }

    onPlayerInteraction(player: Player) {
        //
    }
}

export class GoldChestItem extends ChestItem {
    sprite: AnimatedSprite;

    async init(x: number, y: number, w: number, h: number) {
        super.init(x, y, w, h);
        this.sprite = new AnimatedSprite(await AssetsCommon.LoadTextures(5, (i) => `/art/chests/goldCoin${i+1}.png`));
        this.sprite.anchor.set(0.5);
        this.sprite.width = w;
        this.sprite.height = h;
        this.sprite.animationSpeed = 0.1;
        this.sprite.play();
        this.addChild(this.sprite);
    }

    onPlayerInteraction(player: Player) {
        player.pickGold(this);
    }
}

export class PotionChestItem extends ChestItem {
    sprite: Sprite;
    texturePath: string;

    async init(x: number, y: number, w: number, h: number) {
        super.init(x, y, w, h);
        this.sprite = new Sprite(await Assets.load(this.texturePath));
        this.sprite.anchor.set(0.5);
        this.sprite.width = w;
        this.sprite.height = h;
        this.addChild(this.sprite);
    }
}

export class HealthPotionChestItem extends PotionChestItem {
    texturePath = '/art/chests/potion_health.png';
    healthAmount = 5;

    onPlayerInteraction(player: Player) {
        player.pickHealthPotion(this);
    }
}

export class ManaPotionChestItem extends PotionChestItem {
    texturePath = '/art/chests/potion_mana.png';
    manaAmount = 5;

    onPlayerInteraction(player: Player) {
        player.pickManaPotion(this);
    }
}
