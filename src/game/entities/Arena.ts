import { Assets, ColorMatrixFilter, Container, DestroyOptions, DisplacementFilter, Graphics, Sprite } from "pixi.js";
import { Vector2 } from "../math/Vector2";
import Game from "../Game";
import { Character } from "./Character";
import { Subject } from "rxjs";
import { Float } from "../math/Float";
import { FiltersSystem } from "../systems/filters/FiltersSystem";

export class Arena extends Container {
    zIndex = 2;
    tileLayers = new Map<number, Sprite[]>();
    activeLayer = 0;
    circles = {
        radius: [],
        x: 0,
        y: 0
    }
    dpsValue = 0.2;
    shrinkTimerDuration = 10;
    shrinkTimer = new ArenaShrinkTimer();
    onActiveLayerChanged = new Subject<Arena>();
    tickDamageInterval = 0;
    filtersSystem: ArenaFiltersSystem;

    constructor(public game: Game) {
        super();
    }

    get activeLayerRadius() {
        return this.circles.radius[this.activeLayer];
    }

    async init(x: number, y: number, w: number, h: number) {
        this.position.set(x, y);
        this.width = w;
        this.height = h;
        const tilesize = 50;
        const tiles = [];
        const texture = await Assets.load('/art/tiles/tiles_grass.png');
        this.circles = {
            radius: [0, w / 4, w / 2.5, w / 2],
            x: w / 2,
            y: h / 2
        };
        for (let i = 0; i < w / tilesize; i++) {
            for (let j = 0; j < h / tilesize; j++) {
                const x = tilesize * i, y = tilesize * j;
                rLoop: for (let r = 1; r < this.circles.radius.length; r++) {
                    const rMin = this.circles.radius[r - 1];
                    const rMax = this.circles.radius[r];
                    if (!this.tileLayers.has(r)) this.tileLayers.set(r, []);
                    if (this.circleTest(this.circles.x, this.circles.y, rMin, rMax, x, y, tilesize, tilesize)) {
                        const tile = new Sprite(texture);
                        tile.position.set(x, y);
                        tile.tint = (0xffffff * Float.Lerp(0.8, 1, (1 - (r - 1) / 3)));
                        tile.width = tile.height = tilesize;
                        this.addChild(tile);
                        tiles.push(tile);
                        this.tileLayers.get(r).push(tile);
                        break rLoop;
                    }
                }
            }
        }
        this.setActiveLayer(3);
        this.tickDamageInterval = setInterval(this.tickDamage, 100);
        this.filtersSystem = new ArenaFiltersSystem(this.game, this);
        await this.filtersSystem.init();
    }

    override async destroy(options?: DestroyOptions) {
        clearInterval(this.tickDamageInterval);
        await this.filtersSystem.destroy();
        super.destroy(options);
    }

    tickDamage = () => {
        this.game.chests.chestsList.forEach(c => {
            const onGround = this.objectInCurrentRadius(c.position.x, c.position.y, 0, 0);
            if (!onGround) {
                c.destroy();
            }
        });
        this.game.characters.forEach(c => {
            const onGround = this.objectInCurrentRadius(c.position.x, c.position.y, 0, 0);
            if (!onGround) {
                this.applyDamageToCharacter(c)
            }
        });
    }

    applyDamageToCharacter(c: Character) {
        c.applyDamage(this.dpsValue);
    }

    setActiveLayer(newLayer: number) {
        if (newLayer >= 1 && this.activeLayer !== newLayer) {
            this.activeLayer = newLayer;
            this.onActiveLayerChanged.next(this);
            for (const [layer, tiles] of this.tileLayers.entries()) {
                if (layer > this.activeLayer) {
                    tiles.forEach(tile => tile.destroy());
                }
            }
            this.startShrinkTimer();
        } else {
            this.shrinkTimer.setSecondsLeft(-1);
        }
    }
    startShrinkTimer() {
        this.shrinkTimer.start(this.shrinkTimerDuration)
            .onTimerFinished.subscribe(() => {
                this.setActiveLayer(this.activeLayer - 1);
            });
    }

    objectInCurrentRadius(x: number, y: number, w: number, h: number) {
        return this.circleTest(this.circles.x, this.circles.y, 0, this.circles.radius[this.activeLayer], x, y, w, h);
    }

    circleTest(cx: number, cy: number, radiusMin: number, radiusMax: number, x: number, y: number, w: number, h: number) {
        const corner = {
            a: {
                x: x - cx,
                y: y - cy
            },
            b: {
                x: x - cx + w,
                y: y - cy + h
            }
        };
        const maxDistance = Math.max(Vector2.Length(corner.a), Vector2.Length(corner.b)) - (Math.min(w, h) / 2);
        return maxDistance <= radiusMax && maxDistance >= radiusMin;
    }
}

export class ArenaShrinkTimer {
    updateInterval = 0;
    secondsLeft = 0;
    onTimeChanged = new Subject<ArenaShrinkTimer>();
    onTimerFinished = new Subject<ArenaShrinkTimer>();

    start(durationInSeconds: number) {
        this.setSecondsLeft(durationInSeconds);
        this.updateInterval = setInterval(() => {
            this.setSecondsLeft(Math.max(0, this.secondsLeft - 1));
        }, 1000);
        return this;
    }

    setSecondsLeft(value: number) {
        this.secondsLeft = value;
        this.onTimeChanged.next(this);
        if (this.secondsLeft === 0) {
            clearInterval(this.updateInterval);
            this.onTimerFinished.next(this);
        }
    }
}


export class ArenaFiltersSystem extends FiltersSystem {
    filters = {
        displacement: null
    };
    override async init() {
        this.filters.displacement = new DisplacementFilter({
            sprite: new Sprite(await Assets.load('/art/perlin.png'))
        });
        this.tick();
        await super.init();
    }

    tick() {
        const t = performance.now();
        this.filters.displacement.scale.x = 5 * (Math.sin(t * 0.005) + 1)/2;
        this.filters.displacement.scale.y = 5 * (Math.cos(t * 0.005) + 1)/2;
        requestAnimationFrame(() => this.tick());
    }
}