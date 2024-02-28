// App.tsx
import React, { useState } from "react"
import GasMixtureSelector from "./components/Selector"
import Graph from "./components/Graph"

const App: React.FC = () => {
    const [selectedGasMixture, setSelectedGasMixture] = useState<string>("")

    const handleGasMixtureChange = (gasMixtures: string[]) => {
        setSelectedGasMixture(gasMixtures[0])
    }

    return (
        <div>
            <h1>Gas Mixture Graph Plotter</h1>
            <GasMixtureSelector onSelect={handleGasMixtureChange} />
            {selectedGasMixture && <Graph gasMixture={selectedGasMixture} />}
        </div>
    )
}

export default App
