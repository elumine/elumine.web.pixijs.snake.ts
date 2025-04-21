import { observer } from "mobx-react";
import { useContext, useEffect, useState } from "react";
import { useForm, SubmitHandler } from 'react-hook-form';
import { ApplicationContext } from "../../../../Store/ApplicationStore.ts";
import GameSession from "./GameSession.tsx";
import './Home.scss';
import { GameProperty } from "../../../../Store/game/GameConfig.ts";
import { MaterialCard } from "../../../Common/material/card.ts";
import { MaterialStack } from "../../../Common/material/stack.ts";
import { Button, Checkbox, Divider, FormControlLabel, FormGroup, Tooltip, Typography } from "@mui/material";
import VideogameAssetIcon from '@mui/icons-material/VideogameAsset';
import { GameUI } from "./ui/GameUI.tsx";
import { BlackScreen } from "./BlackScreen.tsx";
import { AsyncCommon } from "../../../../game/Async.ts";
import SoundManager from "../../../../game/SoundManager.ts";


type GameModesFormData = {
  immortal: boolean; walls: boolean; portal: boolean; speed: boolean;
}
enum GameScreen { Menu, Game, GameEnded }

export default observer((() => {
  const store = useContext(ApplicationContext);
  const [gameScreen, setGameScreen] = useState(GameScreen.Menu);
  const [blackScreenVisible, setBlackScreenVisible] = useState(false);
  const { register, getValues } = useForm<GameModesFormData>();
  const subscribtions = [];

  const startGame = async () => {
    SoundManager.Instance.play('gameStart');
    SoundManager.Instance.playMusic('gameMusic');
    await store.game.createGameInstance();
    await store.game.gameInstance.init('viewport');
    await store.game.createGameSession();
    // const formData = getValues();
    // const p: GameProperty[] = [];
    // if (formData.immortal) p.push(GameProperty.GodMode)
    // if (formData.walls) p.push(GameProperty.WallsMode)
    // if (formData.portal) p.push(GameProperty.PortalMode)
    // if (formData.speed) p.push(GameProperty.SpeedMode)
    // store.game.currentSession.gameConfig.setProperties(p);
    subscribtions.push(store.game.gameInstance.onEnded.subscribe(endGame));
    await store.game.gameInstance.startGame(store.game.currentSession);
    setBlackScreenVisible(true);
    await AsyncCommon.Delay(500);
    setGameScreen(GameScreen.Game);
    setBlackScreenVisible(false);
  }
  const endGame = async () => {
    SoundManager.Instance.play('gameOver');
    SoundManager.Instance.playMusic('menuMusic');
    store.game.finishGameSession();
    setBlackScreenVisible(true);
    await AsyncCommon.Delay(500);
    store.game.destroyGameInstance();
    setGameScreen(GameScreen.GameEnded);
    setBlackScreenVisible(false);
  }
  const analyticsScreenOnBackClick = async () => {
    setBlackScreenVisible(true);
    await AsyncCommon.Delay(500);
    setGameScreen(GameScreen.Menu);
    setBlackScreenVisible(false);
  }

  useEffect(() => {
    SoundManager.Instance.load()
      .then(() => {
        SoundManager.Instance.playMusic('menuMusic');
      });
    return () => {
      subscribtions.forEach(s => s.unsubscribe());
      store.game.destroyGameInstance();
    }
  }, []);

  return (
    <div className="screen visible home">
      <div className={`screen menu ${(gameScreen === GameScreen.Menu) ? 'visible' : 'hidden'}`}>
        <MaterialStack>
          <MaterialCard variant="outlined">
            <div className="menu-box">
              {/* <FormGroup className="settings-form">
                <Tooltip title="Snake can't die by walls or self collision" placement="right">
                  <FormControlLabel control={<Checkbox {...register('immortal')} />} label="Immortal" />
                </Tooltip>
                <Tooltip title="Each time snake consumes an apple a new wall spawns in random location" placement="right">
                  <FormControlLabel control={<Checkbox {...register('walls')} />} label="Dynamic Walls" />
                </Tooltip>
                <Tooltip title="Introduces second apple, allows snake to teleport between them on consumption" placement="right">
                  <FormControlLabel control={<Checkbox {...register('portal')} />} label="Portals" />
                </Tooltip>
                <Tooltip title="On each apple consumption game speed increases" placement="right">
                  <FormControlLabel control={<Checkbox {...register('speed')} />} label="Speed Up" />
                </Tooltip>
              </FormGroup>
              <Divider /> */}
              <div className="hint-text">Mouse movement to move</div>
              <Divider />
              <div className="hint-text">Left click to use spell</div>
              <Divider />
              <Button className="start-button" variant="text" startIcon={<VideogameAssetIcon />} onClick={startGame}>Start Game</Button>
            </div>
          </MaterialCard>
        </MaterialStack>
      </div>
      <div className={`screen game ${(gameScreen === GameScreen.Game) ? 'visible' : 'hidden'}`}>
        <div id="viewport"></div>
        <canvas id="physics-canvas"></canvas>
        {store.game.gameInstance && <GameUI game={store.game.gameInstance} />}
      </div>
      {(gameScreen === GameScreen.GameEnded) &&
        <div className={`screen game-ended`}>
          <MaterialStack>
            <MaterialCard variant="outlined" className="menu-box">
              <GameSession session={store.game.currentSession} onBackClick={analyticsScreenOnBackClick} />
            </MaterialCard>
          </MaterialStack>
        </div>
      }
      <BlackScreen visible={blackScreenVisible} />
    </div>
  );
}));
