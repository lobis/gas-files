import React, {useState, useEffect} from "react"
import Select from "react-select"
import axios from "axios"
import {Data} from "../App"

interface GasMixtureSelectorProps {
    onSelect: (data: Data | null) => void
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

const componentNamesToKeys = (names: string[]) => {
    return names.sort().join(", ")
}

const componentsNamesAndWeightsToKey = (components: GasComponent[]) => {
    return components
        .sort((a, b) => a.name.localeCompare(b.name))
        .map(component => `${component.name} ${component.weight.toFixed(1)}`)
        .join(", ")
}

interface GasMixtureTitleProps {
    mixture: GasComponent[]
    dataUrlMap: Map<string, string>
}

const GasMixtureTitle = ({mixture, dataUrlMap}: GasMixtureTitleProps) => {
    // if empty, return "Select a Gas Mixture", otherwise return the mixture with %
    if (mixture.length === 0) {
        return (
            <h1 className="text-2xl font-semibold mb-4">
                Select a Gas Mixture
            </h1>
        )
    }
    const mixtureString = componentNamesToKeys(
        mixture.map(
            component => `${component.weight.toFixed(1)}% ${component.name}`
        )
    )

    const gasComponents: GasComponent[] = []
    for (let i = 0; i < mixture.length; i++) {
        gasComponents.push({
            name: mixture[i].name,
            weight: mixture[i].weight
        })
    }
    const key = componentsNamesAndWeightsToKey(gasComponents)
    const urlJson: string | undefined = dataUrlMap.get(key)
    // remove the last .json
    const urlGasFile: string | undefined = urlJson?.slice(0, -5)

    return (
        <div className="flex flex-col items-center">
            <h1 className="text-2xl font-semibold">{mixtureString}</h1>
            <div className="flex text-lg">
                {urlGasFile && (
                    <a href={urlGasFile} target="_blank" className="m-2">
                        Gas File
                    </a>
                )}
                {urlJson && (
                    <a href={urlJson} target="_blank" className="m-2">
                        JSON
                    </a>
                )}
            </div>
        </div>
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

    const [dataUrlMap, setDataUrlMap] = useState<Map<string, string>>(new Map())
    const [dataMap, setDataMap] = useState<Map<string, any>>(new Map())
    useEffect(() => {
        const initialUpdate = async () => {
            const componentNamesFromList = new Set<string>()
            const mixturesMap: Map<string, number[][]> = new Map()
            const dataUrlMap: Map<string, string> = new Map()
            const list = await axios.get("gas/list.json")
            const data = list.data
            for (const mixture of data) {
                const labels = mixture.components.labels.sort()
                // add labels to the set
                for (const label of labels) {
                    componentNamesFromList.add(label)
                }
                // add the composition to the map
                const mapKey = componentNamesToKeys(labels)
                // check if key is already in the map
                if (!mixturesMap.has(mapKey)) {
                    mixturesMap.set(mapKey, [mixture.components.fractions])
                } else {
                    mixturesMap.get(mapKey)?.push(mixture.components.fractions)
                }

                const gasComponents: GasComponent[] = []
                for (let i = 0; i < labels.length; i++) {
                    gasComponents.push({
                        name: labels[i],
                        weight: mixture.components.fractions[i] * 100
                    })
                }

                const key = componentsNamesAndWeightsToKey(gasComponents)
                dataUrlMap.set(key, mixture.url)
            }

            setDataUrlMap(dataUrlMap)

            setMixtures(mixturesMap)
            setComponentOptions(
                Array.from(componentNamesFromList)
                    .sort()
                    .map(name => ({
                        value: name,
                        label: componentNameToLabel(name),
                        isDisabled: false
                    }))
            )
        }

        initialUpdate().then(r => {
        })
    }, [])

    const [components, setComponents] = useState<GasComponent[]>([])
    const [componentOptions, setComponentOptions] = useState<
        MixtureComponentOption[]
    >([])

    const [firstRender, setFirstRender] = useState(true)
    useEffect(() => {
        if (!firstRender) {
            return
        }
        if (componentOptions.length === 0) {
            return
        }
        handleGasMixtureChange([])
        setFirstRender(false)
    }, [componentOptions, firstRender])

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
                updatedGasComponents.push({name: mixture, weight: 0})
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
            option.isDisabled =
                mixtures.get(componentNamesToKeys(potentialMixture)) ===
                undefined
        }
        // TODO: this currently works but may not work in all cases: If we have "Ar" and "Ar + CH4 + C4H10" but not "Ar + CH4" or "Ar + C4H10", then the chain is broken at some point
        setComponentOptions(updatedOptions)

        const mixtureName = componentNamesToKeys(selectedMixtures)
        setSelectedMixture(mixtureName)
        const availableFractions = mixtures.get(mixtureName)

        if (availableFractions === undefined) {
            updatedGasComponents = []
        }

        // set weights to the first available fractions
        updatedGasComponents.forEach((component, index) => {
            if (availableFractions) {
                component.weight = availableFractions[0][index] * 100
            }
        })

        setComponents(updatedGasComponents)
    }

