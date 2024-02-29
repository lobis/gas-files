// Graph.tsx
import React, {useState} from "react"
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend, ResponsiveContainer
} from "recharts"

import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

import {Data} from "../App"

interface GraphProps {
    data: Data
}

const Graph: React.FC<GraphProps> = ({data}) => {

    const graphData = data.electric_field.map((value, index) => {
            return {
                x: value,
                electron_drift_velocity: data.electron_drift_velocity[index],
                electron_longitudinal_diffusion: data.electron_longitudinal_diffusion[index],
                electron_transversal_diffusion: data.electron_transversal_diffusion[index],
                electron_townsend: data.electron_townsend[index]
            }
        }
    )

    const [magnitudeToGraph, setMagnitudeToGraph] = useState("electron_drift_velocity");

    const handleChangeToMagnitudeToGraph = (
        event: React.MouseEvent<HTMLElement>,
        newMagnitudeToGraph: string,
    ) => {
        if (newMagnitudeToGraph === null) {
            return;
        }
        setMagnitudeToGraph(newMagnitudeToGraph);
    };

    return (
        <div
            className="graph w-full max-w-screen-lg bg-white mx-auto my-4 p-4 rounded-lg shadow-lg flex flex-col items-center">

            <h2 className="text-lg font-bold mb-4">Graph for {data.name}</h2>
            <div>
                <ToggleButtonGroup
                    color="primary"
                    value={magnitudeToGraph}
                    exclusive
                    onChange={handleChangeToMagnitudeToGraph}
                >
                    <ToggleButton value="electron_drift_velocity">Drift Velocity</ToggleButton>
                    <ToggleButton value="electron_longitudinal_diffusion">Longitudinal Diffusion</ToggleButton>
                    <ToggleButton value="electron_transversal_diffusion">Transversal Diffusion</ToggleButton>
                    <ToggleButton value="electron_townsend">Townsend Coefficient</ToggleButton>
                </ToggleButtonGroup>

            </div>
            <div className="w-full" style={{height: 500}}>
                <ResponsiveContainer width={"100%"}>
                    <LineChart
                        width={800}
                        height={400}
                        data={graphData}
                        margin={{top: 20, right: 30, left: 20, bottom: 20}}
                    >
                        <CartesianGrid/>

                        <XAxis
                            allowDataOverflow
                            dataKey="x"
                            label={{
                                value: "Electric Field / Pressure [V/cm/bar]",
                                offset: -10,
                                position: "insideBottom",
                                className: "text-sm"
                            }}
                            domain={[
                                Math.round(Math.min(...graphData.map((entry) => entry.x))),
                                Math.round(Math.max(...graphData.map((entry) => entry.x)))
                            ]}
                            type="number"
                        />

                        <YAxis
                            allowDataOverflow
                            label={{
                                value: {
                                    "electron_drift_velocity": "Drift Velocity [cm/s]",
                                    "electron_longitudinal_diffusion": "Longitudinal Diffusion [cm²/s]",
                                    "electron_transversal_diffusion": "Transversal Diffusion [cm²/s]",
                                    "electron_townsend": "Townsend Coefficient [1/cm]"
                                }[magnitudeToGraph],
                                angle: -90,
                                position: "insideLeft",
                                offset: 5,
                                className: "text-sm"
                            }}
                            type="number"
                        />

                        <Tooltip/>

                        <Line
                            type="natural"
                            dataKey={magnitudeToGraph}
                            stroke="#4F46E5"
                            strokeWidth={4}
                            dot={false}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );

}

export default Graph
