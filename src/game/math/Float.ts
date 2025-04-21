export class Float {
    static Lerp(a: number, b: number, alpha: number) {
        return a + (b-a)*alpha;
    }
}