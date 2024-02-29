// GasMixtureSelector.tsx
import React, { useState, useEffect } from "react"
import Select from "react-select"

import list from "./list.json"

interface GasMixtureSelectorProps {
    onSelect: (gasMixtures: string[]) => void
}

interface MixtureComponentOption {
    value: string
    label: string
    isDisabled: boolean
}

interface GasComponent {
    name: string
    weight: number // 0-100 %
}

interface Mixture {
    components: string[],
    composition: number[]
}

const GasMixtureSelector: React.FC<GasMixtureSelectorProps> = ({
                                                                   onSelect
                                                               }) => {


    const [componentNames, setComponentNames] = useState<string[]>([])
    const [mixtures, setMixtures] = useState<Map<string, number[][]>>(new Map())

    const componentNameToLabel = (name: string) => {
        switch (name) {
            // TODO
            default:
                return name
        }
    }

    useEffect(() => {
        const componentNamesFromList = new Set<string>()
        const mixturesMap: Map<string, number[][]> = new Map()
        for (const mixture of list) {
            const labels = mixture.components.labels.sort()
            // add labels to the set
            for (const label of labels) {
                componentNamesFromList.add(label)
            }
            // add the composition to the map
            const mapKey = labels.join(", ")
            // check if key is already in the map
            if (!mixturesMap.has(mapKey)) {
                mixturesMap.set(mapKey, [mixture.components.fractions])
            } else {
                mixturesMap.get(mapKey)?.push(mixture.components.fractions)
            }
        }

        setComponentNames(Array.from(componentNamesFromList).sort())
        setMixtures(mixturesMap)
        setComponentOptions(
            Array.from(componentNamesFromList).map(name => ({
                value: name,
                label: componentNameToLabel(name),
                isDisabled: false
            }))
        )
    }, [])


    const [components, setComponents] = useState<GasComponent[]>([])
    const [componentOptions, setComponentOptions] = useState<MixtureComponentOption[]>([])

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
                updatedGasComponents.push({ name: mixture, weight: 0 })
            }
        })

        const updatedOptions = [...componentOptions]
        for (const option of updatedOptions) {
            const component = option.value
            if (selectedMixtures.includes(component)) {
                option.isDisabled = false
                console.log("skipping", component)
                continue
            }
            const potentialMixture = selectedMixtures.concat(component).sort()
            const fractions = mixtures.get(selectedMixtures.join(", "))
            console.log("potentialMixture", potentialMixture, fractions)
            option.isDisabled = mixtures.get(potentialMixture.join(", ")) === undefined
        }
        setComponentOptions(updatedOptions)

        // if the sum of all weights is not 100, set the last component to the remaining weight
        const sum = updatedGasComponents.reduce(
            (acc, component) => acc + component.weight,
            0
        )
        if (sum !== 100 && updatedGasComponents.length > 0) {
            const lastComponentIndex = updatedGasComponents.length - 1
            updatedGasComponents[lastComponentIndex].weight = 100 - sum
        }

        setComponents(updatedGasComponents)
    }

    return (
        <div
            className="w-full max-w-screen-sm mx-auto my-4 p-4 bg-gray-100 rounded-lg shadow-lg flex flex-col items-center">
            <Select className={"w-full mb-4"}
                    isMulti
                    options={componentOptions}
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
