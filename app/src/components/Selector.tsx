// GasMixtureSelector.tsx
import React, {useState, useEffect} from "react"
import Select from "react-select"

import * as list from "./list.json"

interface GasMixtureSelectorProps {
    onSelect: (gasMixtures: string[]) => void
}

interface GasMixture {
    value: string
    label: string
}

interface GasComponent {
    name: string
    weight: number // 0-100 %
}

const GasMixtureSelector: React.FC<GasMixtureSelectorProps> = ({
                                                                   onSelect
                                                               }) => {

    const [availableMixtures, setAvailableMixtures] = useState<GasMixture[]>([])

    useEffect(() => {
        console.log(list)
        for(let item in list) {
            console.log(item)
            // console.log(mixture)
        }
    }, []);

    const gasMixtures: GasMixture[] = [
        {value: "Ar", label: "Argon (Ar)"},
        {value: "Ne", label: "Neon (Ne)"},
        {value: "C4H10", label: "Isobutane (iC4H10)"},
        {value: "CH4", label: "Methane (CH4)"}
    ]

    const [components, setComponents] = useState<GasComponent[]>([])
    const handleGasMixtureChange = (selectedOptions: any) => {
        const selectedMixtures = selectedOptions.map(
            (option: any) => option.value
        )

        // Create a new array instead of mutating the existing one
        let updatedGasComponents: GasComponent[] = [...components]

        // Remove gas components if not in selectedMixtures
        updatedGasComponents = updatedGasComponents.filter(component =>
            selectedMixtures.includes(component.name)
        )

        // Add gas components if not in gasComponents
        selectedMixtures.forEach((mixture: string) => {
            if (
                !updatedGasComponents.find(
                    component => component.name === mixture
                )
            ) {
                updatedGasComponents.push({name: mixture, weight: 0})
            }
        })

        // if the sum of all weights it not 100, set the last component to the remaining weight
        const sum = updatedGasComponents.reduce(
            (acc, component) => acc + component.weight,
            0
        )
        if (sum !== 100 && updatedGasComponents.length > 0) {
            const lastComponentIndex = updatedGasComponents.length - 1
            updatedGasComponents[lastComponentIndex].weight = 100 - sum
        }

        setComponents(updatedGasComponents)
        console.log(updatedGasComponents)
    }

    return (
        <div
            className="w-full max-w-screen-sm mx-auto my-4 p-4 bg-gray-100 rounded-lg shadow-lg flex flex-col items-center">
            <Select className={"w-full mb-4"}
                    defaultValue={[gasMixtures[0]]}
                    isMulti
                    options={gasMixtures}
                    onChange={handleGasMixtureChange}
            />
            <div className="flex">
                {components.map((component, index) => (
                    <div key={index} className="m-4">
                        <label className="block font-semibold whitespace-no-wrap">
                            {component.name}
                        </label>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={component.weight}
                            onChange={event => {
                                const updatedGasComponents = [...components]
                                const newWeight = parseInt(event.target.value)
                                const oldWeight = updatedGasComponents[index].weight
                                updatedGasComponents[index].weight = newWeight
                                // update the weight of the remaining components (starting with the next one) so the sum is 100. Weights cannot be negative!
                                // TODO

                                setComponents(updatedGasComponents)
                            }}
                        />
                        <span className="block text-sm">{component.weight}%</span>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default GasMixtureSelector
