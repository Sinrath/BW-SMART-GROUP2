"use client"

import React from "react"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Lightbulb, Zap, DollarSign, Calendar, TrendingDown, Clock } from "lucide-react"

interface LedTube {
    id: number
    name: string
    brand: string
    price: number
    watt: number
    efficiency: number
    isBaseline: boolean
}

interface PriceData {
    year: number
    total: number
}

interface LifetimeStatsGridProps {
    selectedTube: LedTube
    baseline: LedTube
    installYear: number
    lifetimeYears: number
    electricityPrices: PriceData[]
    runtimeHours: number
}

export function LifetimeStatsGrid({
    selectedTube,
    baseline,
    installYear,
    lifetimeYears,
    electricityPrices,
    runtimeHours,
}: LifetimeStatsGridProps) {
    const endYear = installYear + lifetimeYears
    
    // Calculate total electricity costs over lifetime
    const calculateElectricityCost = (tube: LedTube) => {
        let totalCost = 0
        // Apply efficiency reduction for smart LEDs
        const effectiveWatt = tube.efficiency > 0 ? tube.watt * (1 - tube.efficiency / 100) : tube.watt
        
        // Use same year range as chart: installYear to endYear
        for (let year = installYear; year <= endYear; year++) {
            const priceDataForYear = electricityPrices.find(p => p.year === year)
            
            // Add electricity costs only after the first year (same logic as chart)
            if (priceDataForYear && year > installYear) {
                const yearlyConsumption = (effectiveWatt * runtimeHours) / 1000 // kWh
                const yearlyPrice = priceDataForYear.total / 100 // CHF/kWh
                totalCost += yearlyConsumption * yearlyPrice
            }
        }
        return totalCost
    }

    const selectedElectricityCost = calculateElectricityCost(selectedTube)
    const baselineElectricityCost = calculateElectricityCost(baseline)
    const totalSelectedCost = selectedTube.price + selectedElectricityCost
    const totalBaselineCost = baseline.price + baselineElectricityCost
    const lifetimeSavings = totalBaselineCost - totalSelectedCost
    const energySavings = (baseline.watt - selectedTube.watt) * runtimeHours * lifetimeYears / 1000 // kWh
    const paybackPeriod = lifetimeSavings > 0 ? (selectedTube.price - baseline.price) / ((baselineElectricityCost - selectedElectricityCost) / lifetimeYears) : null

    const isSmartLED = !selectedTube.isBaseline

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Ausgewählte Lampe</CardTitle>
                    <Lightbulb className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{selectedTube.name}</div>
                    <div className="text-sm text-muted-foreground space-y-1">
                        <div>Preis: {selectedTube.price} CHF</div>
                        <div>Leistung: {selectedTube.watt} W</div>
                        {isSmartLED && (
                            <>
                                <div>Effizienz: {selectedTube.efficiency}% ({(selectedTube.watt * (1 - selectedTube.efficiency / 100)).toFixed(1)} W)</div>
                                <div>Ersparnis: {(baseline.watt - selectedTube.watt).toFixed(1)}W (ggü. Standard)</div>
                            </>
                        )}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Lebensdauer</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{lifetimeYears.toFixed(1)} Jahre</div>
                    <div className="text-sm text-muted-foreground space-y-1">
                        <div>Einbau: {installYear}</div>
                        <div>Ersatz: {Math.round(endYear)}</div>
                        <div>50,000 Betriebsstunden</div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Gesamtkosten</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{totalSelectedCost.toFixed(2)} CHF</div>
                    <div className="text-sm text-muted-foreground space-y-1">
                        <div>Anschaffung: {selectedTube.price} CHF</div>
                        <div>Strom: {selectedElectricityCost.toFixed(2)} CHF</div>
                        <div>Über {lifetimeYears.toFixed(1)} Jahre</div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Energieverbrauch</CardTitle>
                    <Zap className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{(selectedTube.watt * runtimeHours * lifetimeYears / 1000).toFixed(0)} kWh</div>
                    <div className="text-sm text-muted-foreground space-y-1">
                        <div>Jährlich: {(selectedTube.watt * runtimeHours / 1000).toFixed(0)} kWh</div>
                        <div>Täglich: {(selectedTube.watt * runtimeHours / 365 / 1000).toFixed(1)} kWh</div>
                        <div>Über die Lebensdauer</div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Einsparungen</CardTitle>
                    <TrendingDown className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {lifetimeSavings >= 0 ? '+' : ''}{lifetimeSavings.toFixed(2)} CHF
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                        <div>Energie: {energySavings.toFixed(0)} kWh</div>
                        <div>Vs. Standard LED</div>
                        <div>
                            {lifetimeSavings >= 0 ? (
                                <Badge variant="default" className="bg-green-100 text-green-800">
                                    Rentabel
                                </Badge>
                            ) : (
                                <Badge variant="secondary" className="bg-red-100 text-red-800">
                                    Teurer
                                </Badge>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Amortisation</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {paybackPeriod !== null && paybackPeriod > 0 && paybackPeriod < lifetimeYears
                            ? `${paybackPeriod.toFixed(1)} Jahre`
                            : selectedTube.price <= baseline.price
                            ? "Sofort"
                            : "Nie"
                        }
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                        <div>
                            {paybackPeriod !== null && paybackPeriod > 0 && paybackPeriod < lifetimeYears
                                ? `In ${Math.round(installYear + paybackPeriod)}`
                                : selectedTube.price <= baseline.price
                                ? "Günstiger ab Tag 1"
                                : "Amortisiert sich nicht"
                            }
                        </div>
                        <div>Über die Lebensdauer</div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}