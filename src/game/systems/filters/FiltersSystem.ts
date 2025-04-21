import { ColorMatrixFilter, Container, Filter } from "pixi.js";
import { GameSystem } from "../GameSystem";
import * as Filters from 'pixi-filters';
import Game from "../../Game";
import { Float } from "../../math/Float";


export class FiltersSystem extends GameSystem {

    constructor(
        public game: Game, public target: Container = null) {
        super(game);
    }

    filters = {};

    override async init() {
        this.applyFilters();
    }

    override async destroy() { }


    createDynamicFilter(
        filter: Filter,
        duration: number,
        updateFn: (filter: Filter, progress: number) => void) {
        const fdc = new FilterDurationController(this.game, filter, duration, updateFn);
        const id = `DynamicFilter_${Math.random() * 1000000}`;
        this.filters[id] = fdc.filterInstance;
        this.applyFilters();
        setTimeout(() => {
            delete this.filters[id];
            this.applyFilters();
        }, duration);
    }

    applyFilterForDuration(filter: Filter, duration = 1000, onEnded) {
        const id = `DynamicFilter_${Math.random() * 1000000}`;
        this.filters[id] = filter;
        this.applyFilters();
        if (duration > 0) {
            setTimeout(() => {
                delete this.filters[id];
                this.applyFilters();
                onEnded();
            }, duration);
        }
    }

    applyFilters() {
        console.log('applyFilters', this.filters);
        this.target.filters = Object.values(this.filters);
    }
}

export class GameFiltersSystem extends FiltersSystem {
    filters = {
        adjustment: new Filters.AdjustmentFilter(),
        bloom: new Filters.AdvancedBloomFilter(),
        bulge: new Filters.BulgePinchFilter()
    };

    override async init() {
        await super.init();

        this.filters.adjustment.contrast = 1.25;
        this.filters.adjustment.gamma = 0.75;

        this.filters.bloom.threshold = 0.5;
        this.filters.bloom.bloomScale = 0.5;
        this.filters.bloom.brightness = 1;
        this.filters.bloom.blur = 1;

        this.filters.bulge.centerX = 0.5;
        this.filters.bulge.centerY = 0.5;
        this.filters.bulge.radius = this.game.world.viewWidth;
        this.filters.bulge.strength = 0.25;
    }
}

export class FilterDurationController {
    startTime = performance.now();
    progress = 0;
    updateTimer = 0;
    tickInterval = 0.016;

    constructor(
        public game: Game,
        public filterInstance: Filter,
        public duration: number,
        public updateFn: (filter: Filter, progress: number) => void) {
        this.updateTimer = setInterval(() => {
            this.progress = (performance.now() - this.startTime) / (this.duration * 1000);
            this.updateFn(this.filterInstance, this.progress);
        }, this.tickInterval);
        setTimeout(() => {
            clearInterval(this.updateTimer);
        }, duration * 1000);
    }
}