import { observer } from "mobx-react";
import { GameSession } from "../../../../Store/GameStore";
import { BarChart, Gauge, LineChart, PieChart } from "@mui/x-charts";
import { Button, Typography } from "@mui/material";
import "./GameSession.scss";

export default observer(({ session, onBackClick }: { session: GameSession, onBackClick: () => void }) => {
    const lineChartDataX = [...session.analytics.secondsToPointsMap.keys()];
    const lineChartDataY = [...session.analytics.secondsToPointsMap.values()];
    const pieChartData = [
        { id: 0, value: session.analytics.userInputs.up, label: 'Up' },
        { id: 1, value: session.analytics.userInputs.down, label: 'Down' },
        { id: 2, value: session.analytics.userInputs.left, label: 'Left' },
        { id: 3, value: session.analytics.userInputs.right, label: 'Right' }
    ];

    return (
        <div className="game-session">
            <Typography component="h1" variant="h3"
                sx={{ width: '100%', fontSize: 'clamp(2rem, 10vw, 2.15rem)' }}>
                GAME INFORMATION
            </Typography>
            <div className="charts">
                <div className="chart-section">
                    <div className="chart-container">
                        <LineChart
                            colors={[ 'rgb(139, 35, 59)' ]}
                            xAxis={[{ data: lineChartDataX }]}
                            series={[{ data: lineChartDataY, area: true }]}
                            width={500}
                            height={300} />
                    </div>
                    <div className="chart-description">Points gained by time</div>
                </div>
                <div className="chart-section">
                    <div className="chart-container">
                        <PieChart
                            colors={[ 'rgb(139, 35, 59)', 'rgb(123, 32, 32)', 'rgb(123, 78, 32)', 'rgb(123, 120, 32)' ]}
                            series={[{ data: pieChartData }]}
                            width={400}
                            height={200} />
                    </div>
                    <div className="chart-description">Actions statistics</div>
                </div>
            </div>
            <div>
              <Button className="start-button" variant="text" onClick={onBackClick}>Back to Menu</Button>
            </div>
        </div>
    )
});