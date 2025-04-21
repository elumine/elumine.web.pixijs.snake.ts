import { Application, PointData } from "pixi.js";
import InputManager from "./InputManager";
import { Subject } from "rxjs";
import { GameSession } from "../Store/GameStore";
import { Character } from "./entities/Character";
import { World } from "./World";
import { PhysicsSystem } from "./systems/Physics";
import { Enemy } from "./entities/Enemy";
import { Background } from "./entities/Background";
import { Arena } from "./entities/Arena";
import { ChestsSystem } from "./systems/Chests";
import { GameUI } from "./ui/GameUI";
import { Player } from "./entities/Player";
import { EnemiesSystem } from "./systems/Enemies";
import { FiltersSystem, GameFiltersSystem } from "./systems/filters/FiltersSystem";


export enum GameStates {
    Menu, Playing, Exited
}

export default class Game {
    app = new Application();
    session: GameSession;
    world = new World(this);
    background = new Background(this);
    arena = new Arena(this);
    player = new Player(this);
    characters: Character[] = [];
    physics = new PhysicsSystem(this);
    chests = new ChestsSystem(this);
    enemies = new EnemiesSystem(this);
    filters = new GameFiltersSystem(this);
    inputManager = new InputManager(this);
    onInitialized = new Subject();
    onStarted = new Subject();
    onEnded = new Subject();
    container: HTMLElement = null;

    async init(containerId: string) {
        console.group('Game.init', this);
        this.container = document.getElementById(containerId);
        await this.app.init({ backgroundColor: 0x000000, backgroundAlpha: 1 });
        this.container.appendChild(this.app.canvas);
        await this.world.init(2000, 2000);
        await this.background.init(0, 0, this.world.size.x*2, this.world.size.y*2);
        this.world.viewport.addChild(this.background);
        window.addEventListener('resize', () => this._resizeAndCenterStage());
        this._resizeAndCenterStage();
        await this.arena.init(0, 0, this.world.size.x, this.world.size.y);
        this.world.viewport.addChild(this.arena);
        this.registerCharacter(this.player);
        this.world.viewport.addChild(this.player);
        this.world.viewport.follow(this.player, {
            acceleration: 1,
            speed: 10 * 0.016,
            radius: 100
        });
        await this.chests.init();
        await this.physics.init();
        await this.enemies.init();
        this.filters.target = this.world.viewport;
        await this.filters.init();
        await this.player.init(this.world.size.x/2, this.world.size.y/2, 100, 100);
        this.player.onDeath.subscribe(() => {
            this.world.viewport.follow(this.world.viewport)
            this.endGame();
        })
        this.onInitialized.next(null);
        console.groupEnd();
    }

    async destroy() {
        console.group('Game.destroy');
        await this.chests.destroy();
        await this.physics.destroy();
        await this.enemies.destroy();
        await this.filters.destroy();
        await this.world.destroy();
        await this.background.destroy();
        await this.arena.destroy();
        await this.player.destroy();
        this.container.removeChild(this.app.canvas);
        this.app.destroy();
        console.groupEnd();
    }

    async startGame(session: GameSession) {
        this.onStarted.next(null);
        // SoundManager.Instance.play('gameStart');
        // SoundManager.Instance.playMusic('gameMusic');
        this.session = session;
        this.inputManager.setEnabled(true);
    }

    async endGame() {
        this.onEnded.next(null);
        // SoundManager.Instance.play('endGame');
        this.inputManager.setEnabled(false);
    }

    registerCharacter(char: Character) {
        this.characters.push(char);
        char.on('destroyed', (char) => this.unregisterCharacter(char as Character))
    }
    
    unregisterCharacter(char: Character) {
        this.characters.splice(this.characters.indexOf(char), 1);
    }

    _resizeAndCenterStage() {
        this.app.renderer.resize(this.container.clientWidth, this.container.clientHeight);
        this.world.setViewSize(this.container.clientWidth, this.container.clientHeight);
    }
}