    useEffect(() => {
        const gasComponents: GasComponent[] = []
        for (let i = 0; i < components.length; i++) {
            gasComponents.push({
                name: components[i].name,
                weight: components[i].weight
            })
        }
        const key = componentsNamesAndWeightsToKey(gasComponents)
        const url: string | undefined = dataUrlMap.get(key)
        if (url !== undefined) {
            // check if data is already in the map
            if (!dataMap.has(key)) {
                const fetchData = async () => {
                    const result = await axios.get(url)
                    setDataMap(dataMap.set(key, result.data))
                    // TODO: if too large, remove some elements
                }
                fetchData().then(r => {
                    onSelect(dataMap.get(key))
                })
            } else {
                onSelect(dataMap.get(key))
            }
        } else {
            onSelect(null)
        }
    }, [components])

    const handleCompositionChange = (target: number, index: number) => {
        const availableFractions = mixtures.get(selectedMixture)
        const availableValues = availableFractions?.map(
            fractions => fractions[index] * 100
        )

        const updatedGasComponents = [...components]
        const tentativeWeight = target
        const oldWeight = updatedGasComponents[index].weight

        // set new weight to the closest available value
        let newWeight = availableValues?.reduce((prev, curr) =>
            Math.abs(curr - tentativeWeight) < Math.abs(prev - tentativeWeight)
                ? curr
                : prev
        )
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
    }

    return (
        <div
            className="w-full max-w-screen-sm mx-auto my-4 p-4 bg-white rounded-lg shadow-lg flex flex-col items-center">
            <GasMixtureTitle mixture={components} dataUrlMap={dataUrlMap}/>
            <Select
                className={"w-full mb-4"}
                isMulti
                options={componentOptions}
                onChange={handleGasMixtureChange}
                value={componentOptions.filter(option =>
                    components
                        .map(component => component.name)
                        .includes(option.value)
                )}
            />
            <div className="flex">
                {components.map((component, index) => (
                    <div key={index} className="m-4 flex flex-col items-center">
                        <label className="m-2 block font-semibold whitespace-no-wrap">
                            {component.name}
                        </label>
                        <input
                            className={
                                "m-2 w-64 appearance-auto bg-gray-300 h-2 rounded-lg"
                            }
                            type="range"
                            min="0"
                            max="1000"
                            step="1"
                            value={component.weight * 10.0}
                            onChange={event => {
                                handleCompositionChange(
                                    parseFloat(event.target.value) / 10.0,
                                    index
                                )
                            }}
                        />
                        <div className="flex items-center">
                            <input
                                className="m-2 w-16 text-right bg-transparent border-none focus:outline-none"
                                type="number"
                                min="0"
                                max="100"
                                step="0.5"
                                value={component.weight.toFixed(1)}
                                onChange={event => {
                                    handleCompositionChange(
                                        parseFloat(event.target.value),
                                        index
                                    )
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
