import { Sound } from "@pixi/sound";

export interface SoundsMap {
    foodConsume: Sound;
    gameMusic: Sound;
    gameOver: Sound;
    gameStart: Sound;
    menuMusic: Sound;
    menuSelect: Sound;
    mouseClick: Sound;
    mouseHover: Sound;
}

export default class SoundManager {
    static readonly Instance = new SoundManager();
    sounds: SoundsMap = {} as SoundsMap;    // i'm tired :)
    soundsLoadingConfig = {
        foodConsume: 'food-consume',
        gameMusic: 'game-music',
        gameOver: 'game-over',
        gameStart: 'game-start',
        menuMusic: 'menu-music',
        menuSelect: 'menu-select',
        mouseClick: 'mouse-click',
        mouseHover: 'mouse-hover'
    };

    constructor() {
        //
    }

    async load() {
        await Promise.all(
            Object.keys(this.soundsLoadingConfig).map((key) => this._loadSfx(key, this.soundsLoadingConfig[key]))
        )
    }

    async _loadSfx(name: string, fileName: string) {
        return new Promise<Sound>((resolve) => {
            Sound.from({
                url: `sfx/${fileName}.mp3`,
                preload: true,
                loaded: (error, sound) => {
                    resolve(sound);
                    this.sounds[name] = sound;
                }
            });
        });
    }

    playMusic(name: 'gameMusic' | 'menuMusic') {
        this.sounds.gameMusic.stop();
        this.sounds.menuMusic.stop();
        this.sounds[name].play();
    }

    play(name: keyof SoundsMap) {
        this.sounds[name].play();
    }
    stop(name: keyof SoundsMap) {
        this.sounds[name].stop();
    }
}
