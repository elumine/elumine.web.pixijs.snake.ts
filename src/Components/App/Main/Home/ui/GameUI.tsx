import { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import Game from '../../../../../game/Game'
import { ApplicationContext } from '../../../../../Store/ApplicationStore';

export const GameUI = ({game}: {game: Game}) => {
    const store = useContext(ApplicationContext);
    const [ arenaShrinkTimer, setArenaShrinkTimer ] = useState(0);
    const [ playerHealth, setPlayerHealth ] = useState(1);
    const [ playerMana, setPlayerMana ] = useState(1);
    const [ playerFireballCooldown, setPlayerFireballCooldown ] = useState(0);

    useEffect(() => {
        const subscribtions = [];
        subscribtions.push(game.onStarted.subscribe(e => {
            subscribtions.push(game.player.health.onHealthChanged.subscribe(e => {
                setPlayerHealth(e.health/e.maxHealth);
            }));
            subscribtions.push(game.player.mana.onManaChanged.subscribe(e => {
                setPlayerMana(e.mana/e.maxMana);
            }));
            subscribtions.push(game.player.fireballCooldown.onStateChanged.subscribe(e => {
                setPlayerFireballCooldown(e.cooldownActive ? 1-e.progress : 0);
            }));
            subscribtions.push(game.arena.shrinkTimer.onTimeChanged.subscribe(e => {
                setArenaShrinkTimer(e.secondsLeft);
            }));
        }));
        return (() => {
            subscribtions.forEach(s => s.unsubscribe());
        });
    }, [game]);

    return (
        <div className='game-ui'>
            <div className="gold">
                <div className="icon"></div>
                <div className="text">
                    {store.game.currentSession?.analytics?.playerGoldPickerRecords.length || 0}
                </div>
            </div>
            {arenaShrinkTimer >= 0 && <div className="arena-timer">
                <div className="text">
                    {arenaShrinkTimer}
                </div>
            </div>}
            <div className='bottom-bar'>
                <div className='layer first'></div>
                <div className='layer second'>
                    <div className="bar stat health">
                        <div className="outer-ring"></div>
                        <div className="bar-bg"></div>
                        <div className="inner-sphere" style={{
                            top: `${(1-playerHealth)*100}%`
                        }}>
                        </div>
                    </div>
                    <div className="bar spell fireball">
                        <div className='cooldown-overlay' style={{
                            top: `${(1-playerFireballCooldown)*100}%`
                        }}>
                        </div>
                    </div>
                    <div className="bar stat mana">
                        <div className="outer-ring"></div>
                        <div className="bar-bg"></div>
                        <div className="inner-sphere" style={{
                            top: `${(1-playerMana)*100}%`
                        }}>
                        </div>
                    </div>
                </div>
                <div className='layer third'></div>
            </div>
        </div>
    )
}