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


type GameModesFormData = {
  immortal: boolean; walls: boolean; portal: boolean; speed: boolean;
}
enum GameScreen { Menu, Game, GameEnded }

export default observer((() => {
  const store = useContext(ApplicationContext);
  const [gameScreen, setGameScreen] = useState(GameScreen.Menu);
  const { register, getValues } = useForm<GameModesFormData>();

  const startGame = () => {
    const formData = getValues();
    const p: GameProperty[] = [];
    if (formData.immortal) p.push(GameProperty.GodMode)
    if (formData.walls) p.push(GameProperty.WallsMode)
    if (formData.portal) p.push(GameProperty.PortalMode)
    if (formData.speed) p.push(GameProperty.SpeedMode)
    store.game.startGameSession();
    store.game.currentSession.gameConfig.setProperties(p);
    store.game.gameInstance.startGame(store.game.currentSession);
    setGameScreen(GameScreen.Game);
  }
  const analyticsScreenOnBackClick = () => {
    setGameScreen(GameScreen.Menu);
  }

  useEffect(() => {
    store.game.createGameInstance('viewport');
    const onEndedSubscribtion = store.game.gameInstance.onEnded.subscribe(() => {
      store.game.currentSession.finish();
      setGameScreen(GameScreen.GameEnded);
    });
    return () => {
      onEndedSubscribtion.unsubscribe();
      store.game.gameInstance.destroy();
    }
  }, []);

  return (
    <div className="screen visible home">
      <div className={`screen menu ${(gameScreen === GameScreen.Menu) ? 'visible' : 'hidden'}`}>
        <MaterialStack>
          <MaterialCard variant="outlined">
            <div className="menu-box">
              <FormGroup className="settings-form">
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
              <Divider />
              <div className="hint-text">Use ←↑↓→ arrows to control snake</div>
              <Divider />
              <Button className="start-button" variant="text" startIcon={<VideogameAssetIcon />} onClick={startGame}>Start Game</Button>
            </div>
          </MaterialCard>
        </MaterialStack>
      </div>
      <div className={`screen game ${(gameScreen === GameScreen.Game) ? 'visible' : 'hidden'}`}>
        <div id="viewport"></div>
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
    </div>
  );
}));
