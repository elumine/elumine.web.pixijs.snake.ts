import { Assets, ColorMatrixFilter, Container, DestroyOptions, DisplacementFilter, Graphics, Sprite } from "pixi.js";
import { FiltersSystem } from "../systems/filters/FiltersSystem";
import Game from "../Game";

export class Background extends Container {
    zIndex = 1;
    filtersSystem: BackgroundFiltersSystem;

    constructor(public game: Game) {
        super();
    }

    async init(x: number, y: number, w: number, h: number) {
        this.position.set(x, y);
        this.width = w;
        this.height = h;
        const tilesize = 100;
        const tiles = [];
        const texture = await Assets.load('/art/tiles/tiles_magma.png');
        for (let i = 0; i < w/tilesize; i++) {
            for (let j = 0; j < h/tilesize; j++) {
                const tile = new Sprite(texture);
                tiles.push(tile);
                tile.position.set(tilesize*i - w/2, tilesize*j - h/2);
                tile.width = tile.height = tilesize;
                this.addChild(tile);
            }
        }
        this.filtersSystem = new BackgroundFiltersSystem(this.game, this);
        await this.filtersSystem.init();
    }

    async destroy(options?: DestroyOptions) {
        await this.filtersSystem.destroy();
        await super.destroy(options);
    }
}

export class BackgroundFiltersSystem extends FiltersSystem {
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
        this.filters.displacement.scale.x = 20 * (Math.sin(t * 0.01) + 1)/2;
        this.filters.displacement.scale.y = 20 * (Math.cos(t * 0.01) + 1)/2;
        requestAnimationFrame(() => this.tick());
    }
}