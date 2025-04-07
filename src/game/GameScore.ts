export default class GameScore {
    currentScore = 0;
    bestScore = 0;

    constructor() {
        this._load();
    }

    addScore(delta = 1) {
        this.currentScore += delta;
        this.bestScore = Math.max(this.currentScore, this.bestScore);
        this._save();
    }

    resetScore() {
        this.currentScore = 0;
    }

    _load() {
        try {
            this.bestScore = Number(atob(localStorage.getItem('GameScore.bestScore'))) || 0;
        } catch (error) {
            console.warn('GameScore.load()', error);
        }
    }

    _save() {
        localStorage.setItem('GameScore.bestScore', btoa(this.bestScore.toString()));
    }
}