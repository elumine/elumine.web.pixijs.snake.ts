import { Sound } from "@pixi/sound";

export interface SoundsMap {
    menuMusic: Sound;
    gameMusic: Sound;
    gameOver: Sound;
    gameStart: Sound;
    coinPick: Sound;
    itemPick: Sound;
    death: Sound;
    fireball1: Sound;
    fireball2: Sound;
    fireball3: Sound;
}

export default class SoundManager {
    static readonly Instance = new SoundManager();
    sounds: SoundsMap = {} as SoundsMap;
    concurrencyMap = {};
    soundsLoadingConfig = {
        menuMusic: 'menu-music',
        gameMusic: 'game-music',
        gameOver: 'game-over',
        gameStart: 'game-start',
        coinPick: 'coin-pick',
        itemPick: 'food-consume',
        death: 'death',
        fireball1: 'fireball1',
        fireball2: 'fireball2',
        fireball3: 'fireball3',
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
                url: `/sfx/${fileName}.mp3`,
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

    play(name: keyof SoundsMap, concurrent = false) {
        if (concurrent) {
            this.stop(name);
            this.sounds[name].play();
        } else {
            if (!this.concurrencyMap[name]) {
                const sfx = this.sounds[name];
                sfx.play();
                this.concurrencyMap[name] = setTimeout(() => {
                    this.concurrencyMap[name] = 0;
                    sfx.stop()
                }, this.sounds[name].duration * 1000);
            }
        }
    }
    stop(name: keyof SoundsMap) {
        this.sounds[name].stop();
    }

    playFireball() {
        const name = `fireball${1 + Math.floor(Math.random() * 2)}`;
        this.sounds[name].play();
    }
}
