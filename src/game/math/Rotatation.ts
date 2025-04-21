import { PointData } from "pixi.js";

export class Rotation {
    static AngleFromDirectionRadians(direction: PointData): number {
        return Math.atan2(direction.y, direction.x);   //radians
    }
    static AngleFromDirectionDegrees(direction: PointData): number {
        var angle = Math.atan2(direction.y, direction.x);   //radians
        var degrees = 180 * angle / Math.PI;  //degrees
        return (360 + Math.round(degrees)) % 360;
    }
}