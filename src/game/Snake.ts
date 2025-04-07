import { Container, PointData, Sprite } from "pixi.js";
import { SnakeDirection, snakeDirectionToVector } from "./SnakeDirection";
import { getContainersOverlap, getPointsOverlap } from "./Common";
import Game from "./Game";
import { GameProperty } from "./GameConfig";
import SpriteManager from "./SpriteManager";

export default class Snake extends Container {
    tiles = new Array<SnakeTile>();
    tilesPointsListCache = new Array<PointData>();
    direction = SnakeDirection.Right;
    directionInputReceived = false;

    constructor(
        public game: Game,
        public tileSize: number,
        initialSize = 3) {
            super();
            console.info(this);
            for (let i = 0; i < initialSize; i++) {
                this._createTile(i * tileSize, 0, tileSize);
            }
            this.tiles = this.tiles.reverse(); // 0 -> head
            this.head.setHeadOrBody(true);
            this._updateTilesPointsListCache();
        }

    get head() { return this.tiles[0]; }

    _createTile(x: number, y: number, tileSize: number) {
        const tile = new SnakeTile(x, y, tileSize);
        this._moveTile(tile, x, y);
        this.tiles.push(tile);
        this.addChild(tile);
    }
    _update() {
        this.directionInputReceived = false;
        const last = this.tiles.pop();
        const lastPosition = { x: last.position.x, y: last.position.y }; //store to grow later
        const first = this.head;
        const directionVector = snakeDirectionToVector(this.direction);
        const delta = {
            x: directionVector.x * this.tileSize,
            y: directionVector.y * this.tileSize
        };
        first.setHeadOrBody(false);
        last.setHeadOrBody(true);
        this._moveTile(last, first.position.x + delta.x, first.position.y + delta.y);
        this.tiles.unshift(last);
        const godMode = this.game.config.hasProperty(GameProperty.GodMode);
        // check hit self
        if (!godMode) {
            const selfHit = this._isHeadHitSelf();
            if (selfHit) {
                this.game.gameOver()
                return;
            }
        }
        // moved, check hit bounds walls
        const boundsWallHit = this._isHeadHitBoundsWall(this.head);
        if (boundsWallHit) {
            if (godMode) {
                // teleport
                const teleportLocation = this._getBoundsWallHitTeleportLocation(last);
                this._moveTile(this.head, teleportLocation.x, teleportLocation.y);
            } else {
                this.game.gameOver();
                return;
            }
        }
        this._updateTilesPointsListCache();
        if (!godMode) {
            // check dynamic walls
            const dynamicWallsHit = this._isHeadHitDynamicWall();
            if (dynamicWallsHit) {
                this.game.gameOver()
                return;
            }
        }
        // check food
        const food = this._findFoodOverlap(this.head);
        if (food) {
            this._createTile(lastPosition.x, lastPosition.y, this.tileSize);
            this.game._onFoodConsumed(food);
        }
    }
    _moveTile(tile: SnakeTile, x: number, y: number) {
        tile.position.set(x, y);
    }
    _updateTilesPointsListCache() {
        this.tilesPointsListCache = this.tiles.map(tile => tile.position);
    }
    _findFoodOverlap(head: SnakeTile) {
        for (const tile of this.game.foodList) {
            if (getContainersOverlap(head, tile)) {
                return tile;
            }
        }
    }
    _isHeadHitSelf() {
        const pointsWithoutHead = this.tiles.filter(tile => tile != this.head).map(tile => tile.position);
        return pointsWithoutHead.some(p => getPointsOverlap(p, this.head.position));
    }
    _isHeadHitDynamicWall() {
        const wallsPositions = [];
        this.game.field.dynamicWalls.forEach(w => {
            w.tiles.forEach(t => {
                wallsPositions.push(t.position);
            });
        });
        return wallsPositions.some(p => getPointsOverlap(p, this.head.position));
    }
    _isHeadHitBoundsWall(head: SnakeTile) {
        switch (this.direction) {
            case SnakeDirection.Left:  return head.position.x < 0;
            case SnakeDirection.Right: return head.position.x >= this.game.field.size.x*this.tileSize;
            case SnakeDirection.Up:    return head.position.y < 0;
            case SnakeDirection.Down:  return head.position.y >= this.game.field.size.y*this.tileSize;
        }
    }
    _getBoundsWallHitTeleportLocation(head: SnakeTile) {
        switch (this.direction) {
            case SnakeDirection.Left:  return { x: (this.game.field.size.x-1)*this.tileSize, y: head.position.y };
            case SnakeDirection.Right: return { x: 0, y: head.position.y };
            case SnakeDirection.Up:    return { x: head.position.x, y: (this.game.field.size.y-1)*this.tileSize };
            case SnakeDirection.Down:  return { x: head.position.x, y: 0 };
        }
    }
    setDirection(value: SnakeDirection) {
        if (!this.directionInputReceived) {
            const canSet = (() => {
                switch (this.direction) {
                    case SnakeDirection.Left:  return value !== SnakeDirection.Right;
                    case SnakeDirection.Right: return value !== SnakeDirection.Left;
                    case SnakeDirection.Up:    return value !== SnakeDirection.Down;
                    case SnakeDirection.Down:  return value !== SnakeDirection.Up;
                }
            })();
            if (canSet) {
                this.direction = value;
                this.directionInputReceived = true;
            }
        }
    }
    occupiesPoint(point: PointData) {
        return this.tilesPointsListCache.some(p => getPointsOverlap(p, point));
    }
}

export class SnakeTile extends Container {
    spriteBody: Sprite;
    spriteHead: Sprite;

    constructor(x: number, y: number, tileSize: number) {
        super();
        this.spriteBody = new Sprite(SpriteManager.Instance.texture.snake);
        this.spriteHead = new Sprite(SpriteManager.Instance.texture.snakeHead);
        this.spriteHead.width = this.spriteHead.height = tileSize;
        this.spriteBody.width = this.spriteBody.height = tileSize;
        this.addChild(this.spriteBody, this.spriteHead);
        this.position.set(x, y);
        this.setHeadOrBody(false);
    }

    setHeadOrBody(isHead: boolean) {
        this.spriteHead.visible = isHead;
        this.spriteBody.visible = !isHead;
    }
}