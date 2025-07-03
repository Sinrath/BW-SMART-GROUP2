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
    lamps:    { id:string; label:string; price:number; watt:number; originalWatt:number; efficiency:number }[]
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
                // l.watt is already the effective wattage, l.originalWatt is the original
                const savings = baseline.watt - l.watt
                return (
                    <LampCard
                        key={l.id}
                        title={l.label}
                        rows={[
                            `Preis: ${l.price} CHF`,
                            `Leistung: ${l.originalWatt} W`,
                            `Effizienz: ${l.efficiency}% (${l.watt.toFixed(1)} W)`,
                            `Ersparnis: ${savings.toFixed(1)}W (ggü. Standard)`,
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
