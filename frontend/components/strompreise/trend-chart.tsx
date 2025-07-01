"use client"

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts"

const COLORS = [
    "#1d4ed8", // blau
    "#16a34a", // grün
    "#c026d3", // violet
    "#ea580c", // orange
    "#dc2626", // rot
]

export function TrendChart({
                               data,
                               cantons,
                           }: {
    data: any[]
    cantons: string[]
}) {
    return (
        <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis unit=" Rp." />
                <Tooltip />
                <Legend />
                {cantons.map((c, idx) => (
                    <Line
                        key={c}
                        type="monotone"
                        dataKey={c}
                        stroke={COLORS[idx % COLORS.length]}
                        strokeWidth={2}
                        dot={{ r: 2 }}
                    />
                ))}
            </LineChart>
        </ResponsiveContainer>
    )
}
