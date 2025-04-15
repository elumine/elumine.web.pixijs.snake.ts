import { makeAutoObservable } from "mobx";
import Game from "../game/Game";
import GameConfig from "./game/GameConfig";
import { SnakeDirection } from "../game/SnakeDirection";

export class GameStore {
    gameInstance: Game;
    currentSession = new GameSession();

    constructor() {
        makeAutoObservable(this);
    }

    async createGameInstance(containerId: string) {
        this.gameInstance = new Game(containerId);
    }
    async startGameSession() {
        this.currentSession = new GameSession();
        this.currentSession.start();
    }
    async finishGameSession() {
        this.currentSession.finish();
    }
}

export class GamingHistory {
    sessionsList = new Array<GameSession>();
    longestPlayDuration = 0;
    bestScore = 0;
}

export class GameSession {
    gameConfig = new GameConfig();
    analytics = new GameSessionAnalytics();

    constructor() {
        console.log(this);
    }

    start() {
        this.analytics.startTime = performance.now();
    }
    finish() {
        this.analytics.endTime = performance.now();
        this.analytics.playDuration = this.analytics.endTime - this.analytics.startTime;
        this.analytics.build();
    }
}

interface GameSessionAnalyticsScoreRecord {
    time: number;
}
export class GameSessionAnalytics {
    scoreRecords: GameSessionAnalyticsScoreRecord[] = [];
    startTime = 0;
    endTime = 0;
    playDuration = 0;
    userInputs = {
        total: 0,
        up: 0,
        down: 0,
        left: 0,
        right: 0
    };

    secondsToPointsMap = new Map<number, number>();
    userInputsNormalized = {
        up: 0,
        down: 0,
        left: 0,
        right: 0
    };

    constructor() {
        console.log(this);
    }

    addScore() {
        this.scoreRecords.push({
            time: performance.now()
        });
    }
    registerInput(direction: SnakeDirection) {
        this.userInputs.total += 1;
        switch (direction) {
            case SnakeDirection.Up: this.userInputs.up += 1; break;
            case SnakeDirection.Down: this.userInputs.down += 1; break;
            case SnakeDirection.Left: this.userInputs.left += 1; break;
            case SnakeDirection.Right: this.userInputs.right += 1; break;
        }
    }

    build() {
        const scoreRecordsInSeconds = this.scoreRecords.map(score => ({
            time: Math.floor((score.time - this.startTime)/1000)
        }));
        const lastSecond = scoreRecordsInSeconds[scoreRecordsInSeconds.length-1].time;
        for (let i = 0; i <= lastSecond; i++) {
            this.secondsToPointsMap.set(i, 0);
        }
        scoreRecordsInSeconds.forEach(score => {
            this.secondsToPointsMap.set(score.time, this.secondsToPointsMap.get(score.time) + 1);
        });

    }
}