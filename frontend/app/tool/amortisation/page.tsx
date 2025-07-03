"use client"

import React from "react"
import {
    Card, CardHeader, CardContent, CardTitle, CardDescription,
} from "@/components/ui/card"
import { Alert } from "@/components/ui/alert"
import { TriangleAlert } from "lucide-react"
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, ReferenceDot, Legend, Label,
} from "recharts"

import { useElectricityData } from "@/app/hooks/useElectricityData"
import { useLedTubeData } from "@/app/hooks/useLedTubeData"
import { Cat } from "@/app/types/categories"
import { FilterPanelAmortisation } from "@/components/amortisation/filter-panel-amortisation"
import { LampCardGrid } from "@/components/amortisation/lamp-card-grid"
import { PriceTrendChart } from "@/components/amortisation/price-trend-chart"

const RUNTIME = 6000                     // h/Jahr
const LS_KEY  = "amort-filter-v2"
const COLORS  = ["#2563eb", "#10b981", "#f59e0b", "#c026d3"]

/* ───── LocalStorage helpers ────────────────────────────────── */
const loadLS = () => {
    if (typeof window === "undefined") return {}
    try { return JSON.parse(localStorage.getItem(LS_KEY) ?? "{}") } catch {}
}
const saveLS = (s: Record<string, unknown>) => localStorage.setItem(LS_KEY, JSON.stringify(s))

/* ───── lineare Interpolation des Schnittpunkts ────────────── */
function interpolate(
    s0:number,s1:number, l0:number,l1:number, year0:number, install:number,
){
    const d0 = s0 - l0
    const d1 = s1 - l1
    const t  = d0 / (d0 - d1)          // Anteil in diesem Intervall [0–1]
    const xA = year0 + t               // absolutes Kalenderjahr
    const rel= +(xA - install).toFixed(1)
    const y  = +(s0 + (s1 - s0) * t).toFixed(2)
    return { xA, y, rel }
}

