import { Assets, Texture } from "pixi.js";

export interface TextureMap {
    wall: Texture;
    food: Texture;
    snake: Texture;
    snakeHead: Texture;
}

export default class SpriteManager {
    static readonly Instance = new SpriteManager();
    texture: TextureMap = {} as TextureMap;
    texturesLoadingConfig = {
        wall: 'wall',
        food: 'food-item',
        snake: 'snake-tile',
        snakeHead: 'snake-tile-head'
    };

    constructor() {
        //
    }

    async load() {
        await Promise.all(
            Object.keys(this.texturesLoadingConfig).map((key) => this._loadSprite(key, this.texturesLoadingConfig[key]))
        )
    }

    async _loadSprite(name: string, fileName: string) {
        const texture = await Assets.load( `art/${fileName}.png` );
        this.texture[name] = texture;
        return texture;
    }
}
