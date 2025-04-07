import { Container, Graphics, Text } from "pixi.js";

export default class LoadingScreen extends Container {

    constructor() {
        super();
        const bg = new Graphics().rect(0, 0, 910, 660).fill('rgb(64,64,64)');
        this.addChild(bg);
        const headerText = new Text({
            text: 'Loading',
            position: { x: 300, y: 300 },
            style: {
                fill: 'rgb(128,128,128)',
                fontSize: 48,
            },
        });
        this.addChild(headerText);
    }
}