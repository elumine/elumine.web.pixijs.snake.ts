import { makeAutoObservable } from "mobx";
import Game from "../game/Game";
import GameConfig from "./game/GameConfig";
import { Subscription } from "rxjs";
import { InputActions } from "../game/InputManager";

export class GameStore {
    gameInstance: Game;
    currentSession: GameSession;

    constructor() {
        makeAutoObservable(this);
    }

    async createGameInstance() {
        if (this.gameInstance) await this.gameInstance.destroy();
        this.gameInstance = new Game();
    }

    async destroyGameInstance() {
        if (this.gameInstance) await this.gameInstance.destroy();
        this.gameInstance = null;
    }
    async createGameSession() {
        this.currentSession = new GameSession(this.gameInstance);
        this.currentSession.start();
    }
    async finishGameSession() {
        this.currentSession.finish();
    }
}

export class GameSession {
    gameConfig = new GameConfig();
    analytics: GameSessionAnalytics;

    constructor(public game: Game) {
        console.log(this);
        this.analytics = new GameSessionAnalytics(game);
    }

    start() {
        this.analytics.start();
    }
    finish() {
        this.analytics.finish();
    }
}

interface GameSessionAnalyticsRecord { time: number }
interface GameSessionAnalyticsChestSpawnRecord extends GameSessionAnalyticsRecord {}
interface GameSessionAnalyticsChestDestroyRecord extends GameSessionAnalyticsRecord {}
interface GameSessionAnalyticsEnemySpawnRecord extends GameSessionAnalyticsRecord {}
interface GameSessionAnalyticsEnemyDestroyRecord extends GameSessionAnalyticsRecord {}
interface GameSessionAnalyticsPlayerDamageRecord extends GameSessionAnalyticsRecord { damage: number }
interface GameSessionAnalyticsPlayerFireballRecord extends GameSessionAnalyticsRecord {}
interface GameSessionAnalyticsPlayerGoldPickRecord extends GameSessionAnalyticsRecord {}
interface GameSessionAnalyticsPlayerManaPotionPickRecord extends GameSessionAnalyticsRecord {}
interface GameSessionAnalyticsPlayerHealthPotionPickRecord extends GameSessionAnalyticsRecord {}
export class GameSessionAnalytics {
    subscribtions: Subscription[] = [];
    startTime = 0;
    endTime = 0;
    userInputs = {
        total: 0,
        up: 0,
        down: 0,
        left: 0,
        right: 0,
        fireball: 0
    };
    chestSpawnedRecords: GameSessionAnalyticsChestSpawnRecord[] = [];
    chestDestroyedRecords: GameSessionAnalyticsChestDestroyRecord[] = [];
    enemySpawnedRecords: GameSessionAnalyticsEnemySpawnRecord[] = [];
    enemyDestroyedRecords: GameSessionAnalyticsEnemyDestroyRecord[] = [];
    playerDamageRecords: GameSessionAnalyticsPlayerDamageRecord[] = [];
    playerFireballRecords: GameSessionAnalyticsPlayerFireballRecord[] = [];
    playerGoldPickerRecords: GameSessionAnalyticsPlayerGoldPickRecord[] = [];
    playerManaPotionsPickerRecords: GameSessionAnalyticsPlayerManaPotionPickRecord[] = [];
    playerHealthPotionsPickerRecords: GameSessionAnalyticsPlayerHealthPotionPickRecord[] = [];

    computedPlayDuration = 0;
    computedSecondsToChestSpawned = new Map<number, number>();
    computedSecondsToChestDestroyed = new Map<number, number>();
    computedSecondsToEnemySpawned = new Map<number, number>();
    computedSecondsToEnemyDestroyed = new Map<number, number>();
    computedSecondsToPlayerDamage = new Map<number, number>();
    computedSecondsToPlayerFireball = new Map<number, number>();
    computedSecondsToPlayerGoldPicked = new Map<number, number>();
    computedSecondsToPlayerManaPotionsPicked = new Map<number, number>();
    computedSecondsToPlayerHealthPotionsPicked = new Map<number, number>();
    computedUserInputsNormalized = {
        up: 0,
        down: 0,
        left: 0,
        right: 0,
        fireball: 0
    };

    constructor(public game: Game) {
        console.log(this);
    }

