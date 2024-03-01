import React, { useState } from "react"
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from "recharts"

import ToggleButton from "@mui/material/ToggleButton"
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup"

import { Data } from "../App"
import { Box, Slider } from "@mui/material"

interface GraphProps {
    data: Data
}

const Graph: React.FC<GraphProps> = ({ data }) => {
    const graphData = data.electric_field.map((value, index) => {
        return {
            x: value,
            electron_drift_velocity: data.electron_drift_velocity[index],
            electron_longitudinal_diffusion:
                data.electron_longitudinal_diffusion[index],
            electron_transversal_diffusion:
                data.electron_transversal_diffusion[index],
            electron_townsend: data.electron_townsend[index]
        }
    })

    const [magnitudeToGraph, setMagnitudeToGraph] = useState(
        "electron_drift_velocity"
    )
    const [xAxisRange, setXAxisRange] = useState([0, 2000])
    const handleChangeToMagnitudeToGraph = (
        event: React.MouseEvent<HTMLElement>,
        newMagnitudeToGraph: string
    ) => {
        if (newMagnitudeToGraph === null) {
            return
        }
        setMagnitudeToGraph(newMagnitudeToGraph)
    }

    const handleRangeSliderChange = (
        event: Event,
        newValue: number | number[]
    ) => {
        const minDistance = 500
        if (
            (newValue as number[])[1] - (newValue as number[])[0] <
            minDistance
        ) {
            return
        }
        setXAxisRange(newValue as number[])
    }

    return (
        <div className="graph w-full max-w-screen-lg bg-white mx-auto my-4 p-4 rounded-lg shadow-lg flex flex-col items-center">
            <div>
                <ToggleButtonGroup
                    color="standard"
                    value={magnitudeToGraph}
                    exclusive
                    onChange={handleChangeToMagnitudeToGraph}>
                    <ToggleButton
                        className={"patata"}
                        value="electron_drift_velocity">
                        Drift Velocity
                    </ToggleButton>
                    <ToggleButton value="electron_longitudinal_diffusion">
                        Longitudinal Diffusion
                    </ToggleButton>
                    <ToggleButton value="electron_transversal_diffusion">
                        Transversal Diffusion
                    </ToggleButton>
                    <ToggleButton value="electron_townsend">
                        Townsend Coefficient
                    </ToggleButton>
                </ToggleButtonGroup>
            </div>
            <div className="w-full" style={{ height: 450 }}>
                <ResponsiveContainer width={"100%"}>
                    <LineChart
                        width={800}
                        height={400}
                        data={graphData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                        <CartesianGrid />

                        <XAxis
                            allowDataOverflow
                            dataKey="x"
                            label={{
                                value: "Electric Field / Pressure [V/cm/bar]",
                                offset: -10,
                                position: "insideBottom",
                                className: "text-sm"
                            }}
                            domain={xAxisRange}
                            type="number"
                        />

                        <YAxis
                            allowDataOverflow
                            label={{
                                value: {
                                    electron_drift_velocity:
                                        "Drift Velocity [cm/μs]",
                                    electron_longitudinal_diffusion:
                                        "Longitudinal Diffusion [√cm]",
                                    electron_transversal_diffusion:
                                        "Transversal Diffusion [√cm]",
                                    electron_townsend:
                                        "Townsend Coefficient [1/cm]"
                                }[magnitudeToGraph],
                                angle: -90,
                                position: "insideLeft",
                                offset: 5,
                                className: "text-sm"
                            }}
                            type="number"
                        />

                        <Tooltip />

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

            <div className={"w-full"}>
                <Box className={"w-full"}>
                    <Slider
                        getAriaLabel={() => "Temperature range"}
                        value={xAxisRange}
                        onChange={handleRangeSliderChange}
                        valueLabelDisplay="auto"
                        min={0}
                        max={10000}
                        step={100}
                        disableSwap={true}
                    />
                </Box>
            </div>
        </div>
    )
}

export default Graph
