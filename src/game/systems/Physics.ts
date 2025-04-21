import Matter, { Engine, Render, Runner, Bodies, Composite, Body } from 'matter-js';
import Game from '../Game';
import { GameSystem } from './GameSystem';

export class PhysicsSystem extends GameSystem {
    engine = Engine.create({
        gravity: {
            y: 0
        }
    });
    render: Render;
    runner: Runner;

    override async init() {
        await super.init();
        this.runner = Runner.create();
        Runner.run(this.runner, this.engine);
        // this.render = Render.create({
        //     canvas: document.querySelector('#physics-canvas'),
        //     engine: this.engine,
        //     options: {
        //         background: 'transparent',
        //         showAxes: true,
        //         showBounds: true,
        //         showPositions: true,
        //         showStats: true,
        //         showVelocity: true,
        //         showCollisions: true,
        //         hasBounds: true
        //     }
        // });
        // this.game.app.ticker.add(() => {
        //     this.render.options.width = this.game.app.renderer.canvas.width;
        //     this.render.options.height = this.game.app.renderer.canvas.height;
        //     this.render.canvas.width = this.game.app.renderer.canvas.width;
        //     this.render.canvas.height = this.game.app.renderer.canvas.height;
        //     this.render.bounds.min.x = this.game.world.viewport.left;
        //     this.render.bounds.min.y = this.game.world.viewport.top;
        //     this.render.bounds.max.x = this.game.world.viewport.right;
        //     this.render.bounds.max.y = this.game.world.viewport.bottom;
        //     Render.setPixelRatio(this.render, this.game.app.renderer.canvas.width / this.game.app.renderer.canvas.height); // added this
        // });
        // Render.run(this.render);
    }

    override async destroy() {
        // Render.stop(this.render);
        Runner.stop(this.runner);
        await super.destroy();
    }

    registerBodies(list: Body[]) {
        Composite.add(this.engine.world, list);
    }

    unRegisterBodies(list: Body[]) {
        Composite.remove(this.engine.world, list);
    }
}