    start() {
        this.startTime = performance.now();
        this.addSubscribtion(this.game.chests.onChestSpawned.subscribe(() => this.addRecord(this.chestSpawnedRecords)));
        this.addSubscribtion(this.game.chests.onChestDestroyed.subscribe(() => this.addRecord(this.chestDestroyedRecords)));
        this.addSubscribtion(this.game.enemies.onEnemySpawned.subscribe(() => this.addRecord(this.enemySpawnedRecords)));
        this.addSubscribtion(this.game.enemies.onEnemyDestroyed.subscribe(() => this.addRecord(this.enemyDestroyedRecords)));
        this.addSubscribtion(this.game.player.onDamageReceived.subscribe(() => this.addRecord(this.playerDamageRecords)));
        this.addSubscribtion(this.game.player.onFireballCast.subscribe(() => this.addRecord(this.playerFireballRecords)));
        this.addSubscribtion(this.game.player.onGoldPick.subscribe(() => this.addRecord(this.playerGoldPickerRecords)));
        this.addSubscribtion(this.game.player.onManaPotionPick.subscribe(() => this.addRecord(this.playerManaPotionsPickerRecords)));
        this.addSubscribtion(this.game.player.onHealthPotionPick.subscribe(() => this.addRecord(this.playerHealthPotionsPickerRecords)));
        this.addSubscribtion(this.game.inputManager.onInput.subscribe((i) => this.registerInput(i)));
    }

    finish() {
        this.subscribtions.forEach(s => s.unsubscribe());
        this.endTime = performance.now();
        this.computedPlayDuration = this.endTime - this.startTime;
        this.computedSecondsToChestSpawned = this.buildRecorsListToMap(this.chestSpawnedRecords);
        this.computedSecondsToChestDestroyed = this.buildRecorsListToMap(this.chestDestroyedRecords);
        this.computedSecondsToEnemySpawned = this.buildRecorsListToMap(this.enemySpawnedRecords);
        this.computedSecondsToEnemyDestroyed = this.buildRecorsListToMap(this.enemyDestroyedRecords);
        this.computedSecondsToPlayerDamage = this.buildRecorsListToMap(this.playerDamageRecords);
        this.computedSecondsToPlayerFireball = this.buildRecorsListToMap(this.playerFireballRecords);
        this.computedSecondsToPlayerGoldPicked = this.buildRecorsListToMap(this.playerGoldPickerRecords);
        this.computedSecondsToPlayerManaPotionsPicked = this.buildRecorsListToMap(this.playerManaPotionsPickerRecords);
        this.computedSecondsToPlayerHealthPotionsPicked = this.buildRecorsListToMap(this.playerHealthPotionsPickerRecords);
        this.computedUserInputsNormalized = {
            up: this.userInputs.up / this.userInputs.total,
            down: this.userInputs.down / this.userInputs.total,
            left: this.userInputs.left / this.userInputs.total,
            right: this.userInputs.right / this.userInputs.total,
            fireball: this.userInputs.fireball / this.userInputs.total
        };
    }

    addSubscribtion(s) {
        this.subscribtions.push(s);
    }

    registerInput(input: InputActions) {
        this.userInputs.total += 1;
        switch (input) {
            case InputActions.Up: this.userInputs.up += 1; break;
            case InputActions.Down: this.userInputs.down += 1; break;
            case InputActions.Left: this.userInputs.left += 1; break;
            case InputActions.Right: this.userInputs.right += 1; break;
            case InputActions.Fireball: this.userInputs.fireball += 1; break;
        }
    }


    addRecord(array: GameSessionAnalyticsRecord[]) {
        array.push({
            time: performance.now()
        });
    }

    buildRecorsListToMap(array: GameSessionAnalyticsRecord[]) {
        const output = new Map<number, number>();
        const recorsInSeconds = array.map(record => ({
            time: Math.floor((record.time - this.startTime)/1000)
        }));
        if (recorsInSeconds.length) {
            const lastSecond = recorsInSeconds[recorsInSeconds.length-1].time;
            for (let i = 0; i <= lastSecond; i++) {
                output.set(i, 0);
            }
            recorsInSeconds.forEach(score => {
                output.set(score.time, output.get(score.time) + 1);
            });
        }
        return output;
    }
}