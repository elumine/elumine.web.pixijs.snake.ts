import { GameSession } from "./GameStore";

export class GameAnalytics {
    sessions = new Array<GameSession>();

    addSession(session: GameSession) {
        this.sessions.push(session);
    }
}