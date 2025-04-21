import { observer } from "mobx-react";
import { GameSession } from "../../../../Store/GameStore";
import { BarChart, Gauge, LineChart, PieChart } from "@mui/x-charts";
import { Button, Typography } from "@mui/material";
import "./GameSession.scss";

export default observer(({ session, onBackClick }: { session: GameSession, onBackClick: () => void }) => {
    const chartsData = {
        inputs: [
            { id: 0, value: session.analytics.userInputs.up, label: 'Up' },
            { id: 1, value: session.analytics.userInputs.down, label: 'Down' },
            { id: 2, value: session.analytics.userInputs.left, label: 'Left' },
            { id: 3, value: session.analytics.userInputs.right, label: 'Right' },
            { id: 4, value: session.analytics.userInputs.fireball, label: 'Fireball' }
        ],
        chestSpawnedRecords: createLineChartData(session.analytics.computedSecondsToChestSpawned),
        chestDestroyedRecords: createLineChartData(session.analytics.computedSecondsToChestDestroyed),
        enemySpawnedRecords: createLineChartData(session.analytics.computedSecondsToEnemySpawned),
        enemyDestroyedRecords: createLineChartData(session.analytics.computedSecondsToEnemyDestroyed),
        playerDamageRecords: createLineChartData(session.analytics.computedSecondsToPlayerDamage),
        playerFireballRecords: createLineChartData(session.analytics.computedSecondsToPlayerFireball),
        playerGoldPickerRecords: createLineChartData(session.analytics.computedSecondsToPlayerGoldPicked),
        playerManaPotionsPickerRecords: createLineChartData(session.analytics.computedSecondsToPlayerManaPotionsPicked),
        playerHealthPotionsPickerRecords: createLineChartData(session.analytics.computedSecondsToPlayerHealthPotionsPicked),
    }

    function createLineChartData(map: Map<number, number>) {
        return {
            x: [...map.keys()],
            y: [...map.values()]
        }
    }

    return (
        <div className="game-session">
            <Typography component="h1" variant="h3"
                sx={{ width: '100%', fontSize: 'clamp(2rem, 10vw, 2.15rem)' }}>
                GAME FINISHED
            </Typography>
            <div>
              <Button className="start-button" variant="text" onClick={onBackClick}>Back to Menu</Button>
            </div>
            <div className="charts">
                <div className="chart-section">
                    <div className="chart-container">
                        <PieChart
                            colors={[ 'rgb(139, 35, 59)', 'rgb(123, 32, 32)', 'rgb(123, 78, 32)', 'rgb(123, 120, 32)', 'rgb(32, 120, 123)'  ]}
                            series={[{ data: chartsData.inputs }]}
                            width={400}
                            height={200} />
                    </div>
                    <div className="chart-description">Input Actions</div>
                </div>
                <div className="chart-section">
                    <div className="chart-container">
                        <LineChart
                            colors={[ 'rgb(35, 139, 59)' ]}
                            xAxis={[{ data: chartsData.chestSpawnedRecords.x }]}
                            series={[{ data: chartsData.chestSpawnedRecords.y, area: true }]}
                            width={400}
                            height={200} />
                    </div>
                    <div className="chart-description">Chests Spawned</div>
                </div>
                <div className="chart-section">
                    <div className="chart-container">
                        <LineChart
                            colors={[ 'rgb(17, 70, 30)' ]}
                            xAxis={[{ data: chartsData.chestDestroyedRecords.x }]}
                            series={[{ data: chartsData.chestDestroyedRecords.y, area: true }]}
                            width={400}
                            height={200} />
                    </div>
                    <div className="chart-description">Chests Destroyed</div>
                </div>
                <div className="chart-section">
                    <div className="chart-container">
                        <LineChart
                            colors={[ 'rgb(139, 35, 59)' ]}
                            xAxis={[{ data: chartsData.enemySpawnedRecords.x }]}
                            series={[{ data: chartsData.enemySpawnedRecords.y, area: true }]}
                            width={400}
                            height={200} />
                    </div>
                    <div className="chart-description">Enemies Spawned</div>
                </div>
                <div className="chart-section">
                    <div className="chart-container">
                        <LineChart
                            colors={[ 'rgb(70, 17, 30)' ]}
                            xAxis={[{ data: chartsData.enemyDestroyedRecords.x }]}
                            series={[{ data: chartsData.enemyDestroyedRecords.y, area: true }]}
                            width={400}
                            height={200} />
                    </div>
                    <div className="chart-description">Enemies Killed</div>
                </div>
                <div className="chart-section">
                    <div className="chart-container">
                        <LineChart
                            colors={[ 'rgb(17, 30, 70)' ]}
                            xAxis={[{ data: chartsData.playerDamageRecords.x }]}
                            series={[{ data: chartsData.playerDamageRecords.y, area: true }]}
                            width={400}
                            height={200} />
                    </div>
                    <div className="chart-description">Damage Taken</div>
                </div>
                <div className="chart-section">
                    <div className="chart-container">
                        <LineChart
                            colors={[ 'rgb(35, 59, 139)' ]}
                            xAxis={[{ data: chartsData.playerFireballRecords.x }]}
                            series={[{ data: chartsData.playerFireballRecords.y, area: true }]}
                            width={400}
                            height={200} />
                    </div>
                    <div className="chart-description">Fireball Casts</div>
                </div>
                <div className="chart-section">
                    <div className="chart-container">
                        <LineChart
                            colors={[ 'rgb(139, 139, 59)' ]}
                            xAxis={[{ data: chartsData.playerGoldPickerRecords.x }]}
                            series={[{ data: chartsData.playerGoldPickerRecords.y, area: true }]}
                            width={400}
                            height={200} />
                    </div>
                    <div className="chart-description">Gold Picked</div>
                </div>
                <div className="chart-section">
                    <div className="chart-container">
                        <LineChart
                            colors={[ 'rgb(139, 35, 59)' ]}
                            xAxis={[{ data: chartsData.playerHealthPotionsPickerRecords.x }]}
                            series={[{ data: chartsData.playerHealthPotionsPickerRecords.y, area: true }]}
                            width={400}
                            height={200} />
                    </div>
                    <div className="chart-description">Health Potions Picked</div>
                </div>
                <div className="chart-section">
                    <div className="chart-container">
                        <LineChart
                            colors={[ 'rgb(35, 59, 139)' ]}
                            xAxis={[{ data: chartsData.playerManaPotionsPickerRecords.x }]}
                            series={[{ data: chartsData.playerManaPotionsPickerRecords.y, area: true }]}
                            width={400}
                            height={200} />
                    </div>
                    <div className="chart-description">Mana Potions Picked</div>
                </div>
            </div>
        </div>
    )
});