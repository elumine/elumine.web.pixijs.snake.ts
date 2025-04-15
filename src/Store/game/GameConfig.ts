export enum GameProperty {
    GodMode, WallsMode, PortalMode, SpeedMode
}

export default class GameConfig {
    properties = new Set<GameProperty>();

    setProperties(props: GameProperty[]) {
        this.properties = new Set(props);
    }
    setProperty(prop: GameProperty, enabled: boolean) {
        enabled ? this.properties.add(prop) : this.properties.delete(prop);
    }
    hasProperty(prop: GameProperty) {
        return this.properties.has(prop);
    }
}
