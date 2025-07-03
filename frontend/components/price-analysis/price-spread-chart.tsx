"use client"

import {
    ComposedChart,
    Area,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts"
import { useElectricityData } from "@/app/hooks/useElectricityData"
import { Cat } from "@/app/types/categories";

export function PriceSpreadChart({
                                     cantons,
                                     category,
                                 }: {
    cantons: string[]
    category: Cat
}) {
    const { data: DEMO } = useElectricityData()
    if (!cantons.length || !DEMO || Object.keys(DEMO).length === 0) return null

    // Get years from the first available canton/category combination
    const years = (() => {
        for (const canton of cantons) {
            const categoryData = DEMO[canton]?.[category];
            if (categoryData?.trend?.length > 0) {
                return categoryData.trend.map((d) => d.year);
            }
        }
        // Fallback: get years from any available data
        for (const cantonKey of Object.keys(DEMO)) {
            for (const catKey of Object.keys(DEMO[cantonKey])) {
                const trend = DEMO[cantonKey][catKey]?.trend;
                if (trend?.length > 0) {
                    return trend.map((d) => d.year);
                }
            }
        }
        return [];
    })();

    /* Min/Max/Ø je Jahr berechnen */
    const data = years.map((year) => {
        let min = Infinity
        let max = -Infinity
        let sum = 0
        let count = 0

        cantons.forEach((c) => {
            const val = DEMO[c]?.[category].trend.find((t) => t.year === year)?.total
            if (val) {
                min = Math.min(min, val)
                max = Math.max(max, val)
                sum += val
                count++
            }
        })

        return {
            year,
            min: min === Infinity ? null : +min.toFixed(2),
            max: max === -Infinity ? null : +max.toFixed(2),
            avg: count ? +(sum / count).toFixed(2) : null,
            // Calculate the difference between max and min for proper stacking
            rangeDiff: (min === Infinity || max === -Infinity) ? null : +(max - min).toFixed(2)
        }
    })

    return (
        <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis unit=" Rp." />
                <Tooltip 
                    content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                            const data = payload[0].payload
                            return (
                                <div className="bg-white p-3 border rounded shadow">
                                    <p className="font-medium">{`Jahr: ${label}`}</p>
                                    <p style={{ color: '#ef4444' }}>{`Max: ${data.max?.toFixed(2) || 'N/A'} Rp/kWh`}</p>
                                    <p style={{ color: '#1d4ed8' }}>{`Durchschnitt: ${data.avg?.toFixed(2) || 'N/A'} Rp/kWh`}</p>
                                    <p style={{ color: '#22c55e' }}>{`Min: ${data.min?.toFixed(2) || 'N/A'} Rp/kWh`}</p>
                                </div>
                            )
                        }
                        return null
                    }}
                />
                {/* Base area starting from min */}
                <Area
                    type="monotone"
                    dataKey="min"
                    stroke="transparent"
                    fill="transparent"
                    stackId="1"
                />
                {/* Range area on top of min */}
                <Area
                    type="monotone"
                    dataKey="rangeDiff"
                    stroke="transparent"
                    fill="#93c5fd"
                    fillOpacity={0.2}
                    stackId="1"
                />
                {/* Ø-Linie */}
                <Line
                    type="monotone"
                    dataKey="avg"
                    stroke="#1d4ed8"
                    strokeWidth={2}
                    dot={{ r: 2 }}
                />
            </ComposedChart>
        </ResponsiveContainer>
    )
}
