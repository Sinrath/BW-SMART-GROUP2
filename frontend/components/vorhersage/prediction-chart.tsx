'use client'

import React from 'react'
import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

interface PredictionData {
  [year: string]: {
    konservativ: number
    mittel: number
    optimistisch: number
  }
}

interface PredictionChartProps {
  data: PredictionData | null
  loading: boolean
}

export default function PredictionChart({ data, loading }: PredictionChartProps) {
  // Prepare data for the chart
  const prepareChartData = () => {
    if (!data) return null

    const years = Object.keys(data).sort().map(Number)
    
    return years.map(year => {
      const konservativ = data[year.toString()].konservativ
      const optimistisch = data[year.toString()].optimistisch
      const mittel = data[year.toString()].mittel
      
      return {
        year,
        konservativ,
        mittel,
        optimistisch,
        // Calculate the difference between optimistisch and konservativ for proper stacking
        rangeDiff: optimistisch - konservativ
      }
    })
  }

  const chartData = prepareChartData()

  return (
    <div className="h-[400px]">
      {loading ? (
        <div className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">Lade Prognosen...</p>
        </div>
      ) : chartData ? (
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis 
              label={{ value: 'Rp/kWh', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip 
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload
                  return (
                    <div className="bg-white p-3 border rounded shadow">
                      <p className="font-medium">{`Jahr: ${label}`}</p>
                      <p style={{ color: '#ef4444' }}>{`Hoch (+20%): ${data.optimistisch.toFixed(2)} Rp/kWh`}</p>
                      <p style={{ color: '#1d4ed8' }}>{`Mittlere Prognose: ${data.mittel.toFixed(2)} Rp/kWh`}</p>
                      <p style={{ color: '#22c55e' }}>{`Niedrig (-20%): ${data.konservativ.toFixed(2)} Rp/kWh`}</p>
                    </div>
                  )
                }
                return null
              }}
            />
            {/* Base area starting from konservativ */}
            <Area
              type="monotone"
              dataKey="konservativ"
              stroke="transparent"
              fill="transparent"
              stackId="1"
            />
            {/* Range area on top of konservativ */}
            <Area
              type="monotone"
              dataKey="rangeDiff"
              stroke="transparent"
              fill="#93c5fd"
              fillOpacity={0.2}
              stackId="1"
            />
            {/* Middle line for mittlere prognose */}
            <Line
              type="monotone"
              dataKey="mittel"
              stroke="#1d4ed8"
              strokeWidth={3}
              dot={{ r: 3, fill: "#1d4ed8" }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">Keine Daten verfügbar</p>
        </div>
      )}
    </div>
  )
}