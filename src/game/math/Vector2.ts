import { PointData } from "pixi.js";

export class Vector2 {
    static Length(point: PointData): number {
        return Math.sqrt(Math.pow(point.x, 2) + Math.pow(point.y, 2));
    }
    static Normalize(point: PointData): PointData {
        const out: PointData = { x: point.x, y: point.y };
        const l = Vector2.Length(point);
        out.x /= l;
        out.y /= l;
        return out;
    }
}