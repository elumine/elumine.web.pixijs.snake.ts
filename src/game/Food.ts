import { Container, PointData, Sprite } from "pixi.js";
import SpriteManager from "./SpriteManager";

export default class Food extends Container {
    sprite = new Sprite(SpriteManager.Instance.texture.food);

    constructor(coords: PointData, tileSize: number) {
        super();
        this.addChild(this.sprite);
        this.position.set(coords.x*tileSize, coords.y*tileSize);
        this.sprite.width = tileSize;
        this.sprite.height = tileSize;
    }
}