export default function AmortisationPage() {
    const { data: DEMO, cantons, loading: electricityLoading, error: electricityError } = useElectricityData()
    const { tubes, baseline, loading: ledLoading, error: ledError } = useLedTubeData()
    
    /* ───── Zustand ─────────────────────────────────────────── */
    const init              = loadLS()
    const [canton, setCan]  = React.useState(init.canton   ?? "ZH")
    const [category,setCat] = React.useState<Cat>(init.category ?? "C3")
    const [lamps,  setL]    = React.useState<string[]>(init.lamps ?? [])
    const [install, setY]   = React.useState<number>(init.year   ?? 2020)

    React.useEffect(()=>saveLS({ canton,category,lamps,year:install }),
        [canton,category,lamps,install])

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
    
    // Check if we have essential data
    if (!baseline || !tubes || tubes.length === 0) {
        console.error('LED data not ready:', { baseline, tubes: tubes?.length });
        return (
            <Alert>
                <TriangleAlert className="h-4 w-4" />
                <div>
                    LED-Daten werden geladen oder fehlen. 
                    {!baseline && 'Keine Basis-LED-Röhre gefunden.'}
                    {(!tubes || tubes.length === 0) && ' Keine LED-Röhren gefunden.'}
                </div>
            </Alert>
        )
    }

    // Transform LED tube data to match fake data structure
    const BASE = { price: baseline?.price || 0, watt: baseline?.watt || 0 }
    const LAMPS = tubes.filter(t => !t.isBaseline).reduce((acc, tube) => {
        const key = tube.name.toLowerCase().replace(/[^a-z]/g, '')
        acc[key] = {
            label: tube.name,
            price: tube.price,
            watt: tube.watt
        }
        return acc
    }, {} as Record<string, { label: string; price: number; watt: number }>)
    
    // Debug logging
    console.log('LAMPS object:', LAMPS)
    console.log('Selected lamps:', lamps)
    console.log('Available lamp keys:', Object.keys(LAMPS))

    /* ───── Preisserie ab Einbaujahr ────────────────────────── */
    const full  = DEMO[canton]?.[category]?.trend
    const idx   = full?.findIndex(t=>t.year===install) ?? -1
    const serie = idx>=0 ? full!.slice(idx) : undefined
    const has   = !!serie && serie.length>0

    /* ───── Kalkulation Reihen + Break-Even ─────────────────── */
    let rows: Array<{year: number; LED: number; [key: string]: number}> = []
    const breaks:Record<string,number|null>={}
    const dots :{id:string;x:number;y:number;color:string;lbl:string}[]=[]

    if(has && lamps.length){
        let accLED = BASE.price
        const accSmart:Record<string,number>={}

        rows = serie.map(({year,total})=>{
            const p = total/100                    // CHF/kWh
            accLED += (BASE.watt*RUNTIME)/1000 * p
            const r: {year: number; LED: number; [key: string]: number} = { year, LED:+accLED.toFixed(2) }

            lamps.forEach(id=>{
                const l=LAMPS[id as keyof typeof LAMPS]
                if(!l) return // Skip if lamp not found
                if(accSmart[id]===undefined) accSmart[id]=l.price
                accSmart[id]+= (l.watt*RUNTIME)/1000 * p
                r[id]=+accSmart[id].toFixed(2)
            })
            return r
        })

        lamps.forEach((id,i)=>{
            if(!LAMPS[id as keyof typeof LAMPS]) return // Skip if lamp not found
            let rel:null|number=null
            for(let j=1;j<rows.length;j++){
                if(rows[j-1][id]>rows[j-1].LED && rows[j][id]<=rows[j].LED){
                    const {xA,y,rel:r}=interpolate(
                        rows[j-1][id],rows[j][id],
                        rows[j-1].LED,rows[j].LED,
                        rows[j-1].year,install,
                    )
                    rel=r
                    dots.push({id,x:xA,y,color:COLORS[i],lbl:`${r} J`})
                    break
                }
            }
            breaks[id]=rel
        })
    }

    /* ───── maximal betrachtete Jahre (für ≥ Angabe) ────────── */
    const maxRelYears = has ? rows[rows.length-1]?.year - install : 0

    /* ───── UI ──────────────────────────────────────────────── */
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-semibold">Historie-Rechner</h1>

            <FilterPanelAmortisation
                canton={canton} onCantonChange={setCan}
                category={category} onCategoryChange={setCat}
                lamps={lamps} onLampsChange={setL}
                installYear={install} onYearChange={setY}
                availableCantons={cantons}
                availableLamps={tubes}
                electricityData={DEMO}
            />

            <LampCardGrid
                baseline={BASE}
                lamps={lamps.filter(id => LAMPS[id as keyof typeof LAMPS]).map(id=>({id,...LAMPS[id as keyof typeof LAMPS]}))}
                breakEvens={breaks}
                maxYears={maxRelYears}
            />

            {(!has || !lamps.length) && (
                <Alert>
                    <TriangleAlert className="h-4 w-4"/>
                    {!has
                        ? "Für diese Auswahl liegen keine Preis­daten vor."
                        : "Bitte mindestens eine Smart-LED auswählen."}
                </Alert>
            )}

            {has && lamps.length>0 && (
                <>
                    {/* ───── Kumulative Kosten ───── */}
                    <Card>
                        <CardHeader>
                            <CardTitle>
                                Kumulative Kosten – Kanton {canton} (ab {install})
                            </CardTitle>
                            <CardDescription>
                                Kaufpreis + jährliche Stromkosten (6 000 h).
                                Punkt = Break-Even (Jahre relativ zum Einbau).
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="h-[380px] overflow-visible">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={rows}>
                                    <CartesianGrid strokeDasharray="3 3"/>
                                    <XAxis dataKey="year"/>
                                    <YAxis unit=" CHF"/>
                                    <Tooltip
                                        formatter={(v:number)=>[`${v} CHF`]}
                                        labelFormatter={(l)=>`Kalenderjahr ${l}`}
                                    />
                                    <Legend/>
                                    <Line dataKey="LED" stroke="#64748b" dot/>
                                    {lamps.filter(id => LAMPS[id as keyof typeof LAMPS]).map((id,i)=>(
                                        <Line key={id} dataKey={id} name={LAMPS[id as keyof typeof LAMPS].label}
                                              stroke={COLORS[i]} dot/>
                                    ))}
                                    {dots.map(d=>(
                                        <ReferenceDot key={d.id}
                                                      x={d.x} y={d.y} r={8}
                                                      fill={d.color} stroke="white" strokeWidth={2}
                                        >
                                            <Label value={d.lbl} position="top" />
                                        </ReferenceDot>
                                    ))}
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* ───── Strompreis-Chart ───── */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Strompreis-Verlauf – Kanton {canton}</CardTitle>
                            <CardDescription>CHF/kWh ab {install}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <PriceTrendChart canton={canton} category={category}/>
                        </CardContent>
                    </Card>
                </>
            )}
        </div>
    )
}
