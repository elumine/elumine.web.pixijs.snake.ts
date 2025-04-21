import { AnimatedSprite, ColorMatrixFilter, DestroyOptions, Texture, Ticker } from "pixi.js";
import { GameObject } from "./GameObject";
import { AssetsCommon } from "../Assets";
import { AsyncCommon } from "../Async";
import Matter, { Bodies, Body } from "matter-js";
import { ManaComponent } from "../components/ManaComponent";
import { FireballSpell } from "./Spell";
import { PhysicsComponent } from "../components/PhysicsComponent";
import { Rotation } from "../math/Rotatation";
import { HealthComponent } from "../components/HealthComponent";
import { Float } from "../math/Float";
import { Subject } from "rxjs";
import SoundManager from "../SoundManager";

export enum CharacterStates {
    Idle, Walk, Run, Jump, Attack, Hurt, Die
}
export class Character extends GameObject {
    characterAssetName = 'wizard_arcane';
    zIndex = 3;
    sprite: AnimatedSprite;
    texturesMap = new Map<CharacterStates, Texture[]>();
    state: CharacterStates;
    body: Body;
    forceAppliedForDuration = {
        f: null,
        active: false,
        duration: 0,
        interval: 0,
        startTime: 0
    };
    movementForce = 0.033;
    movementInput = {
        direction: Matter.Vector.create(0, 0),
        scale: 0
    }
    health = new HealthComponent(this);
    physics = new PhysicsComponent(this);
    onDeath = new Subject<Character>();
    onFireballCast = new Subject();;
    onDamageReceived = new Subject<number>();

    override async init(x: number, y: number, w: number, h: number) {
        this.body = Bodies.circle(x, y, Math.max(w, h) / 2);
        Body.setMass(this.body, 1);
        this.game.physics.registerBodies([this.body]);
        this.physics.setBody(this.body);
        this.texturesMap.set(CharacterStates.Idle, await AssetsCommon.LoadTextures(5, (i) => `/art/${this.characterAssetName}/1_IDLE_00${i}.png`));
        this.texturesMap.set(CharacterStates.Walk, await AssetsCommon.LoadTextures(5, (i) => `/art/${this.characterAssetName}/2_WALK_00${i}.png`));
        this.texturesMap.set(CharacterStates.Attack, await AssetsCommon.LoadTextures(5, (i) => `/art/${this.characterAssetName}/5_ATTACK_00${i}.png`));
        this.texturesMap.set(CharacterStates.Hurt, await AssetsCommon.LoadTextures(5, (i) => `/art/${this.characterAssetName}/6_HURT_00${i}.png`));
        this.texturesMap.set(CharacterStates.Jump, await AssetsCommon.LoadTextures(5, (i) => `/art/${this.characterAssetName}/4_JUMP_00${i}.png`));
        this.texturesMap.set(CharacterStates.Die, await AssetsCommon.LoadTextures(5, (i) => `/art/${this.characterAssetName}/7_DIE_00${i}.png`));
        this.sprite = new AnimatedSprite(this.texturesMap.get(CharacterStates.Idle));
        this.addChild(this.sprite);
        this.sprite.anchor.set(0.5);
        this.sprite.width = w;
        this.sprite.height = h;
        this.setState(CharacterStates.Idle);
        this.registerSubscribtion(this.health.onHealthChanged.subscribe(e => {
            if (e.health === 0) {
                this.die();
            }
        }))
        super.init(x, y, w, h);
    }

    override async destroy(options?: DestroyOptions) {
        this.game.physics.unRegisterBodies([this.body]);
        await super.destroy(options);
    }

