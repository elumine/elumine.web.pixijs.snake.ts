import { Application, PointData } from "pixi.js";
import Snake from "./Snake";
import Food from "./Food";
import Field from "./Field";
import InputManager from "./InputManager";
import UI from "./ui/UI";
import GameScore from "./GameScore";
import GameConfig, { GameProperty } from "./GameConfig";
import { getPointsOverlap } from "./Common";
import SoundManager from "./SoundManager";
import SpriteManager from "./SpriteManager";


export enum GameStates {
    Menu, Playing, Exited
}

export default class Game {
    app = new Application();
    score = new GameScore();
    config = new GameConfig();
    inputManager = new InputManager(this);;
    foodList = new Array<Food>();
    field: Field;
    snake: Snake;
    state = GameStates.Menu;
    ui: UI;
    tickTimer: number;

    constructor() {
        console.info(this);
        this._init();
    }

    async _init() {
        const container = document.getElementById("container");
        await this.app.init({ background: "#111111", resizeTo: window });
        container.appendChild(this.app.canvas);
        this.ui = new UI(this);
        this.app.stage.addChild(this.ui);
        window.addEventListener('resize', () => this._resizeAndCenterStage());
        this._resizeAndCenterStage();
        //assets
        this.ui.loadingScreen.visible = true;
        await SpriteManager.Instance.load();
        await SoundManager.Instance.load();
        this.ui.loadingScreen.visible = false;
        //objects
        this.field = new Field();
        this.app.stage.addChild(this.field);
        this._updateUiScore();
        this._openMenu();
    }

    _resizeAndCenterStage() {
        this.app.stage.scale.set(1, 1);
        const bounds = this.app.stage.getBounds();
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

    _exitGame() {
        SoundManager.Instance.play('gameOver');
        this._stopTick();
        this.app.destroy();
    }

    _openMenu() {
        SoundManager.Instance.play('menuSelect');
        SoundManager.Instance.playMusic('menuMusic');
        this._stopTick();
        this.ui.showMenuScreen();
        if (this.snake) this.snake.destroy();
        this.foodList.forEach(f => {
            f.removeListener('destroyed', this._onFoodConsumed);
            f.destroy();
        });
        this.foodList = [];
        this.field.clearDynamicWalls();
    }

    _startGame() {
        SoundManager.Instance.play('gameStart');
        SoundManager.Instance.playMusic('gameMusic');
        this.score.resetScore();
        this._updateUiScore();
        this.ui.showPlayScreen();
        this.snake = new Snake(this, this.field.tileResolution);
        this.field.grid.addChild(this.snake);
        this._createFood();
        this._startTick();
    }

    _startTick() { this.tickTimer = setInterval(() => this._tick(), this.config.gameSpeed); }
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
        const food = new Food(this._findPlaceToSpawnObject(), this.field.tileResolution);
        this.foodList.push(food);
        this.field.grid.addChild(food);
        return food;
    }
    _onFoodConsumed = (food: Food) => {
        SoundManager.Instance.play('foodConsume');
        this.score.addScore();
        this._updateUiScore();
        if (this.config.hasProperty(GameProperty.WallsMode)) {
            this.field.spawnDynamicWall(this._findPlaceToSpawnObject(), {x: 1, y: 1});
        }
        if (this.config.hasProperty(GameProperty.SpeedMode)) {
            this.config.incrementSpeed();
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
    _updateUiScore() {
        this.ui.setScore(this.score.currentScore, this.score.bestScore);
    }

    setGameState(state: GameStates) {
        this.state = state;
        switch (state) {
            case GameStates.Menu: this._openMenu(); break;
            case GameStates.Playing: this._startGame(); break;
            case GameStates.Exited: this._exitGame(); break;
        }
    }
    gameOver() {
        SoundManager.Instance.play('gameOver');
        this._openMenu();
    }
}
