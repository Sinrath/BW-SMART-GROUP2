'use client'

import React from 'react'
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, ReferenceDot, Legend, Label,
} from "recharts"

const RUNTIME = 6000 // h/Jahr
const COLORS = ["#2563eb", "#10b981", "#f59e0b", "#c026d3"]

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

interface AmortisationChartProps {
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


export default function AmortisationChart({
  predictionData,
  selectedLamps,
  installYear,
  scenario,
  baseline,
  tubes
}: AmortisationChartProps) {
  if (!baseline || !tubes || !predictionData) {
    return (
      <div className="flex items-center justify-center h-[380px]">
        <p className="text-muted-foreground">Keine Daten verfügbar</p>
      </div>
    )
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
      watt: effectiveWatt
    }
    return acc
  }, {} as Record<string, { label: string; price: number; watt: number }>)

  // Get years from installYear to 2040 with prediction data
  const years = Object.keys(predictionData)
    .map(year => parseInt(year))
    .filter(year => year >= installYear)
    .sort((a, b) => a - b)

  if (years.length === 0) {
    return (
      <div className="flex items-center justify-center h-[380px]">
        <p className="text-muted-foreground">Keine Prognosedaten für das gewählte Einbaujahr verfügbar</p>
      </div>
    )
  }

  /* ───── Kalkulation Reihen + Break-Even ─────────────────── */
  let rows: Array<{year: number; LED: number; [key: string]: number}> = []
  const breaks: Record<string, number | null> = {}
  const dots: {id: string; x: number; y: number; color: string; lbl: string}[] = []

  if (selectedLamps.length > 0) {
    let accLED = BASE.price
    const accSmart: Record<string, number> = {}

    rows = years.map((year, index) => {
      const predictionValue = predictionData[year.toString()]?.[scenario]
      if (!predictionValue) return { year, LED: accLED }

      const p = predictionValue / 100 // Convert Rp/kWh to CHF/kWh
      
      // Add electricity costs only after the first year
      if (index > 0) {
        accLED += (BASE.watt * RUNTIME) / 1000 * p
      }
      
      const r: {year: number; LED: number; [key: string]: number} = { 
        year, 
        LED: +accLED.toFixed(2) 
      }

      selectedLamps.forEach(id => {
        const l = LAMPS[id as keyof typeof LAMPS]
        if (!l) return // Skip if lamp not found
        if (accSmart[id] === undefined) accSmart[id] = l.price
        
        // Add electricity costs only after the first year
        if (index > 0) {
          accSmart[id] += (l.watt * RUNTIME) / 1000 * p
        }
        r[id] = +accSmart[id].toFixed(2)
      })
      return r
    }).filter(row => row.LED !== undefined)

    // Calculate break-even points
    selectedLamps.forEach((id, i) => {
      if (!LAMPS[id as keyof typeof LAMPS]) return // Skip if lamp not found
      let rel: null | number = null
      for (let j = 1; j < rows.length; j++) {
        if (rows[j-1][id] > rows[j-1].LED && rows[j][id] <= rows[j].LED) {
          const { xA, y, rel: r } = interpolate(
            rows[j-1][id], rows[j][id],
            rows[j-1].LED, rows[j].LED,
            rows[j-1].year, installYear,
          )
          rel = r
          dots.push({
            id,
            x: xA,
            y,
            color: COLORS[i % COLORS.length],
            lbl: `${r} J`
          })
          break
        }
      }
      breaks[id] = rel
    })
  }

  if (rows.length === 0) {
    return (
      <div className="flex items-center justify-center h-[380px]">
        <p className="text-muted-foreground">Keine Berechnungsdaten verfügbar</p>
      </div>
    )
  }

  return (
    <div className="pt-4">
      <ResponsiveContainer width="100%" height={380}>
      <LineChart data={rows} margin={{ top: 20, right: 30, left: 30, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="year" />
        <YAxis 
          tickFormatter={(value) => `${Math.round(value)}`}
          label={{ value: 'CHF', angle: -90, position: 'insideLeft' }}
          domain={[0, 'auto']}
          tickCount={5}
        />
        <Tooltip
          formatter={(v: number) => [`${v} CHF`]}
          labelFormatter={(l) => `Kalenderjahr ${l}`}
        />
        <Legend />
        <Line 
          dataKey="LED" 
          stroke="#64748b" 
          dot 
          name="Standard LED"
        />
        {selectedLamps.filter(id => LAMPS[id as keyof typeof LAMPS]).map((id, i) => (
          <Line 
            key={id} 
            dataKey={id} 
            name={LAMPS[id as keyof typeof LAMPS].label}
            stroke={COLORS[i % COLORS.length]} 
            dot 
          />
        ))}
        {dots.map(d => (
          <ReferenceDot 
            key={d.id}
            x={d.x} 
            y={d.y} 
            r={8}
            fill={d.color} 
            stroke="white" 
            strokeWidth={2}
          >
            <Label value={d.lbl} position="top" />
          </ReferenceDot>
        ))}
      </LineChart>
    </ResponsiveContainer>
    </div>
  )
}