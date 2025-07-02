"use client"

import {
    Card, CardHeader, CardContent, CardTitle,
} from "@/components/ui/card"

export function LedStatsCard({
                                 lamps,
                                 baseline,
                                 breakEvens,
                                 className,
                             }: {
    lamps: { id: string; label: string; price: number; watt: number }[]
    baseline: { price: number; watt: number }
    breakEvens: Record<string, number | null>
    className?: string
}) {
    return (
        <Card className={className}>
            <CardHeader><CardTitle>LED vs. Smart-LED</CardTitle></CardHeader>
            <CardContent className="space-y-4 text-sm">
                <div>
                    <p className="font-medium">Standard-LED</p>
                    <ul className="ml-4 list-disc">
                        <li>Preis: {baseline.price} CHF</li>
                        <li>Leistung: {baseline.watt} W</li>
                    </ul>
                </div>

                {lamps.map((l)=>(
                    <div key={l.id}>
                        <p className="font-medium">{l.label}</p>
                        <ul className="ml-4 list-disc space-y-0.5">
                            <li>Preis: {l.price} CHF</li>
                            <li>
                                Leistung: {l.watt} W (
                                {Math.round((1-l.watt/baseline.watt)*100)} % ggü. LED)
                            </li>
                            <li>
                                Amortisation:&nbsp;
                                {breakEvens[l.id]!==null
                                    ? `${breakEvens[l.id]!.toFixed(1)} J`
                                    : "≥ 15 J"}
                            </li>
                        </ul>
                    </div>
                ))}
            </CardContent>
        </Card>
    )
}
