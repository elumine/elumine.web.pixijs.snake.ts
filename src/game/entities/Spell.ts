import Matter, { Bodies, Body, Events, IEventCollision } from "matter-js";
import { GameObject } from "./GameObject";
import Game from "../Game";
import { AnimatedSprite, DestroyOptions, Texture } from "pixi.js";
import { PhysicsComponent } from "../components/PhysicsComponent";
import { AsyncCommon } from "../Async";
import { Character } from "./Character";
import { AssetsCommon } from "../Assets";
import { CooldownComponent } from "../components/Cooldown";
import SoundManager from "../SoundManager";
import { ShockwaveFilter } from "pixi-filters";


export class Spell extends GameObject {
    zIndex = 4;
    body: Body;
    physics = new PhysicsComponent(this);

    async init(x: number, y: number, w: number, h: number) {
        super.init(x, y, w, h);
        this.body = Bodies.circle(x, y, Math.max(w, h)/2);
        Body.setMass(this.body, 1);
        this.game.physics.registerBodies([this.body]);
        this.physics.setBody(this.body);
    }

    async destroy(options?: DestroyOptions) {
        this.game.physics.unRegisterBodies([this.body]);
        await super.destroy(options);
    }
}

export enum FireballSpellState {
    Flying, Collision
}
export class FireballSpell extends Spell {
    sprite: AnimatedSprite;
    state: FireballSpellState;
    impactForce = 0.1;
    flyingForceMultiplier = 2;
    flyingForce: Matter.Vector;
    flyingDirection: Matter.Vector;
    texturesMap = new Map<FireballSpellState, Texture[]>();

    constructor(public game: Game, public caster: GameObject) {
        super(game);
    }
    
    async init(x: number, y: number, w: number, h: number) {
        super.init(x, y, w, h);
        this.texturesMap.set(FireballSpellState.Flying,   await AssetsCommon.LoadTextures(3, (i) => `/art/fireball/fireball_${i+1}.png`));
        this.texturesMap.set(FireballSpellState.Collision, await AssetsCommon.LoadTextures(7, (i) => `/art/fireball/fireball-explosion_${i+1}.png`));
        this.sprite = new AnimatedSprite(this.texturesMap.get(FireballSpellState.Flying));
        this.sprite.anchor.set(0.5);
        this.sprite.width = w;
        this.sprite.height = h;
        this.addChild(this.sprite);
        this.setState(FireballSpellState.Flying);
    }

    async destroy(options?: DestroyOptions) {
        Matter.Events.off(this.game.physics.engine, 'collisionStart', this._onCollision);
        super.destroy(options);
    }

    async fly(x: number, y: number) {
        SoundManager.Instance.playFireball();
        Matter.Events.on(this.game.physics.engine, 'collisionStart', this._onCollision);
        const dt = this.game.app.ticker.deltaMS/1000;
        this.flyingDirection = Matter.Vector.create(x, y);
        this.flyingForce = Matter.Vector.create(this.flyingForceMultiplier * x * dt, this.flyingForceMultiplier * y * dt);
        Body.applyForce(this.body, this.body.position, this.flyingForce);
        this.sprite.animationSpeed = 0.25;
        this.setState(FireballSpellState.Flying);
        this.scale.set(2, 1);
        await AsyncCommon.Delay(5000);
        if (this.state === FireballSpellState.Flying) {
            this.destroy();
        }
    }

    _onCollision = async (e: IEventCollision<any>) => {
        const pair = e.pairs[0];
        let char: Character;
        if (pair.bodyA.id === this.body.id) {
            Events.trigger(pair.bodyB, 'fireball');
            char = this.game.characters.find(c => c.body.id === pair.bodyB.id);
        } else if (pair.bodyB.id === this.body.id) {
            Events.trigger(pair.bodyA, 'fireball');
            char = this.game.characters.find(c => c.body.id === pair.bodyA.id);
        }
        if (char && char !== this.caster) {
            Matter.Events.off(this.game.physics.engine, 'collisionStart', this._onCollision);
            const impactF = Matter.Vector.create(
                this.flyingDirection.x * this.impactForce,
                this.flyingDirection.y * this.impactForce
            );
            char.applyForceForDuration(impactF, 500, true);
            char.applyDamage(3);
        }

        const f = new ShockwaveFilter({
            speed: 1000,
            amplitude: 5,
            wavelength: 400,
            brightness: 1,
            radius: -1,
            center: this.game.world.viewport.toScreen(this.position.x, this.position.y)
        });
        const updateEffect = () => {
            f.time += this.game.app.ticker.elapsedMS / 1000;
        };
        this.game.app.ticker.add(updateEffect)
        this.game.filters.applyFilterForDuration(f, 3000, () => {
            this.game.app.ticker.remove(updateEffect);
        });

        this.sprite.animationSpeed = 0.5;
        this.setState(FireballSpellState.Collision);
        this.scale.set(1.5, 1.5);
        Body.setSpeed(this.body, 0);
        this.physics.destroy();
        await AsyncCommon.Delay(250);
        this.destroy();
    }

    setState(state: FireballSpellState) {
        if (this.state !== state) {
            this.state = state;
            this.sprite.textures = this.texturesMap.get(this.state);
            this.sprite.play();
        }
    }
}