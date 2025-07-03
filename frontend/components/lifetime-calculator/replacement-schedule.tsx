"use client"

import React from "react"
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card"
import { CalendarDays, AlertCircle, CheckCircle } from "lucide-react"

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

    // Combine and sort schedules
    const combinedSchedule = [...selectedSchedule, ...baselineSchedule]
        .sort((a, b) => a.year - b.year)

    // Calculate totals over 20 years
    const selectedTotal = selectedSchedule.reduce((sum, item) => sum + item.cost, 0)
    const baselineTotal = baselineSchedule.reduce((sum, item) => sum + item.cost, 0)

    // Environmental impact calculations
    const environmentalImpact = React.useMemo(() => {
        const co2PerKWh = 0.1 // kg CO2 per kWh (Swiss electricity mix estimate)
        const analysisYears = 20
        
        // Selected lamp energy over 20 years
        const selectedReplacements = selectedSchedule.length - 1 // Exclude initial installation
        const selectedTotalYears = analysisYears
        const selectedEnergyConsumption = (selectedTube.watt * runtimeHours * selectedTotalYears) / 1000 // kWh
        const selectedCo2Emissions = selectedEnergyConsumption * co2PerKWh
        
        // Baseline lamp energy over 20 years
        const baselineReplacements = baselineSchedule.length - 1 // Exclude initial installation
        const baselineTotalYears = analysisYears
        const baselineEnergyConsumption = (baseline.watt * runtimeHours * baselineTotalYears) / 1000 // kWh
        const baselineCo2Emissions = baselineEnergyConsumption * co2PerKWh
        
        return {
            selectedCo2: selectedCo2Emissions.toFixed(1),
            baselineCo2: baselineCo2Emissions.toFixed(1),
            energySavings: (baselineEnergyConsumption - selectedEnergyConsumption).toFixed(0),
            co2Savings: (baselineCo2Emissions - selectedCo2Emissions).toFixed(1),
            selectedReplacements,
            baselineReplacements,
        }
    }, [selectedTube, baseline, runtimeHours, selectedSchedule.length, baselineSchedule.length])

    return (
        <Card>
            <CardHeader>
                <CardTitle>Ersatzplan & Umweltbilanz</CardTitle>
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

                {/* Replacement Schedule */}
                <div>
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                        <CalendarDays className="h-4 w-4" />
                        Ersatzplan (20 Jahre)
                    </h4>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                        {combinedSchedule.map((item, index) => (
                            <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-2">
                                        {item.type === 'installation' && <CheckCircle className="h-4 w-4 text-green-500" />}
                                        {item.type === 'replacement' && <AlertCircle className="h-4 w-4 text-orange-500" />}
                                        <span className="font-medium">{item.year}</span>
                                    </div>
                                    <div>
                                        <div className="text-sm">{item.description}</div>
                                        <div className="text-xs text-muted-foreground">
                                            {item.cost} CHF
                                        </div>
                                    </div>
                                </div>
                                <div className={`text-xs px-2 py-1 rounded ${
                                    item.lampType === 'selected' 
                                        ? 'bg-blue-100 text-blue-800' 
                                        : 'bg-gray-100 text-gray-800'
                                }`}>
                                    {item.lampType === 'selected' ? 'Gewählt' : 'Standard'}
                                </div>
                            </div>
                        ))}
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
                    <strong>Hinweis:</strong> CO₂-Werte basieren auf einer Schätzung von 0.1 kg CO₂/kWh für den Schweizer Strommix 
                    und dienen nur zur Veranschaulichung.
                </div>
            </CardContent>
        </Card>
    )
}