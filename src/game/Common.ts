import { Container, PointData } from "pixi.js";

export function getContainersOverlap(a: Container, b: Container) {
    return a.position.equals(b.position);
}
export function getPointsOverlap(a: PointData, b: PointData) {
    return (a.x === b.x && a.y === b.y)
}
export function hitTestAABB(object1, object2) {
    const bounds1 = object1.getBounds();
    const bounds2 = object2.getBounds();
    return (
        bounds1.x < bounds2.x + bounds2.width
        && bounds1.x + bounds1.width > bounds2.x
        && bounds1.y < bounds2.y + bounds2.height
        && bounds1.y + bounds1.height > bounds2.y
    );
}