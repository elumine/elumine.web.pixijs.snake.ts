import { Container, Graphics, PointData } from "pixi.js";
import { Wall } from "./Wall";

export default class Field extends Container {
    bgColor1 = 'rgb(22,34,44)';
    bgColor2 = 'rgb(24,36,48)';
    gridColor = 'rgb(50,50,50)';
    wallColor = 'rgb(169,106,14)';
    grid = new Container();
    points: PointData[] = [];
    bounds: PointData;
    dynamicWalls = new Array<Wall>();

    constructor(
        public size: PointData = { x: 20, y: 20 },
        public tileResolution = 30) {
            super();
            this.bounds = { x: size.x * tileResolution, y: size.y * tileResolution };
            for (let i = 0; i <= size.x; i++) {
                for (let j = 0; j <= size.y; j++) {
                    const evenI = i%2 == 0;
                    const evenJ = j%2 == 0;
                    this.addChild(new Graphics().rect(
                        i * tileResolution, j * tileResolution,
                        tileResolution, tileResolution
                    ).fill(
                        ( evenJ ? evenI : !evenI ) ? this.bgColor1 : this.bgColor2
                    ));
                }
            }
            for (let i = 0; i <= size.x; i++) {
                this.grid.addChild(new Graphics().rect(0, i*tileResolution, this.bounds.x, 1).fill(this.gridColor));
                if (i < size.x - 1) {
                    this.points.push({ x: i, y: 0 });
                }
            }
            for (let i = 0; i <= size.y; i++) {
                this.grid.addChild(new Graphics().rect(i*tileResolution, 0, 1, this.bounds.y).fill(this.gridColor));
                if (i < size.y - 1) {
                    this.points.push({ x: 0, y: i });
                }
            }
            this.grid.position.set(this.tileResolution, this.tileResolution);
            this.addChild(this.grid);
            //bounds walls
            this.addChild(new Wall(this.tileResolution, {x: 0, y: 0}, {x: this.size.x+2, y:1}, this.wallColor));
            this.addChild(new Wall(this.tileResolution, {x: 0, y: this.size.y+1}, {x: this.size.x+2, y:1}, this.wallColor));
            this.addChild(new Wall(this.tileResolution, {x: 0, y: 1}, {x: 1, y:this.size.y}, this.wallColor));
            this.addChild(new Wall(this.tileResolution, {x: this.size.x+1, y: 1}, {x: 1, y:this.size.y}, this.wallColor));
        }
    
    spawnDynamicWall(startCoords: PointData, size: PointData) {
        console.log('wall', startCoords);
        const w = new Wall(this.tileResolution, startCoords, size, this.wallColor);
        this.dynamicWalls.push(w);
        this.grid.addChild(w);
    }
    clearDynamicWalls() {
        this.dynamicWalls.forEach(w =>  w.destroy() );
        this.dynamicWalls = [];
    }
}