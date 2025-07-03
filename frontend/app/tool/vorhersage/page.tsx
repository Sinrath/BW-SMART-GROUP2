'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Alert } from '@/components/ui/alert'
import { TriangleAlert } from 'lucide-react'
import { useElectricityData } from '@/app/hooks/useElectricityData'
import { useLedTubeData } from '@/app/hooks/useLedTubeData'
import { Cat } from '@/app/types/categories'
import FilterPanelVorhersage from '@/components/vorhersage/filter-panel-vorhersage'
import PredictionChart from '@/components/vorhersage/prediction-chart'
import PredictionInfoPanel from '@/components/vorhersage/prediction-info-panel'
import AmortisationChart from '@/components/vorhersage/amortisation-chart'
import AmortisationInfo from '@/components/vorhersage/amortisation-info'

const LS_KEY = "vorhersage-filter-v1"

// LocalStorage helpers
const loadLS = () => {
  if (typeof window === "undefined") return {}
  try { return JSON.parse(localStorage.getItem(LS_KEY) ?? "{}") } catch {}
}
const saveLS = (s: Record<string, unknown>) => localStorage.setItem(LS_KEY, JSON.stringify(s))

interface PredictionData {
  [year: string]: {
    konservativ: number
    mittel: number
    optimistisch: number
  }
}

