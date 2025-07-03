"use client"

import React from "react"
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card"
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Legend,
} from "recharts"

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

interface LifetimeComparisonChartProps {
    selectedTube: LedTube
    baseline: LedTube
    installYear: number
    lifetimeYears: number
    electricityPrices: PriceData[]
    runtimeHours: number
}

export function LifetimeComparisonChart({
    selectedTube,
    baseline,
    installYear,
    lifetimeYears,
    electricityPrices,
    runtimeHours,
}: LifetimeComparisonChartProps) {
    const endYear = installYear + lifetimeYears

    // Generate year-by-year cost data
    const chartData = React.useMemo(() => {
        const data = []
        let selectedCumulativeCost = selectedTube.price
        let baselineCumulativeCost = baseline.price

        for (let year = installYear; year <= endYear; year++) {
            const priceDataForYear = electricityPrices.find(p => p.year === year)
            
            if (priceDataForYear && year > installYear) {
                const electricityPricePerKWh = priceDataForYear.total / 100 // CHF/kWh
                
                // Calculate yearly electricity costs
                const selectedYearlyElectricity = (selectedTube.watt * runtimeHours / 1000) * electricityPricePerKWh
                const baselineYearlyElectricity = (baseline.watt * runtimeHours / 1000) * electricityPricePerKWh
                
                selectedCumulativeCost += selectedYearlyElectricity
                baselineCumulativeCost += baselineYearlyElectricity
            }

            data.push({
                year,
                [selectedTube.name]: Math.round(selectedCumulativeCost),
                [baseline.name]: Math.round(baselineCumulativeCost),
                savings: Math.round(baselineCumulativeCost - selectedCumulativeCost),
            })
        }

        return data
    }, [selectedTube, baseline, installYear, electricityPrices, runtimeHours, endYear])

    const formatTooltip = (value: number, name: string) => {
        if (name === 'savings') {
            return [`${value >= 0 ? '+' : ''}${value} CHF`, 'Einsparungen']
        }
        return [`${value} CHF`, name]
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Kostenvergleich über die Lebensdauer</CardTitle>
                <CardDescription>
                    Kumulative Kosten (Anschaffung + Strom) von {installYear} bis {Math.round(endYear)}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                            data={chartData}
                            margin={{
                                top: 10,
                                right: 30,
                                left: 0,
                                bottom: 0,
                            }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis 
                                dataKey="year"
                                tick={{ fontSize: 12 }}
                            />
                            <YAxis 
                                tick={{ fontSize: 12 }}
                                tickFormatter={(value) => `${value} CHF`}
                            />
                            <Tooltip 
                                formatter={formatTooltip}
                                labelFormatter={(label) => `Jahr ${label}`}
                            />
                            <Legend />
                            <Area
                                type="monotone"
                                dataKey={baseline.name}
                                stackId="1"
                                stroke="#94a3b8"
                                fill="#94a3b8"
                                fillOpacity={0.6}
                            />
                            <Area
                                type="monotone"
                                dataKey={selectedTube.name}
                                stackId="2"
                                stroke="#2563eb"
                                fill="#2563eb"
                                fillOpacity={0.6}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
                
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="text-center">
                        <div className="font-medium">Anfangskosten</div>
                        <div className="text-muted-foreground">
                            {selectedTube.name}: {selectedTube.price} CHF
                        </div>
                        <div className="text-muted-foreground">
                            {baseline.name}: {baseline.price} CHF
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="font-medium">Endkosten</div>
                        <div className="text-muted-foreground">
                            {selectedTube.name}: {chartData[chartData.length - 1]?.[selectedTube.name]} CHF
                        </div>
                        <div className="text-muted-foreground">
                            {baseline.name}: {chartData[chartData.length - 1]?.[baseline.name]} CHF
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="font-medium">Gesamteinsparung</div>
                        <div className={`font-bold ${chartData[chartData.length - 1]?.savings >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {chartData[chartData.length - 1]?.savings >= 0 ? '+' : ''}
                            {chartData[chartData.length - 1]?.savings} CHF
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}