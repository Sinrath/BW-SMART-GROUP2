"use client"

import {
    Card, CardHeader, CardContent, CardTitle,
} from "@/components/ui/card"
import clsx from "clsx"

export function StatsCard({
                              lamps,
                              baseline,
                              breakEvens,
                              className,
                          }: {
    lamps: { id:string; label:string; price:number; watt:number }[]
    baseline: { price:number; watt:number }
    breakEvens: Record<string, number|null>
    className?: string
}) {
    const savePct = (w:number)=> +(100*(1 - w / baseline.watt)).toFixed(0)

    return (
        <Card className={clsx(className)}>
            <CardHeader>
                <CardTitle>Smart-LED Statistik</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
                {lamps.map((l)=>(
                    <div key={l.id} className="space-y-1">
                        <p className="font-medium">{l.label}</p>
                        <p>▪ Preis: {l.price} CHF</p>
                        <p>▪ Leistung: {l.watt} W&nbsp;
                            (-{savePct(l.watt)} % vs. LED)</p>
                        <p>
                            ▪ Amortisation:&nbsp;
                            {breakEvens[l.id] !== null
                                ? `${breakEvens[l.id]} J`
                                : "≥ 15 J"}
                        </p>
                    </div>
                ))}
            </CardContent>
        </Card>
    )
}
