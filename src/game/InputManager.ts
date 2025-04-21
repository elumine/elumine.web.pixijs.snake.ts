import { Subject } from "rxjs";
import Game from "./Game";
import { Point } from "pixi.js";
import { Vector2 } from "./math/Vector2";

export enum InputActions {
    Up, Down, Left, Right, Fireball
}

export default class InputManager {
    onInput = new Subject<InputActions>();
    movementInputOn = false;
    movementInputDirection: InputActions;

    constructor(public game: Game) {}

    setEnabled(value) {
        if (value) {
            this.movementInputOn = true;
            window.addEventListener('mouseup', this.onMouseUp);
            window.addEventListener('mousedown', this.onMouseDown);
            window.addEventListener('mousemove', this.onMouseMove);
            this.game.player.once('destroyed', () => this.setEnabled(false));
        } else {
            this.movementInputOn = false;
            window.removeEventListener('mouseup', this.onMouseUp);
            window.removeEventListener('mousedown', this.onMouseDown);
            window.removeEventListener('mousemove', this.onMouseMove);
        }
    }

    onMouseMove = (event: MouseEvent) => {
        if (this.movementInputOn) {
            const x = event.x, y = event.y;
            const playerScreenSpace = this.game.world.viewport.toScreen(this.game.player.position.x, this.game.player.position.y);
            const playerScreenSpaceRelative = new Point(x - playerScreenSpace.x, y - playerScreenSpace.y);
            const playerScreenSpaceRelativeLength = Vector2.Length(playerScreenSpaceRelative);
            const movemeInputScale = playerScreenSpaceRelativeLength / 1000;
            const playerScreenSpaceRelativeNormalized = Vector2.Normalize(playerScreenSpaceRelative);
            this.game.player.setMovementInput(playerScreenSpaceRelativeNormalized.x, playerScreenSpaceRelativeNormalized.y, movemeInputScale);
            const mouseInputDirection = ((): InputActions => {
                const x = playerScreenSpaceRelativeNormalized.x, y = playerScreenSpaceRelativeNormalized.y;
                if (x < 0.33) return InputActions.Left;
                if (x > 0.66) return InputActions.Right;
                if (y > 0.5) return InputActions.Up;
                return InputActions.Down;
            })();
            if (mouseInputDirection !== this.movementInputDirection) {
                this.movementInputDirection = mouseInputDirection;
                this.onInput.next(this.movementInputDirection);
            }
        }
    }
    
    onMouseDown = (event: MouseEvent) => {
        const lmb = event.which === 1;
        if (lmb) {
            this.game.player.castFireball();
            this.onInput.next(InputActions.Fireball);
        }
        event.preventDefault();
    }
    
    onMouseUp = (event: MouseEvent) => {
        event.preventDefault();
    }
}