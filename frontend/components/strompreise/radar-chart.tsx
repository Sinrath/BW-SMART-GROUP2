"use client"

import {
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Radar,
    ResponsiveContainer,
    Legend,
    Tooltip,
} from "recharts"
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card"
import { useElectricityData } from "@/app/hooks/useElectricityData"
import { Cat } from "@/app/types/categories";

/* bis zu 5 Farben – Lucide/ shadcn-Palette */
const COLORS = ["#2563eb", "#10b981", "#f59e0b", "#c026d3", "#dc2626"]

export function RadarCard({
                              cantons,
                              category,
                          }: {
    cantons: string[]
    category: Cat
}) {
    const { data: DEMO } = useElectricityData()
    if (!cantons.length || !DEMO || Object.keys(DEMO).length === 0) return null

    /* Daten → %-Anteile jeder Komponente je Kanton */
    const keys = ["Energy", "Gridusage", "Charge", "Aidfee"]
    const series = cantons.slice(0, COLORS.length)
    const data = keys.map((k) => {
        const row: {component: string; [key: string]: string | number} = { component: k }
        series.forEach((c) => {
            const comp = DEMO[c]?.[category]?.comp24
            if (!comp) return
            
            const sum = comp.energy + comp.gridusage + comp.charge + comp.aidfee
            const part =
                k === "Energy"
                    ? comp.energy
                    : k === "Gridusage"
                        ? comp.gridusage
                        : k === "Charge"
                            ? comp.charge
                            : comp.aidfee
            row[c] = +((part / sum) * 100).toFixed(1)
        })
        return row
    })

    return (
        <Card>
            <CardHeader>
                <CardTitle>Komponenten-Profil&nbsp;(% Anteile)</CardTitle>
                <CardDescription>
                    Vergleicht die Kosten­struktur der ausgewählten Kantone
                </CardDescription>
            </CardHeader>

            <CardContent className="h-[360px]">
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={data}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="component" />
                        <PolarRadiusAxis
                            angle={30}
                            domain={[0, 100]}
                            tickFormatter={(v) => `${v}%`}
                        />
                        <Tooltip formatter={(v) => `${v}%`} />
                        <Legend />
                        {series.map((c, i) => (
                            <Radar
                                key={c}
                                name={c}
                                dataKey={c}
                                stroke={COLORS[i]}
                                fill={COLORS[i]}
                                fillOpacity={0.25}
                            />
                        ))}
                    </RadarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}
