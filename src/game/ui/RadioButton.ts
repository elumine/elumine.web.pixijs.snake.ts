import { Container, Graphics, PointData, Text } from "pixi.js";
import SoundManager from "../SoundManager";

export default class RadioButton extends Container {
    buttonImage: Graphics;
    buttonImageChecked: Graphics;
    checkedText: Text;
    text: Text;

    constructor(
        displayText: string,
        position: PointData,
        public selected = false) {
            super();
            this.eventMode = 'static';
            this.buttonImage = new Graphics().rect(0, 0, 30, 30).fill(`rgb(192, 192, 192)`);
            this.buttonImageChecked = new Graphics().rect(0, 0, 30, 30).fill(`rgb(32,32,32)`);;
            this.checkedText = new Text({
                text: '✓',
                position: { x: 6, y: 3 },
                style: {
                    fill: 'rgb(255, 255, 255)',
                    fontSize: 24,
                },
            });
            this.text = new Text({
                text: displayText,
                position: { x: 50, y: 0 },
                style: {
                    fill: 'rgb(255, 255, 255)',
                    fontSize: 24,
                },
            });
            this.position.set(position.x, position.y);
            this.addChild(this.buttonImage, this.buttonImageChecked, this.checkedText, this.text);
            this.setSelected(this.selected);
            this.addListener('click', () => SoundManager.Instance.play('mouseClick'));
            this.addListener('mouseover', () => {
                this.scale = 1.1;
                SoundManager.Instance.play('mouseHover');
            });
            this.addListener('mouseout', () => {
                this.scale = 1;
            });
        }

    setSelected(value: boolean) {
        this.selected = value;
        if (this.selected) {
            this.checkedText.visible = this.buttonImageChecked.visible =  true;
        } else {
            this.checkedText.visible = this.buttonImageChecked.visible =  false;
        }
    }
}