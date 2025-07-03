"use client"

import {
    Card, CardHeader, CardContent, CardTitle,
} from "@/components/ui/card"

function LampCard({ title, rows }: { title:string; rows:string[] }) {
    return (
        <Card className="w-full">
            <CardHeader><CardTitle>{title}</CardTitle></CardHeader>
            <CardContent className="text-sm">
                <ul className="ml-4 list-disc space-y-1">
                    {rows.map((r,i)=> <li key={i}>{r}</li>)}
                </ul>
            </CardContent>
        </Card>
    )
}

/* ---------- Grid ---------- */
export function LampCardGrid({
                                 baseline,
                                 lamps,
                                 breakEvens,
                                 maxYears,
                             }: {
    baseline: { price:number; watt:number }
    lamps:    { id:string; label:string; price:number; watt:number }[]
    breakEvens: Record<string,number|null>
    maxYears: number
}) {
    const style: React.CSSProperties = {
        gridTemplateColumns: "repeat(auto-fit,minmax(16rem,1fr))",
    }

    return (
        <div className="grid gap-4" style={style}>
            <LampCard
                title="Standard-LED"
                rows={[
                    `Preis: ${baseline.price} CHF`,
                    `Leistung: ${baseline.watt} W`,
                ]}
            />

            {lamps.map(l=>{
                const savings = baseline.watt - l.watt
                const savingsPercent = ((savings / baseline.watt) * 100).toFixed(1)
                return (
                    <LampCard
                        key={l.id}
                        title={l.label}
                        rows={[
                            `Preis: ${l.price} CHF`,
                            `Leistung: ${l.watt} W`,
                            `Ersparnis: ${savings}W (${savingsPercent}%)`,
                            `Amortisation: ${
                                breakEvens[l.id]!==null
                                    ? `${breakEvens[l.id]!.toFixed(1)} J`
                                    : `≥ ${maxYears.toFixed(1)} J`
                            }`,
                        ]}
                    />
                )
            })}
        </div>
    )
}
