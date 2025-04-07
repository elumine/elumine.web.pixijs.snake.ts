import { Container, Graphics, PointData, Sprite } from "pixi.js";
import SpriteManager from "./SpriteManager";

export class Wall extends Container {
    tiles = new Array<WallTile>();

    constructor(
        tileSize: number,
        startCoords: PointData, size: PointData, color: string) {
            super();
            for (let i = 0; i < size.x; i++) {
                for (let j = 0; j < size.y; j++) {
                    const tile = new WallTile(
                        {
                            x: startCoords.x*tileSize+i*tileSize,
                            y: startCoords.y*tileSize+j*tileSize
                        },
                        tileSize, color
                    );
                    this.tiles.push(tile);
                    this.addChild(tile);
                }
            }
        }
}

export class WallTile extends Container {
    sprite = new Sprite(SpriteManager.Instance.texture.wall);

    constructor(position: PointData, tileSize: number, color: string) {
        super();
        this.position.set(position.x, position.y);
        this.sprite.width = tileSize;
        this.sprite.height = tileSize;
        this.addChild(this.sprite);
    }
}