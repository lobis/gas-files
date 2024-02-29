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

const GasMixtureTitle = ({ mixture }: { mixture: GasComponent[] }) => {
    // if empty, return "Select a Gas Mixture", otherwise return the mixture with %
    if (mixture.length === 0) {
        return <h1 className="text-2xl font-semibold mb-4">Select a Gas Mixture</h1>
    }
    const mixtureString = mixture
        .map(component => `${component.weight.toFixed(1)}% ${component.name}`)
        .join(" + ")

    return (
        <h1 className="text-2xl font-semibold mb-4">
            {mixtureString}
        </h1>
    )
}


const GasMixtureSelector: React.FC<GasMixtureSelectorProps> = ({
                                                                   onSelect
                                                               }) => {


    const [mixtures, setMixtures] = useState<Map<string, number[][]>>(new Map())
    const [selectedMixture, setSelectedMixture] = useState<string>("")

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

        setMixtures(mixturesMap)
        setComponentOptions(
            Array.from(componentNamesFromList).sort().map(name => ({
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
        selectedMixtures.sort()

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
        updatedGasComponents.sort((a, b) => a.name.localeCompare(b.name))

        const updatedOptions = [...componentOptions]
        for (const option of updatedOptions) {
            const component = option.value
            if (selectedMixtures.includes(component)) {
                option.isDisabled = false
                continue
            }
            const potentialMixture = selectedMixtures.concat(component).sort()
            option.isDisabled = mixtures.get(potentialMixture.join(", ")) === undefined
        }
        // TODO: this currently works but may not work in all cases: If we have "Ar" and "Ar + CH4 + C4H10" but not "Ar + CH4" or "Ar + C4H10", then the chain is broken at some point
        setComponentOptions(updatedOptions)

        const mixtureName = selectedMixtures.join(", ")
        setSelectedMixture(mixtureName)
        const availableFractions = mixtures.get(mixtureName)

        if (availableFractions === undefined) {
            setComponents([])
            return
        }

        // set weights to the first available fractions
        updatedGasComponents.forEach((component, index) => {
            component.weight = availableFractions[0][index] * 100
        })

        setComponents(updatedGasComponents)
    }

    return (
        <div
            className="w-full max-w-screen-sm mx-auto my-4 p-4 bg-gray-100 rounded-lg shadow-lg flex flex-col items-center">
            <GasMixtureTitle mixture={components} />
            <Select className={"w-full mb-4"}
                    isMulti
                    options={componentOptions}
                    onChange={handleGasMixtureChange}
                    value={componentOptions.filter(option =>
                        components.map(component => component.name).includes(option.value)
                    )}
            />
            <div className="flex">
                {components.map((component, index) => (
                    <div key={index} className="m-4 flex flex-col items-center">
                        <label className="m-2 block font-semibold whitespace-no-wrap">
                            {component.name}
                        </label>
                        <input
                            className={"m-2 w-64 appearance-auto bg-gray-300 h-2 rounded-lg"}
                            type="range"
                            min="0"
                            max="1000"
                            step="1"
                            value={component.weight * 10.0}
                            onChange={event => {
                                // TODO: unify in a single function

                                const availableFractions = mixtures.get(selectedMixture)
                                const availableValues = availableFractions?.map(fractions => fractions[index] * 100)

                                const updatedGasComponents = [...components]
                                const tentativeWeight = parseInt(event.target.value) / 10.0
                                const oldWeight = updatedGasComponents[index].weight

                                // set new weight to the closest available value
                                let newWeight = availableValues?.reduce((prev, curr) => Math.abs(curr - tentativeWeight) < Math.abs(prev - tentativeWeight) ? curr : prev)
                                if (newWeight === undefined) {
                                    newWeight = oldWeight
                                }

                                updatedGasComponents[index].weight = newWeight

                                // adjust remaining weights to keep sum at 100
                                const sum = updatedGasComponents.reduce(
                                    (acc, component) => acc + component.weight,
                                    0
                                )
                                if (sum !== 100) {
                                    const indexToAdjust = (index + 1) % updatedGasComponents.length
                                    updatedGasComponents[indexToAdjust].weight += 100 - sum
                                }

                                setComponents(updatedGasComponents)
                            }}
                        />
                        <div className="flex items-center">
                            <input
                                className="m-2 w-16 text-right bg-transparent border-none focus:outline-none"
                                type="number"
                                min="0"
                                max="100"
                                step="0.5"
                                // round to 2 decimal places
                                value={component.weight.toFixed(1)}
                                onChange={event => {
                                    const availableFractions = mixtures.get(selectedMixture)
                                    const availableValues = availableFractions?.map(fractions => fractions[index] * 100)

                                    const updatedGasComponents = [...components]
                                    const tentativeWeight = parseFloat(event.target.value)
                                    const oldWeight = updatedGasComponents[index].weight

                                    // set new weight to the closest available value
                                    let newWeight = availableValues?.reduce((prev, curr) => Math.abs(curr - tentativeWeight) < Math.abs(prev - tentativeWeight) ? curr : prev)
                                    if (newWeight === undefined) {
                                        newWeight = oldWeight
                                    }

                                    updatedGasComponents[index].weight = newWeight

                                    // adjust remaining weights to keep sum at 100
                                    const sum = updatedGasComponents.reduce(
                                        (acc, component) => acc + component.weight,
                                        0
                                    )
                                    if (sum !== 100) {
                                        const indexToAdjust = (index + 1) % updatedGasComponents.length
                                        updatedGasComponents[indexToAdjust].weight += 100 - sum
                                    }

                                    setComponents(updatedGasComponents)
                                }}
                            />
                            <span className="text-gray-600">%</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default GasMixtureSelector
