// Graph.tsx
import React from "react"
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend, ResponsiveContainer
} from "recharts"

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

    return (
        <div
            className="graph w-full max-w-screen-lg bg-white mx-auto my-4 p-4 rounded-lg shadow-lg flex flex-col items-center">

            <h2 className="text-lg font-bold mb-4">Graph for {data.name}</h2>
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
                                value: "Drift Velocity",
                                angle: -90,
                                position: "insideLeft",
                                offset: 5,
                                className: "text-sm"
                            }}
                            type="number"
                        />

                        <Tooltip/>

                        <Line
                            type="monotone"
                            dataKey="electron_drift_velocity"
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