    override tick(ticker: Ticker) {
        let movementScale = 0;
        switch (this.state) {
            case CharacterStates.Idle:
            case CharacterStates.Walk:
                this.scale.set(Math.abs(this.scale.x) * (Math.sign(this.movementInput.direction.x) || 1), this.scale.y);
                if (this.movementInput.scale > 0.05) {
                    this.setState(CharacterStates.Walk);
                    movementScale = this.movementInput.scale;
                    this.sprite.animationSpeed = Float.Lerp(0.1, 0.5, movementScale);
                } else {
                    this.setState(CharacterStates.Idle);
                }
                break;
        }
        if (movementScale > 0) {
            const dt = ticker.deltaMS / 1000;
            const movementForce = Matter.Vector.create(
                this.movementInput.direction.x * movementScale * this.movementForce * dt,
                this.movementInput.direction.y * movementScale * this.movementForce * dt);
            let f = movementForce;
            if (this.forceAppliedForDuration.active) {
                const mult = (1 - (performance.now() - this.forceAppliedForDuration.startTime)/this.forceAppliedForDuration.duration);
                const durationForce = Matter.Vector.create(
                    this.forceAppliedForDuration.f.x * dt * (mult),
                    this.forceAppliedForDuration.f.y * dt * (mult)
                );
                f  = Matter.Vector.add(movementForce, durationForce);
            }
            this.applyFore(f);
        }
    }

    async die() {
        SoundManager.Instance.play('death');
        this.onDeath.next(this);
        await this.setState(CharacterStates.Die);
    }

    applyDamage(delta: number) {
        this.health.removeHealth(delta);
        this.onDamageReceived.next(delta);
    }

    applyFore(f: Matter.Vector, bClearExisting = false) {
        if (bClearExisting) {
            Body.setVelocity(this.body, Matter.Vector.create(0, 0));
        }
        Body.applyForce(this.body, this.position, f);
    }

    applyForceForDuration(f: Matter.Vector, duration: number, bClearExisting = false) {
        if (bClearExisting) {
            Body.setVelocity(this.body, Matter.Vector.create(0, 0));
        }
        clearTimeout(this.forceAppliedForDuration.interval);
        this.forceAppliedForDuration = {
            f: f,
            active: true,
            duration: duration,
            startTime: performance.now(),
            interval: setTimeout(() => {
                this.forceAppliedForDuration.active = false;
            }, duration)
        }
    }

    setMovementInput(x: number, y: number, scale: number) {
        this.movementInput.direction.x = x;
        this.movementInput.direction.y = y;
        this.movementInput.scale = scale;
    }

    async castFireball() {
        return this.castFireballInDirection(this.movementInput.direction.x, this.movementInput.direction.y);
    }

    async castFireballInDirection(x: number, y: number) {
        if (this.state === CharacterStates.Walk || this.state === CharacterStates.Idle) {
            this.onFireballCast.next(null);
            const fireball = new FireballSpell(this.game, this);
            this.game.world.viewport.addChild(fireball);
            fireball.rotation = Rotation.AngleFromDirectionRadians(this.movementInput.direction);
            this.setState(CharacterStates.Attack)
                .then(() => {
                    if (this.state === CharacterStates.Attack) {
                        this.setState(CharacterStates.Idle);
                    }
                });
            await fireball.init(
                this.position.x + (x * (this.width + 25)),
                this.position.y + (y * (this.height + 25)),
                50, 50);
            await fireball.fly(this.movementInput.direction.x, this.movementInput.direction.y);
        }
    }

    async setState(state: CharacterStates) {
        if (this.state !== state) {
            this.state = state;
            this.sprite.textures = this.texturesMap.get(this.state);
            this.sprite.play();
            switch (this.state) {
                case CharacterStates.Idle:
                    this.sprite.animationSpeed = 0.1;
                    this.scale.set(1, 1);
                    return null;
                case CharacterStates.Walk:
                    this.sprite.animationSpeed = 0.1;
                    this.scale.set(1.1, 1.1);
                    return null;
                case CharacterStates.Attack:
                    this.sprite.animationSpeed = 0.2;
                    this.scale.set(Math.sign(this.movementInput.direction.x) * 1.6, 1.3);
                    return AsyncCommon.Delay(250);
                case CharacterStates.Die:
                    this.sprite.animationSpeed = 0.05;
                    this.scale.set(1, 1);
                    return AsyncCommon.Delay(1000);
            }
        }
    }
}
