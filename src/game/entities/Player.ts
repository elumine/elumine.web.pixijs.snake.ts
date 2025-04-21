import { DestroyOptions, Graphics, Ticker } from "pixi.js";
import { Character } from "./Character";
import { Subject } from "rxjs";
import { GoldChestItem, HealthPotionChestItem, ManaPotionChestItem } from "./Chest";
import { ManaComponent } from "../components/ManaComponent";
import { CooldownComponent } from "../components/Cooldown";
import SoundManager from "../SoundManager";
import { ZoomBlurFilter } from "pixi-filters";
import { Float } from "../math/Float";

export class Player extends Character {
    mana = new ManaComponent(this);
    fireballCooldown = new CooldownComponent(this, 200);
    fireballManaCost = 3;
    onGoldPick = new Subject();
    onHealthPotionPick = new Subject();
    onManaPotionPick = new Subject();
    f = new ZoomBlurFilter({});

    
    override async init(x: number, y: number, w: number, h: number) {
        this.movementForce = 0.05;
        this.health.maxHealth = 15;
        this.health.healthRegeneration = 0.33;
        this.mana.manaRegeneration = 2;
        await super.init(x, y, w, h);
        this.game.filters.applyFilterForDuration(this.f, 0, () => {});
    }
    
    override tick(ticker: Ticker) {
        super.tick(ticker);
        this.f.center = this.game.world.viewport.toScreen(this.position.x, this.position.y);
        this.f.strength = Float.Lerp(0, 0.1, this.movementInput.scale);
    }
    
    async castFireball() {
        if (this.fireballCooldown.cooldownActive) {
            //
        } else if (this.mana.mana < this.fireballManaCost) {
            //
        } else {
            this.mana.removeMana(this.fireballManaCost);
            this.fireballCooldown.start();
            return super.castFireball();
        }
    }

    pickGold(item: GoldChestItem) {
        SoundManager.Instance.play('coinPick', true);
        this.onGoldPick.next(null);
    }

    pickHealthPotion(item: HealthPotionChestItem) {
        SoundManager.Instance.play('itemPick', true);
        this.health.addHealth(item.healthAmount);
        this.onHealthPotionPick.next(null);
    }

    pickManaPotion(item: ManaPotionChestItem) {
        SoundManager.Instance.play('itemPick', true);
        this.mana.addMana(item.manaAmount);
        this.onManaPotionPick.next(null);
    }
}