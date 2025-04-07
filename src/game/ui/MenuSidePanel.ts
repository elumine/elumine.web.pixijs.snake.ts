import { Container, Graphics } from "pixi.js";
import Game, { GameStates } from "../Game";
import RadioButton from "./RadioButton";
import SquareButton from "./SquareButton";
import { GameModes } from "../GameConfig";

export default class MenuSidePanel extends Container {
    radioButtons = {
        [GameModes.Classic]: new RadioButton('Classic', { x: 25, y: 300 }, true),
        [GameModes.NoDie]: new RadioButton('No Die', { x: 25, y: 350 }),
        [GameModes.Walls]: new RadioButton('Walls', { x: 25, y: 400 }),
        [GameModes.Portal]: new RadioButton('Portal', { x: 25, y: 450 }),
        [GameModes.Speed]: new RadioButton('Speed', { x: 25, y: 500 })
    };

    constructor(public game: Game) {
        super();
        const modeSection = new Graphics().rect(0, 275, 250, 275).fill(`rgb(25, 87, 86)`);
        this.addChild(modeSection);
        Object.keys(this.radioButtons).forEach((key: any) => {
            const button = this.radioButtons[key] as RadioButton;
            this.addChild(button);
            button.onclick = (e) => {
                if (key == GameModes.Classic) {
                    this.getRadioButtonsList().forEach(b => b.setSelected(button === b));
                } else {
                    this.radioButtons[GameModes.Classic].setSelected(false);
                    if (button.selected) {
                        const selectedCount = this.getRadioButtonsList().filter(b => b.selected).length;
                        if (selectedCount > 1) {
                            button.setSelected(!button.selected);
                        }
                    } else {
                        button.setSelected(true);
                    }
                }
                this.game.config.setGameModeEnabled(key, button.selected);
            }
        });
        const playButton = new SquareButton('Play');
        playButton.position.set(25, 575);    
        playButton.onclick = (e) => this.game.setGameState(GameStates.Playing);
        const exitButton = new SquareButton('Exit');
        exitButton.position.set(125, 575);    
        exitButton.onclick = (e) => this.game.setGameState(GameStates.Exited);
        this.addChild(playButton, exitButton);
    }

    getRadioButtonsList() { return Object.values(this.radioButtons); }
}