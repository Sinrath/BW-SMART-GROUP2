"use client"

import React from "react"
import {
    Card, CardHeader, CardContent, CardTitle, CardDescription,
} from "@/components/ui/card"
import {Alert} from "@/components/ui/alert"
import {TriangleAlert} from "lucide-react"
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    Legend, ResponsiveContainer, LabelList,
} from "recharts"

import { useElectricityData } from "@/app/hooks/useElectricityData"
import { useLedTubeData } from "@/app/hooks/useLedTubeData"
import { ElectricityData } from "@/app/services/api"
import {Cat} from "@/app/types/categories"
import {
    FilterPanelScenarios
} from "@/components/szenarien/filter-panel-scenarios"

const LS_KEY = "scen-filter-v1"
const COLORS = ["#2563eb", "#10b981", "#f59e0b", "#c026d3"]
const MAX_YEARS = 15                    // Darstellungsgrenze

/* ––– LocalStorage ––– */
const loadLS = () => {
    if (typeof window === "undefined") return {}
    try {
        return JSON.parse(localStorage.getItem(LS_KEY) ?? "{}")
    } catch {
    }
}
const saveLS = (s: Record<string, unknown>) => localStorage.setItem(LS_KEY, JSON.stringify(s))

/* ––– Payback-Calc ––– */
interface BaseData {
    price: number;
    watt: number;
}

function payback(
    canton: string, cat: Cat, lamp: { price: number; watt: number },
    install: number, runtime: number, DEMO: ElectricityData, BASE: BaseData
) {
    const serie = DEMO[canton]?.[cat]?.trend
    if (!serie) return null
    const idx = serie.findIndex((t: { year: number }) => t.year === install)
    if (idx < 0) return null
    let led = BASE.price
    let smart = lamp.price
    for (let i = idx; i < serie.length; i++) {
        const p = serie[i].total / 100
        led += (BASE.watt * runtime) / 1000 * p
        smart += (lamp.watt * runtime) / 1000 * p
        if (smart <= led) {
            const rel = i - idx + 1   // voll­ständige Jahre
            return Math.min(rel, MAX_YEARS)
        }
    }
    return MAX_YEARS
}

export default function ScenarioPage() {
    const { data: DEMO, loading: electricityLoading, error: electricityError } = useElectricityData()
    const { tubes, baseline, loading: ledLoading, error: ledError } = useLedTubeData()
    
    /* ––– State ––– */
    const init = loadLS()
    const [cantons, setC] = React.useState<string[]>(init.cantons ?? ["ZH", "BE"])
    const [category, setCat] = React.useState<Cat>(init.category ?? "C3")
    const [lamps, setL] = React.useState<string[]>(init.lamps ?? ["budget", "econ"])
    const [install, setY] = React.useState<number>(init.year ?? 2021)
    const [runtime, setRt] = React.useState<number>(init.rt ?? 6000)

    React.useEffect(() => saveLS({
            cantons,
            category,
            lamps,
            year: install,
            rt: runtime
        }),
        [cantons, category, lamps, install, runtime])

    // Loading and error states
    if (electricityLoading || ledLoading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <div className="text-muted-foreground">Lade Daten...</div>
            </div>
        )
    }

    if (electricityError || ledError) {
        return (
            <Alert>
                <TriangleAlert className="h-4 w-4" />
                <div>
                    Fehler beim Laden der Daten:
                    {electricityError && <div>Strompreise: {electricityError}</div>}
                    {ledError && <div>LED-Daten: {ledError}</div>}
                </div>
            </Alert>
        )
    }

    // Transform LED tube data to match fake data structure
    const BASE = baseline ? { price: baseline.price, watt: baseline.watt } : { price: 20, watt: 18 }
    const LAMPS = tubes.filter(t => !t.isBaseline).reduce((acc, tube) => {
        const key = tube.name.toLowerCase().replace(/[^a-z]/g, '')
        acc[key] = {
            label: tube.name,
            price: tube.price,
            watt: tube.watt
        }
        return acc
    }, {} as Record<string, { label: string; price: number; watt: number }>)

    /* ––– Datensätze ––– */
    const rows = cantons.map((c) => {
        const obj: {
            canton: string;
            [key: string]: string | number | null
        } = {canton: c}
        lamps.forEach((id) => {
            const lamp = LAMPS[id]
            if (lamp) {
                const yrs = payback(c, category, lamp, install, runtime, DEMO, BASE)
                obj[id] = yrs
            }
        })
        return obj
    })

    const valid = rows.length && lamps.length

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-semibold">Szenarien-Vergleich</h1>

            <p className="text-muted-foreground max-w-3xl">
                Vergleiche, in wie&nbsp;vielen Jahren sich verschiedene
                Smart-LEDs in
                ausgewählten Kantonen amortisieren.
                Datenbasis&nbsp;
                <a href="https://www.strompreis.elcom.admin.ch/"
                   target="_blank"
                   rel="noreferrer"
                   className="underline underline-offset-4">ElCom</a>.
            </p>

            {/* Filter */}
            <FilterPanelScenarios
                cantons={cantons} onCantonsChange={setC}
                category={category} onCategoryChange={setCat}
                lamps={lamps} onLampsChange={setL}
                installYear={install} onYearChange={setY}
                runtime={runtime} onRuntimeChange={setRt}
            />

            {!valid && (
                <Alert>
                    <TriangleAlert className="h-4 w-4"/>
                    Bitte mindestens einen Kanton und eine Smart-LED auswählen.
                </Alert>
            )}

            {/* Chart */}
            {valid && (
                <Card>
                    <CardHeader>
                        <CardTitle>Amortisations­dauer nach Kanton</CardTitle>
                        <CardDescription>
                            Jahr(e) bis Break-Even ab
                            Installation&nbsp;{install} bei&nbsp;
                            {runtime.toLocaleString("de-CH")} h jährlich
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="h-[420px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={rows} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3"/>
                                <XAxis type="number" domain={[0, MAX_YEARS]}
                                       tickFormatter={(v) => `${v} J`}/>
                                <YAxis type="category" dataKey="canton"/>
                                <Tooltip
                                    formatter={(v: number) => [v === MAX_YEARS ? `≥ ${MAX_YEARS}` : v, "Jahre"]}
                                    labelFormatter={(l) => `Kanton ${l}`}
                                />
                                <Legend/>
                                {lamps.map((id, i) => (
                                    <Bar key={id} dataKey={id}
                                         name={LAMPS[id]?.label || id}
                                         fill={COLORS[i]} maxBarSize={26}>
                                        <LabelList dataKey={id}
                                                   position="insideRight"
                                                   formatter={(v) => {
                                                       const numValue = Number(v);
                                                       return numValue === MAX_YEARS ? `≥${MAX_YEARS}` : numValue;
                                                   }}/>
                                    </Bar>
                                ))}
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
