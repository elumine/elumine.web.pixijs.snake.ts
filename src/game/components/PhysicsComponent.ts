import { Ticker } from "pixi.js";
import { Component } from "./Component";
import { Body } from "matter-js";

export class PhysicsComponent extends Component {
    body: Body;

    setBody(body: Body) {
        this.body = body;
    }

    tick = (ticker: Ticker) => {
        if (this.body) {
            this.owner.position.x = this.body.position.x;
            this.owner.position.y = this.body.position.y;
        }
    }
}
