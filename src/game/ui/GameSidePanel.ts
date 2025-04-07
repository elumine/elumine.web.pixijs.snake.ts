import { Container, Graphics, Text } from "pixi.js";
import Game, { GameStates } from "../Game";
import SquareButton from "./SquareButton";

export default class GameSidePanel extends Container {

    constructor(public game: Game) {
        super();
        const menuButton = new SquareButton('Menu', 100, 50);
        menuButton.position.set(75, 575);
        menuButton.onclick = (e) => this.game.setGameState(GameStates.Menu);
        this.addChild(menuButton);
    }
}