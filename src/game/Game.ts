import { Application, PointData } from "pixi.js";
import Snake from "./Snake";
import Food from "./Food";
import Field from "./Field";
import InputManager from "./InputManager";
import GameConfig, { GameProperty } from "../Store/game/GameConfig";
import { getPointsOverlap } from "./Common";
import SoundManager from "./SoundManager";
import SpriteManager from "./SpriteManager";
import { Subject } from "rxjs";
import { GameSession } from "../Store/GameStore";


export enum GameStates {
    Menu, Playing, Exited
}

export default class Game {
    app = new Application();
    config: GameConfig;
    session: GameSession;
    inputManager = new InputManager(this);;
    foodList = new Array<Food>();
    field: Field;
    snake: Snake;
    state = GameStates.Menu;
    tickTime = 100;
    tickTimer: number;
    onEnded = new Subject();
    tileResolution = 20;
    fieldSize = 20;
    container: HTMLElement = null;

    constructor(containerId: string) {
        console.info(this);
        this._init(containerId);
    }

    async _init(containerId) {
        this.container = document.getElementById(containerId);
        await this.app.init({ background: "#111111" });
        this.container.appendChild(this.app.canvas);
        window.addEventListener('resize', () => this._resizeAndCenterStage());
        this._resizeAndCenterStage();
        this.inputManager.onInput.subscribe((input) => {
            this.session.analytics.registerInput(input);
        });
        //assets
        await SpriteManager.Instance.load();
        await SoundManager.Instance.load();
        //objects
        this.field = new Field({
            x: this.fieldSize, y: this.fieldSize
        }, this.tileResolution);
        this.app.stage.addChild(this.field);
    }

    _resizeAndCenterStage() {
        const filedSizePx = this.tileResolution * (this.fieldSize + 2);
        this.app.renderer.resize(this.container.clientWidth, this.container.clientHeight);
        this.app.stage.scale.set(1, 1);
        const bounds = {
            width: this.tileResolution * (this.fieldSize + 2),
            height: this.tileResolution * (this.fieldSize + 2)
        }
        const scaleW = this.app.renderer.width / bounds.width;
        const scaleH = this.app.renderer.height / bounds.height;
        const scale = Math.min(scaleW, scaleH);
        this.app.stage.scale.set(scale, scale);
        const freeSpace = {
            x: this.app.renderer.width - bounds.width * scale,
            y: this.app.renderer.height - bounds.height * scale,
        }
        this.app.stage.position.set(freeSpace.x/2, freeSpace.y/2);
    }

    destroy() {
        this.app.destroy();
    }

    startGame(session: GameSession) {
        this.session = session;
        this.config = session.gameConfig;
        this.inputManager.setEnabled(true);
        this._resizeAndCenterStage();
        SoundManager.Instance.play('gameStart');
        SoundManager.Instance.playMusic('gameMusic');
        if (this.snake) this.snake.destroy();
        this.snake = new Snake(this, this.tileResolution);
        this.field.grid.addChild(this.snake);
        this._createFood();
        this._startTick();
    }

    gameOver() {
        this._stopTick();
        this.onEnded.next(null);
        this.inputManager.setEnabled(false);
        SoundManager.Instance.play('gameOver');
    }

    _startTick() { this.tickTimer = setInterval(() => this._tick(), this.tickTime); }
    _stopTick() { clearInterval(this.tickTimer); }

    _tick() {
        this.snake._update();
    }

    _createFood() {
        this.foodList.forEach(f => f.destroy());
        this.foodList = [];
        this._spawnFoodItem();
        if (this.config.hasProperty(GameProperty.PortalMode)) this._spawnFoodItem();
    }
    _spawnFoodItem() {
        const food = new Food(this._findPlaceToSpawnObject(), this.tileResolution);
        this.foodList.push(food);
        this.field.grid.addChild(food);
        return food;
    }
    _onFoodConsumed = (food: Food) => {
        SoundManager.Instance.play('foodConsume');
        this.session.analytics.addScore();
        if (this.config.hasProperty(GameProperty.WallsMode)) {
            this.field.spawnDynamicWall(this._findPlaceToSpawnObject(), {x: 1, y: 1});
        }
        if (this.config.hasProperty(GameProperty.SpeedMode)) {
            this._incrementSpeed();
            this._stopTick();
            this._startTick();
        }
        if (this.config.hasProperty(GameProperty.PortalMode)) {
            const otherFood = this.foodList.filter(f => f !== food)[0];
            this.snake.head.position.set(otherFood.position.x, otherFood.position.y);
        }
        this._createFood();
    }
    _findPlaceToSpawnObject() {
        const point: PointData = {
            x: Math.floor(Math.random() * this.field.size.x), 
            y: Math.floor(Math.random() * this.field.size.y)
        }
        const occupiedBySnake = this.snake.occupiesPoint(point);
        const occupiedDynamicWall = this.field.dynamicWalls.some(wall => getPointsOverlap(wall.position, point));
        const occupiedByFood = this.foodList.some(food => getPointsOverlap(food.position, point));
        const occupied = occupiedBySnake || occupiedDynamicWall || occupiedByFood;
        return occupied ? this._findPlaceToSpawnObject() : point;
    }
    _incrementSpeed() {
        this.tickTime *= 0.9;
    }
}
