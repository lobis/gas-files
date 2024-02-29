import React, {useState} from "react"
import GasMixtureSelector from "./components/Selector"
import Graph from "./components/Graph"
import {Interface} from "node:readline"

export interface Data {
    name: string
    pressure: number
    temperature: number
    components: any
    electric_field: number[]
    electron_drift_velocity: number[]
    electron_longitudinal_diffusion: number[]
    electron_transversal_diffusion: number[]
    electron_townsend: number[]
}

const App: React.FC = () => {
    const [data, setData] = useState<Data | null>(null)

    const handleGasMixtureChange = (data: Data | null) => {
        setData(data)
    }

    return (
        <div className={"container mx-auto p-4 flex-row"}>
            <GasMixtureSelector onSelect={handleGasMixtureChange}/>
            {data && <Graph data={data}/>}
        </div>
    )
}

export default App
