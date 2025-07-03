"use client"

import React from "react"
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card"

interface LedTube {
    id: number
    name: string
    brand: string
    price: number
    watt: number
    efficiency: number
    lifetime: number
    isBaseline: boolean
}

interface ReplacementScheduleProps {
    selectedTube: LedTube
    baseline: LedTube
    installYear: number
    runtimeHours: number
}

export function ReplacementSchedule({
    selectedTube,
    baseline,
    installYear,
    runtimeHours,
}: ReplacementScheduleProps) {
    const selectedLifetimeYears = selectedTube.lifetime / runtimeHours
    const baselineLifetimeYears = baseline.lifetime / runtimeHours

    // Calculate replacement schedules for both lamps
    const selectedSchedule = React.useMemo(() => {
        const schedule = []
        let currentInstallYear = installYear
        let replacementNumber = 0

        // Add initial installation
        schedule.push({
            year: currentInstallYear,
            type: 'installation',
            description: `${selectedTube.name} - Installation`,
            cost: selectedTube.price,
            lampType: 'selected',
            replacementNumber: 0,
        })

        // Add replacements every lifetime years
        while (currentInstallYear < installYear + 20) { // Show 20 years ahead
            currentInstallYear += selectedLifetimeYears
            replacementNumber++
            
            if (currentInstallYear <= installYear + 20) {
                schedule.push({
                    year: Math.round(currentInstallYear),
                    type: 'replacement',
                    description: `${selectedTube.name} - Ersatz #${replacementNumber}`,
                    cost: selectedTube.price,
                    lampType: 'selected',
                    replacementNumber,
                })
            }
        }

        return schedule
    }, [selectedTube, installYear, selectedLifetimeYears])

    const baselineSchedule = React.useMemo(() => {
        const schedule = []
        let currentInstallYear = installYear
        let replacementNumber = 0

        // Add initial installation
        schedule.push({
            year: currentInstallYear,
            type: 'installation',
            description: `${baseline.name} - Installation`,
            cost: baseline.price,
            lampType: 'baseline',
            replacementNumber: 0,
        })

        // Add replacements every lifetime years
        while (currentInstallYear < installYear + 20) { // Show 20 years ahead
            currentInstallYear += baselineLifetimeYears
            replacementNumber++
            
            if (currentInstallYear <= installYear + 20) {
                schedule.push({
                    year: Math.round(currentInstallYear),
                    type: 'replacement',
                    description: `${baseline.name} - Ersatz #${replacementNumber}`,
                    cost: baseline.price,
                    lampType: 'baseline',
                    replacementNumber,
                })
            }
        }

        return schedule
    }, [baseline, installYear, baselineLifetimeYears])


    // Calculate totals over 20 years
    const selectedTotal = selectedSchedule.reduce((sum, item) => sum + item.cost, 0)
    const baselineTotal = baselineSchedule.reduce((sum, item) => sum + item.cost, 0)

    // Environmental impact calculations
    const environmentalImpact = React.useMemo(() => {
        const co2PerKWh = 0.1 // kg CO2 per kWh (Swiss electricity mix estimate)
        const manufacturingCO2PerLED = 2.0 // kg CO2 per LED manufacturing (estimate)
        const analysisYears = 20
        
        // Calculate total LED units needed over 20 years (including initial + replacements)
        const selectedTotalLEDs = selectedSchedule.length // Initial + replacements
        const baselineTotalLEDs = baselineSchedule.length // Initial + replacements
        
        // Apply efficiency reduction for energy consumption calculation
        const selectedEffectiveWatt = selectedTube.efficiency > 0 ? selectedTube.watt * (1 - selectedTube.efficiency / 100) : selectedTube.watt
        const baselineEffectiveWatt = baseline.efficiency > 0 ? baseline.watt * (1 - baseline.efficiency / 100) : baseline.watt
        
        // Energy consumption over 20 years (continuous operation with efficiency applied)
        const selectedEnergyConsumption = (selectedEffectiveWatt * runtimeHours * analysisYears) / 1000 // kWh
        const baselineEnergyConsumption = (baselineEffectiveWatt * runtimeHours * analysisYears) / 1000 // kWh
        
        // CO2 from energy consumption
        const selectedEnergyCO2 = selectedEnergyConsumption * co2PerKWh
        const baselineEnergyCO2 = baselineEnergyConsumption * co2PerKWh
        
        // CO2 from LED manufacturing (all LEDs needed over 20 years)
        const selectedManufacturingCO2 = selectedTotalLEDs * manufacturingCO2PerLED
        const baselineManufacturingCO2 = baselineTotalLEDs * manufacturingCO2PerLED
        
        // Total CO2 impact = Energy + Manufacturing
        const selectedTotalCO2 = selectedEnergyCO2 + selectedManufacturingCO2
        const baselineTotalCO2 = baselineEnergyCO2 + baselineManufacturingCO2
        
        return {
            selectedCo2: selectedTotalCO2.toFixed(1),
            baselineCo2: baselineTotalCO2.toFixed(1),
            energySavings: (baselineEnergyConsumption - selectedEnergyConsumption).toFixed(0),
            co2Savings: (baselineTotalCO2 - selectedTotalCO2).toFixed(1),
            selectedReplacements: selectedTotalLEDs - 1, // Exclude initial installation for display
            baselineReplacements: baselineTotalLEDs - 1, // Exclude initial installation for display
            selectedEnergyCO2: selectedEnergyCO2.toFixed(1),
            selectedManufacturingCO2: selectedManufacturingCO2.toFixed(1),
            baselineEnergyCO2: baselineEnergyCO2.toFixed(1),
            baselineManufacturingCO2: baselineManufacturingCO2.toFixed(1),
        }
    }, [selectedTube, baseline, runtimeHours, selectedSchedule.length, baselineSchedule.length])

    return (
        <Card>
            <CardHeader>
                <CardTitle>Lebensdauer & Umweltbilanz</CardTitle>
                <CardDescription>
                    Vergleich der Lebensdauer und Umweltauswirkungen über 20 Jahre
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Lifetime Comparison */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-sm text-blue-600">Gewählte Lampe</div>
                        <div className="text-lg font-bold text-blue-800">
                            {selectedLifetimeYears.toFixed(1)} Jahre
                        </div>
                        <div className="text-xs text-blue-600">
                            {selectedTube.lifetime.toLocaleString()} Stunden
                        </div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-sm text-gray-600">Standard LED</div>
                        <div className="text-lg font-bold text-gray-800">
                            {baselineLifetimeYears.toFixed(1)} Jahre
                        </div>
                        <div className="text-xs text-gray-600">
                            {baseline.lifetime.toLocaleString()} Stunden
                        </div>
                    </div>
                </div>


                {/* Cost Summary */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-muted rounded-lg">
                        <div className="text-sm text-muted-foreground">Gewählte Lampe</div>
                        <div className="text-lg font-bold">{selectedTotal} CHF</div>
                        <div className="text-xs text-muted-foreground">
                            {environmentalImpact.selectedReplacements} Ersätze
                        </div>
                    </div>
                    <div className="text-center p-3 bg-muted rounded-lg">
                        <div className="text-sm text-muted-foreground">Standard LED</div>
                        <div className="text-lg font-bold">{baselineTotal} CHF</div>
                        <div className="text-xs text-muted-foreground">
                            {environmentalImpact.baselineReplacements} Ersätze
                        </div>
                    </div>
                </div>

                {/* Environmental Impact */}
                <div>
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                        <div className="h-4 w-4 bg-green-500 rounded-full" />
                        Umweltbilanz (20 Jahre)
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-3 bg-green-50 rounded-lg">
                            <div className="text-sm text-green-600">CO₂-Einsparung</div>
                            <div className="text-lg font-bold text-green-800">
                                {environmentalImpact.co2Savings} kg
                            </div>
                            <div className="text-xs text-green-600">
                                Vs. Standard LED
                            </div>
                        </div>
                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                            <div className="text-sm text-blue-600">Energieeinsparung</div>
                            <div className="text-lg font-bold text-blue-800">
                                {environmentalImpact.energySavings} kWh
                            </div>
                            <div className="text-xs text-blue-600">
                                Über 20 Jahre
                            </div>
                        </div>
                        <div className="text-center p-3 bg-purple-50 rounded-lg">
                            <div className="text-sm text-purple-600">Weniger Ersätze</div>
                            <div className="text-lg font-bold text-purple-800">
                                {environmentalImpact.baselineReplacements - environmentalImpact.selectedReplacements}
                            </div>
                            <div className="text-xs text-purple-600">
                                Weniger Abfall
                            </div>
                        </div>
                    </div>
                </div>

                <div className="text-xs text-muted-foreground bg-yellow-50 p-3 rounded">
                    <strong>Hinweis:</strong> CO₂-Werte basieren auf Schätzungen von 0.1 kg CO₂/kWh für den Schweizer Strommix 
                    und 2.0 kg CO₂ pro LED-Herstellung. Berechnung über 20 Jahre inklusive aller benötigten Ersatz-LEDs. 
                    Werte dienen nur zur Veranschaulichung.
                </div>
            </CardContent>
        </Card>
    )
}