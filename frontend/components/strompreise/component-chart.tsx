"use client"

import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts"

const COLORS = {
    energy: "#2563eb",
    gridusage: "#10b981",
    charge: "#f59e0b",
    aidfee: "#ef4444",
}

const LABELS: Record<string, string> = {
    energy: "Energy – Energiepreis",
    gridusage: "Gridusage – Netznutzung",
    charge: "Charge – Abgaben/Gebühren",
    aidfee: "Aidfee – Netzzuschlag-Abgabe",
}

export function ComponentChart({
                                   data,
                               }: {
    data: { aidfee: number; charge: number; gridusage: number; energy: number }
}) {
    const chartData = [{ name: "Preis", ...data }]
    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis unit=" Rp." />
                <Tooltip
                    formatter={(value: number, key: string) => [`${value} Rp.`, LABELS[key]]}
                />
                <Legend formatter={(val) => LABELS[val as string].split(" – ")[0]} />
                {Object.keys(data).map((k) => (
                    <Bar key={k} dataKey={k} stackId="a" fill={COLORS[k as keyof typeof COLORS]} />
                ))}
            </BarChart>
        </ResponsiveContainer>
    )
}
