'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const RUNTIME = 6000 // h/Jahr

interface PredictionData {
  [year: string]: {
    konservativ: number
    mittel: number
    optimistisch: number
  }
}

interface LedTube {
  id: number
  name: string
  brand: string
  price: number
  watt: number
  efficiency: number
  isBaseline: boolean
}

interface LedCardsWithAmortisationProps {
  predictionData: PredictionData | null
  selectedLamps: string[]
  installYear: number
  scenario: 'konservativ' | 'mittel' | 'optimistisch'
  baseline: LedTube | null
  tubes: LedTube[]
}

/* ───── lineare Interpolation des Schnittpunkts ────────────── */
function interpolate(
    s0: number, s1: number, l0: number, l1: number, year0: number, install: number,
) {
    const d0 = s0 - l0
    const d1 = s1 - l1
    const t = d0 / (d0 - d1)          // Anteil in diesem Intervall [0–1]
    const xA = year0 + t               // absolutes Kalenderjahr
    const rel = +(xA - install).toFixed(1)
    const y = +(s0 + (s1 - s0) * t).toFixed(2)
    return { xA, y, rel }
}

function LampCard({ title, rows }: { title: string; rows: string[] }) {
  return (
    <Card className="w-full">
      <CardHeader><CardTitle>{title}</CardTitle></CardHeader>
      <CardContent className="text-sm">
        <ul className="ml-4 list-disc space-y-1">
          {rows.map((r, i) => <li key={i}>{r}</li>)}
        </ul>
      </CardContent>
    </Card>
  )
}

export default function LedCardsWithAmortisation({
  predictionData,
  selectedLamps,
  installYear,
  scenario,
  baseline,
  tubes
}: LedCardsWithAmortisationProps) {
  if (!baseline || !tubes || !predictionData) {
    return null
  }

  // Transform LED tube data to match existing structure
  const BASE = { price: baseline.price, watt: baseline.watt }
  const LAMPS = tubes.filter(t => !t.isBaseline).reduce((acc, tube) => {
    const key = tube.name.toLowerCase().replace(/[^a-z]/g, '')
    // Calculate effective wattage based on efficiency
    const effectiveWatt = tube.watt * (1 - tube.efficiency / 100)
    acc[key] = {
      label: tube.name,
      price: tube.price,
      watt: effectiveWatt,
      originalWatt: tube.watt,
      efficiency: tube.efficiency
    }
    return acc
  }, {} as Record<string, { label: string; price: number; watt: number; originalWatt: number; efficiency: number }>)

  // Get years from installYear to 2040 with prediction data
  const years = Object.keys(predictionData)
    .map(year => parseInt(year))
    .filter(year => year >= installYear)
    .sort((a, b) => a - b)

  if (years.length === 0) {
    return null
  }

  /* ───── Calculate Break-Even Points ─────────────────── */
  const breaks: Record<string, number | null> = {}

  if (selectedLamps.length > 0) {
    let accLED = BASE.price
    const accSmart: Record<string, number> = {}

    const rows = years.map((year) => {
      const predictionValue = predictionData[year.toString()]?.[scenario]
      if (!predictionValue) return { year, LED: accLED }

      const p = predictionValue / 100 // Convert Rp/kWh to CHF/kWh
      accLED += (BASE.watt * RUNTIME) / 1000 * p
      const r: {year: number; LED: number; [key: string]: number} = { 
        year, 
        LED: +accLED.toFixed(2) 
      }

      selectedLamps.forEach(id => {
        const l = LAMPS[id as keyof typeof LAMPS]
        if (!l) return // Skip if lamp not found
        if (accSmart[id] === undefined) accSmart[id] = l.price
        accSmart[id] += (l.watt * RUNTIME) / 1000 * p
        r[id] = +accSmart[id].toFixed(2)
      })
      return r
    }).filter(row => row.LED !== undefined)

    // Calculate break-even points
    selectedLamps.forEach((id) => {
      if (!LAMPS[id as keyof typeof LAMPS]) return // Skip if lamp not found
      let rel: null | number = null
      for (let j = 1; j < rows.length; j++) {
        const prevRow = rows[j-1] as Record<string, number>
        const currentRow = rows[j] as Record<string, number>
        if (prevRow[id] > prevRow.LED && currentRow[id] <= currentRow.LED) {
          const { rel: r } = interpolate(
            prevRow[id], currentRow[id],
            prevRow.LED, currentRow.LED,
            prevRow.year, installYear,
          )
          rel = r
          break
        }
      }
      breaks[id] = rel
    })
  }

  // Prepare lamp data for display
  const lampData = selectedLamps.filter(id => LAMPS[id as keyof typeof LAMPS]).map(id => ({
    id,
    label: LAMPS[id as keyof typeof LAMPS].label,
    price: LAMPS[id as keyof typeof LAMPS].price,
    watt: LAMPS[id as keyof typeof LAMPS].watt, // This is now effective wattage
    originalWatt: LAMPS[id as keyof typeof LAMPS].originalWatt,
    efficiency: LAMPS[id as keyof typeof LAMPS].efficiency
  }))

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

      {lampData.map(lamp => {
        // lamp.watt is already the effective wattage
        const savings = baseline.watt - lamp.watt
        const breakEven = breaks[lamp.id]

        return (
          <LampCard
            key={lamp.id}
            title={lamp.label}
            rows={[
              `Preis: ${lamp.price} CHF`,
              `Leistung: ${lamp.originalWatt} W`,
              `Effizienz: ${lamp.efficiency}% (${lamp.watt.toFixed(1)} W)`,
              `Ersparnis: ${savings.toFixed(1)}W (ggü. Standard)`,
              `Amortisation: ${breakEven !== null ? `${breakEven.toFixed(1)} J` : "≥ 15 J"}`
            ]}
          />
        )
      })}
    </div>
  )
}