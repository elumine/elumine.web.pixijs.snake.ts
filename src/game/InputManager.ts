import { Subject } from "rxjs";
import Game from "./Game";
import { SnakeDirection } from "./SnakeDirection";

export default class InputManager {
    onInput = new Subject<SnakeDirection>();

    constructor(public game: Game) {}

    setEnabled(value) {
        if (value) {
            window.addEventListener('keydown', this.onKeyDown);
            window.addEventListener('mousemove', this.onClick);
        } else {
            window.removeEventListener('keydown', this.onKeyDown);
            window.removeEventListener('mousemove', this.onClick);
        }
    }

    onClick = (event: MouseEvent) => {
        const direction = (() => {
            const w = window.innerWidth, h = window.innerHeight;
            const x = (event.x - w/2) / w, y = (event.y - h/2) / h;
            var angle = Math.atan2(x, y);
            var degrees = 180*angle/Math.PI;
            // console.log(
            //     'event', event.x, event.y,
            //     'size', w, h,
            //     'x', x, 'y', y, 'a', angle, 'd', degrees);
            if (degrees < 135 && degrees > 45) {
                return SnakeDirection.Right;
            } else if (degrees > -135 && degrees < -45) {
                return SnakeDirection.Left;
            } else if (y < 0) {
                return SnakeDirection.Up;
            } else {
                return SnakeDirection.Down;
            }
        })();
        // console.log(direction);
        this.game.snake.setDirection(direction);
        this.onInput.next(direction);
    }
    
    onKeyDown = (event) => {
        const direction = (() => {
            switch(event.key) {
                case 'ArrowUp': return SnakeDirection.Up;
                case 'ArrowDown': return SnakeDirection.Down;
                case 'ArrowLeft': return SnakeDirection.Left;
                case 'ArrowRight': return SnakeDirection.Right;
            }
        })();
        this.game.snake.setDirection(direction);
        this.onInput.next(direction);
    }
}