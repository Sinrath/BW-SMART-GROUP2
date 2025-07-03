"use client"

import {
    LineChart, Line, XAxis, YAxis, CartesianGrid,
    ResponsiveContainer, Tooltip,
} from "recharts"
import { useElectricityData } from "@/app/hooks/useElectricityData"
import { Cat } from "@/app/types/categories"

export function PriceTrendChart({
                                    canton, category,
                                }: { canton:string; category:Cat }) {
    const { data: DEMO } = useElectricityData()
    
    if (!DEMO || !DEMO[canton]?.[category]?.trend) {
        return <div className="flex h-60 items-center justify-center text-muted-foreground">Keine Daten verfügbar</div>
    }
    
    const data = DEMO[canton][category].trend.map(t=>({
        year: t.year,
        price: +(t.total / 100).toFixed(3),   // CHF/kWh
    }))

    return (
        <ResponsiveContainer width="100%" height={260}>
            <LineChart data={data} margin={{ left: 50, right: 30, top: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis
                    tickFormatter={(v)=>v.toFixed(2)}
                    label={{ value: 'CHF/kWh', angle: -90, position: 'insideLeft' }}
                    domain={['dataMin', 'auto']}
                    tickCount={5}
                />
                <Tooltip
                    formatter={(v:number)=> [`${v} CHF/kWh`]}
                    labelFormatter={(l)=>`Jahr ${l}`}
                />
                <Line
                    dataKey="price"
                    stroke="#14b8a6"
                    strokeWidth={2}
                    dot
                />
            </LineChart>
        </ResponsiveContainer>
    )
}
