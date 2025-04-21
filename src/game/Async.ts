export class AsyncCommon {
    static async Delay(duration: number) {
        return new Promise((resolve) => setTimeout(resolve, duration));
    }
}