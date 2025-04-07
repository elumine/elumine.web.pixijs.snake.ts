import Game from "./Game";
import { SnakeDirection } from "./SnakeDirection";

export default class InputManager {
    constructor(public game: Game) {
        window.addEventListener('keydown', (e) => this.onKeyDown(e.key));
    }
    
    onKeyDown(key: string) {
        switch(key) {
            case 'ArrowUp': this.game.snake.setDirection(SnakeDirection.Up); break;
            case 'ArrowDown': this.game.snake.setDirection(SnakeDirection.Down); break;
            case 'ArrowLeft': this.game.snake.setDirection(SnakeDirection.Left); break;
            case 'ArrowRight': this.game.snake.setDirection(SnakeDirection.Right); break;
        }
    }
}