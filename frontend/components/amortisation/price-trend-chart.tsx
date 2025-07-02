"use client"

import {
    LineChart, Line, XAxis, YAxis, CartesianGrid,
    ResponsiveContainer, Tooltip,
} from "recharts"
import { DEMO } from "@/app/fakeData"
import { Cat } from "@/app/types/categories"

export function PriceTrendChart({
                                    canton, category,
                                }: { canton:string; category:Cat }) {
    const data = DEMO[canton][category].trend.map(t=>({
        year: t.year,
        price: +(t.total / 100).toFixed(3),   // CHF/kWh
    }))

    return (
        <ResponsiveContainer width="100%" height={260}>
            <LineChart data={data} margin={{ left: 40 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis
                    unit=" CHF/kWh"
                    tickFormatter={(v)=>v.toFixed(2)}
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
