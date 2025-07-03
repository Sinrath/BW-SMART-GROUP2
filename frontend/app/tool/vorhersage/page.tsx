'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { TriangleAlert } from 'lucide-react'
import FilterPanelVorhersage from '@/components/vorhersage/filter-panel-vorhersage'
import PredictionChart from '@/components/vorhersage/prediction-chart'
import PredictionInfoPanel from '@/components/vorhersage/prediction-info-panel'

interface Canton {
  value: string
  label: string
}

interface PredictionData {
  [year: string]: {
    konservativ: number
    mittel: number
    optimistisch: number
  }
}

export default function VorhersagePage() {
  const [cantons, setCantons] = useState<Canton[]>([])
  const [selectedCanton, setSelectedCanton] = useState<string>('')
  const [selectedCategory, setSelectedCategory] = useState<string>('C3')
  const [predictionData, setPredictionData] = useState<PredictionData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchCantons = async () => {
    try {
      const response = await fetch('/api/predictions/cantons')
      if (!response.ok) {
        throw new Error('Failed to fetch cantons')
      }
      const data = await response.json()
      setCantons(data)
      // Set first canton as default
      if (data.length > 0) {
        setSelectedCanton(data[0].value)
      }
    } catch (error) {
      console.error('Error fetching cantons:', error)
      setError('Fehler beim Laden der Kantone')
    }
  }

  const fetchPredictions = useCallback(async () => {
    if (!selectedCanton) return

    setLoading(true)
    setError(null)
    try {
      const response = await fetch(
        `/api/predictions/summary?canton=${selectedCanton}&category=${selectedCategory}`
      )
      if (!response.ok) {
        throw new Error('Failed to fetch predictions')
      }
      const data = await response.json()
      setPredictionData(data)
    } catch (error) {
      console.error('Error fetching predictions:', error)
      setError('Fehler beim Laden der Prognosen')
    } finally {
      setLoading(false)
    }
  }, [selectedCanton, selectedCategory])

  // Fetch cantons on component mount
  useEffect(() => {
    fetchCantons()
  }, [])

  // Fetch predictions when canton or category changes
  useEffect(() => {
    if (selectedCanton) {
      fetchPredictions()
    }
  }, [selectedCanton, selectedCategory, fetchPredictions])

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <TriangleAlert className="h-4 w-4" />
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        {/* Title & Description */}
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">Strompreis-Vorhersage</h1>
          <p className="text-muted-foreground max-w-3xl">
            Prognosen für die Entwicklung der Strompreise bis 2040 basierend auf historischen Daten
            und linearer Extrapolation. Datenquelle:&nbsp;
            <a
              href="https://www.strompreis.elcom.admin.ch/"
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-4"
            >
              ElCom
            </a>
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Strompreis-Vorhersage</CardTitle>
          </CardHeader>
          <CardContent>
            <FilterPanelVorhersage
              cantons={cantons}
              selectedCanton={selectedCanton}
              selectedCategory={selectedCategory}
              onCantonChange={setSelectedCanton}
              onCategoryChange={setSelectedCategory}
            />

            {!selectedCanton && cantons.length > 0 && (
              <Alert className="mb-6">
                <TriangleAlert className="h-4 w-4" />
                <AlertDescription>
                  Bitte wählen Sie einen Kanton aus.
                </AlertDescription>
              </Alert>
            )}

            <PredictionChart
              data={predictionData}
              loading={loading}
            />

            <PredictionInfoPanel />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}