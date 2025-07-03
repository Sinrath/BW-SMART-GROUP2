'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface LedTube {
  id: number
  name: string
  brand: string
  price: number
  watt: number
  efficiency: number
  isBaseline: boolean
}

interface PredictionData {
  [year: string]: {
    konservativ: number
    mittel: number
    optimistisch: number
  }
}

interface AmortisationInfoProps {
  selectedLamps: string[]
  baseline: LedTube | null
  tubes: LedTube[]
  predictionData: PredictionData | null
}

export default function AmortisationInfo({
  selectedLamps,
  baseline,
  tubes,
  predictionData
}: AmortisationInfoProps) {
  if (!baseline || !tubes || !predictionData) {
    return null
  }

  // Transform LED tube data
  const LAMPS = tubes.filter(t => !t.isBaseline).reduce((acc, tube) => {
    const key = tube.name.toLowerCase().replace(/[^a-z]/g, '')
    acc[key] = {
      label: tube.name,
      price: tube.price,
      watt: tube.watt
    }
    return acc
  }, {} as Record<string, { label: string; price: number; watt: number }>)

  const validLamps = selectedLamps.filter(id => LAMPS[id])

  if (validLamps.length === 0) {
    return null
  }

  return (
    <div className="grid gap-4 mt-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(16rem, 1fr))" }}>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Standard-LED</CardTitle>
        </CardHeader>
        <CardContent className="text-sm">
          <ul className="space-y-1">
            <li>Preis: {baseline.price} CHF</li>
            <li>Leistung: {baseline.watt} W</li>
          </ul>
        </CardContent>
      </Card>

      {validLamps.map(id => {
        const lamp = LAMPS[id]
        const savings = baseline.watt - lamp.watt
        const savingsPercent = ((savings / baseline.watt) * 100).toFixed(1)
        const costDiff = lamp.price - baseline.price

        return (
          <Card key={id}>
            <CardHeader>
              <CardTitle className="text-base">{lamp.label}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              <ul className="space-y-1">
                <li>Preis: {lamp.price} CHF</li>
                <li>Leistung: {lamp.watt} W</li>
                <li>Ersparnis: {savings}W ({savingsPercent}%)</li>
                <li>Mehrkosten: +{costDiff} CHF</li>
              </ul>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}