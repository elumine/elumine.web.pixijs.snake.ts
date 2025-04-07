export enum SnakeDirection {
    Up, Down, Left, Right
}
export function snakeDirectionToVector(direction: SnakeDirection) {
    switch(direction) {
        case SnakeDirection.Left:  return { x: -1, y: 0 };
        case SnakeDirection.Right: return { x: 1, y: 0 };
        case SnakeDirection.Up:    return { x: 0, y: -1 };
        case SnakeDirection.Down:  return { x: 0, y: 1 };
    }
}