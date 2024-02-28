// Graph.tsx
import React from "react"
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend
} from "recharts"

interface GraphProps {
    gasMixture: string
}

const Graph: React.FC<GraphProps> = ({ gasMixture }) => {
    // Fetch data for the selected gas mixture from your API or mock data

    // Mock data for demonstration
    const data = [
        { name: "Jan", value: 30 },
        { name: "Feb", value: 40 },
        { name: "Mar", value: 35 }
        // Add more data points as needed
    ]

    return (
        <div>
            <h2>Graph for {gasMixture}</h2>
            <LineChart width={800} height={400} data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="value" stroke="#8884d8" />
            </LineChart>
        </div>
    )
}

export default Graph