export default function VorhersagePage() {
  const { data: DEMO, cantons, loading: electricityLoading, error: electricityError } = useElectricityData()
  const { tubes, baseline, loading: ledLoading, error: ledError } = useLedTubeData()

  // State from localStorage
  const init = loadLS()
  const [selectedCanton, setSelectedCanton] = useState<string>(init.canton ?? 'ZH')
  const [selectedCategory, setSelectedCategory] = useState<Cat>(init.category ?? 'C3')
  const [selectedLamps, setSelectedLamps] = useState<string[]>(init.lamps ?? [])
  const [installYear, setInstallYear] = useState<number>(init.year ?? 2025)
  const [selectedScenario, setSelectedScenario] = useState<'konservativ' | 'mittel' | 'optimistisch'>(init.scenario ?? 'mittel')
  const [predictionData, setPredictionData] = useState<PredictionData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Save to localStorage
  React.useEffect(() => saveLS({
    canton: selectedCanton,
    category: selectedCategory,
    lamps: selectedLamps,
    year: installYear,
    scenario: selectedScenario
  }), [selectedCanton, selectedCategory, selectedLamps, installYear, selectedScenario])

  const fetchPredictions = useCallback(async () => {
    if (!selectedCanton) return

    setLoading(true)
    setError(null)
    try {
      // Convert canton abbreviation to database code
      const CANTON_ABBR_TO_CODE: Record<string, string> = {
        'ZH': '1', 'BE': '2', 'LU': '3', 'UR': '4', 'SZ': '5', 'OW': '6',
        'NW': '7', 'GL': '8', 'ZG': '9', 'FR': '10', 'SO': '11', 'BS': '12',
        'BL': '13', 'SH': '14', 'AR': '15', 'AI': '16', 'SG': '17', 'GR': '18',
        'AG': '19', 'TG': '20', 'TI': '21', 'VD': '22', 'VS': '23', 'NE': '24',
        'GE': '25', 'JU': '26'
      }
      
      const cantonCode = CANTON_ABBR_TO_CODE[selectedCanton] || selectedCanton
      
      const response = await fetch(
        `/api/predictions/summary?canton=${cantonCode}&category=${selectedCategory}`
      )
      if (!response.ok) {
        throw new Error('Failed to fetch predictions')
      }
      const data = await response.json()
      setPredictionData(data)
    } catch (error) {
      console.error('Error fetching predictions:', error)
      setError('Fehler beim Laden der Prognosen')
      setPredictionData(null)
    } finally {
      setLoading(false)
    }
  }, [selectedCanton, selectedCategory])

  // Fetch predictions when canton or category changes
  useEffect(() => {
    if (selectedCanton && cantons.length > 0) {
      fetchPredictions()
    }
  }, [selectedCanton, selectedCategory, cantons.length, fetchPredictions])

  // Loading and error states
  if (electricityLoading || ledLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-muted-foreground">Lade Daten...</div>
      </div>
    )
  }

  if (electricityError || ledError || error) {
    return (
      <Alert>
        <TriangleAlert className="h-4 w-4" />
        <div>
          Fehler beim Laden der Daten:
          {electricityError && <div>Strompreise: {electricityError}</div>}
          {ledError && <div>LED-Daten: {ledError}</div>}
          {error && <div>Prognosen: {error}</div>}
        </div>
      </Alert>
    )
  }

  // Check if we have essential data
  if (!baseline || !tubes || tubes.length === 0) {
    return (
      <Alert>
        <TriangleAlert className="h-4 w-4" />
        <div>
          LED-Daten werden geladen oder fehlen.
          {!baseline && ' Keine Basis-LED-Röhre gefunden.'}
          {(!tubes || tubes.length === 0) && ' Keine LED-Röhren gefunden.'}
        </div>
      </Alert>
    )
  }

  // Transform LED tube data (for filter panel)
  // BASE and LAMPS will be used when implementing the amortisation chart

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Prognose-Rechner</h1>

      <FilterPanelVorhersage
        canton={selectedCanton}
        onCantonChange={setSelectedCanton}
        category={selectedCategory}
        onCategoryChange={setSelectedCategory}
        lamps={selectedLamps}
        onLampsChange={setSelectedLamps}
        installYear={installYear}
        onYearChange={setInstallYear}
        availableCantons={cantons}
        availableLamps={tubes}
        electricityData={DEMO}
      />

      {/* Strompreis-Vorhersage Chart - Always visible */}
      <Card>
        <CardHeader>
          <CardTitle>Strompreis-Vorhersage – Kanton {selectedCanton}</CardTitle>
          <CardDescription>
            Prognosen für die Entwicklung der Strompreise bis 2040 basierend auf Holt-Winters Exponential Smoothing.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading && (
            <div className="flex items-center justify-center h-[400px]">
              <p className="text-muted-foreground">Lade Prognosen...</p>
            </div>
          )}
          {!loading && !predictionData && (
            <div className="flex items-center justify-center h-[400px]">
              <p className="text-muted-foreground">Keine Prognosedaten verfügbar. Überprüfen Sie die Browser-Konsole.</p>
            </div>
          )}
          {!loading && predictionData && (
            <PredictionChart
              data={predictionData}
              loading={loading}
            />
          )}
          <PredictionInfoPanel />
        </CardContent>
      </Card>

      {(!selectedLamps.length) && (
        <Alert>
          <TriangleAlert className="h-4 w-4"/>
          Bitte mindestens eine LED-Röhre auswählen für die Amortisationsberechnung.
        </Alert>
      )}

      {selectedLamps.length > 0 && (
        <>
          {/* Kumulative Kosten nur mit Prognose-Daten */}
          <Card>
            <CardHeader>
              <CardTitle>
                Kumulative Kosten – Kanton {selectedCanton} (ab {installYear})
              </CardTitle>
              <CardDescription>
                Kaufpreis + jährliche Stromkosten (6 000 h) basierend auf prognostizierten Preisen 2025-2040.
                Punkt = Break-Even (Jahre relativ zum Einbau).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Scenario Selector */}
              <div className="flex items-center space-x-4">
                <label className="text-sm font-medium">Szenario:</label>
                <select 
                  value={selectedScenario}
                  onChange={(e) => setSelectedScenario(e.target.value as 'konservativ' | 'mittel' | 'optimistisch')}
                  className="px-3 py-2 border rounded-md bg-background"
                >
                  <option value="konservativ">Konservativ</option>
                  <option value="mittel">Mittel</option>
                  <option value="optimistisch">Optimistisch</option>
                </select>
              </div>
              
              {/* Amortisation Chart */}
              <AmortisationChart
                predictionData={predictionData}
                selectedLamps={selectedLamps}
                installYear={installYear}
                scenario={selectedScenario}
                baseline={baseline}
                tubes={tubes}
              />
              
              {/* LED Information Cards */}
              <AmortisationInfo
                selectedLamps={selectedLamps}
                baseline={baseline}
                tubes={tubes}
                predictionData={predictionData}
              />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}