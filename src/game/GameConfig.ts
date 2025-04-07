export enum GameModes {
    Classic, NoDie, Walls, Portal, Speed
}
export enum GameProperty {
    GodMode, WallsMode, PortalMode, SpeedMode
}

export default class GameConfig {
    gameSpeed = 100; // tick interval
    properties = new Set<GameProperty>();

    setGameModeEnabled(mode: GameModes, enabled: boolean) {
        switch (Number(mode)) {
            case GameModes.Classic: this.setProperties([ ]); break;
            case GameModes.NoDie:   this.setProperty(GameProperty.GodMode,    enabled); break;
            case GameModes.Walls:   this.setProperty(GameProperty.WallsMode,  enabled); break;
            case GameModes.Portal:  this.setProperty(GameProperty.PortalMode, enabled); break;
            case GameModes.Speed:   this.setProperty(GameProperty.SpeedMode,  enabled); break;
        }
    }
    setProperties(props: GameProperty[]) {
        this.properties = new Set(props);
    }
    setProperty(prop: GameProperty, enabled: boolean) {
        enabled ? this.properties.add(prop) : this.properties.delete(prop);
    }
    hasProperty(prop: GameProperty) {
        return this.properties.has(prop);
    }

    incrementSpeed() {
        this.gameSpeed *= 0.9;
        console.log(this.gameSpeed);
    }
}
