import { Container, Graphics, Text } from "pixi.js";
import SoundManager from "../SoundManager";

export default class SquareButton extends Container {
    buttonImage: Graphics;
    text: Text;

    constructor(
        displayText: string,
        sizeX = 75, sizeY = 50) {
            super();
            this.eventMode = 'static';
            this.buttonImage = new Graphics().rect(0, 0, sizeX, sizeY).fill(`rgb(36, 84, 80)`);
            this.text = new Text({
                text: displayText,
                position: { x: 15, y: 10 },
                style: {
                    align: 'center',
                    fill: 'rgb(255, 255, 255)',
                    fontSize: 24,
                },
            });
            this.addChild(this.buttonImage, this.text);
            this.addListener('click', () => SoundManager.Instance.play('mouseClick'));
            this.addListener('mouseover', () => {
                this.scale = 1.1;
                SoundManager.Instance.play('mouseHover');
            });
            this.addListener('mouseout', () => {
                this.scale = 1;
            });
        }
}