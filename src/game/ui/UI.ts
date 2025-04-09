import { Container, Graphics, Text } from "pixi.js";
import MenuSidePanel from "./MenuSidePanel";
import Game from "../Game";
import GameSidePanel from "./GameSidePanel";
import LoadingScreen from "./LoadingScreen";

export default class UI extends Container {
    loadingScreen = new LoadingScreen();
    menuPanel: MenuSidePanel;
    gamePanel: GameSidePanel;
    bestValueText: Text;
    scoreValueText: Text;

    constructor(public game: Game) {
        super();
        this.zIndex = 1;
        const menuWrapper = new Container();
        menuWrapper.position.set(660, 0);
        this.addChild(menuWrapper, this.loadingScreen);
        const bg = new Graphics().rect(0, 0, 250, 660).fill(`rgb(32,32,32)`);
        const headerText = new Text({
            text: 'Snake Game',
            position: { x: 25, y: 35 },
            style: {
                fill: 'rgb(192,192,192)',
                fontSize: 36,
            },
        });
        const bestSection = new Graphics().rect(0, 130, 250, 40).fill(`rgb(48,48,48)`);
        const bestTitleText = new Text({
            text: 'Best:',
            position: { x: 25, y: 135 },
            style: {
                fill: 'rgb(255, 255, 255)',
                fontSize: 24,
            },
        });
        this.bestValueText = new Text({
            text: '0',
            position: { x: 150, y: 135 },
            style: {
                fill: 'rgb(255, 255, 255)',
                fontSize: 24,
            },
        });
        const scoreSection = new Graphics().rect(0, 200, 250, 40).fill(`rgb(48,48,48)`);
        const scoreTitleText = new Text({
            text: 'Score:',
            position: { x: 25, y: 205 },
            style: {
                fill: 'rgb(255, 255, 255)',
                fontSize: 24,
            },
        });
        this.scoreValueText = new Text({
            text: '0',
            position: { x: 150, y: 205 },
            style: {
                fill: 'rgb(255, 255, 255)',
                fontSize: 24,
            },
        });
        menuWrapper.addChild(
            bg, headerText,
            bestSection, bestTitleText, this.bestValueText,
            scoreSection, scoreTitleText, this.scoreValueText);

        this.menuPanel = new MenuSidePanel(this.game);
        menuWrapper.addChild(this.menuPanel);
        this.gamePanel = new GameSidePanel(this.game);
        menuWrapper.addChild(this.gamePanel);
    }

    setScore(current: number, best: number) {
        this.scoreValueText.text = current;
        this.bestValueText.text = best;
    }
    showMenuScreen() {
        this.menuPanel.visible = true;
        this.gamePanel.visible = false;
    }
    showPlayScreen() {
        this.menuPanel.visible = false;
        this.gamePanel.visible = true;
    }
}