import { AnimatedSprite, Assets, Container, PointData, Sprite, Texture } from "pixi.js";

export class AssetsCommon {

    static async LoadTextures(count: number, nameGenerator: (index: number) => string) {
        const textures: Texture[] = [];
        await Promise.all(
            new Array(count).fill(0).map((v, i) => Assets.load(nameGenerator(i)))
                .map(v => {
                    v.then(texture => { textures.push(texture) });
                    return v;
                })
        );
        return textures;
    }
}