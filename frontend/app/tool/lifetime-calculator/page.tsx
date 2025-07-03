"use client"

import React from "react"
import { Alert } from "@/components/ui/alert"
import { TriangleAlert } from "lucide-react"

import { useElectricityData } from "@/app/hooks/useElectricityData"
import { useLedTubeData } from "@/app/hooks/useLedTubeData"
import { Cat } from "@/app/types/categories"
import { FilterPanelLifetime } from "@/components/lifetime-calculator/filter-panel-lifetime"
import { LifetimeStatsGrid } from "@/components/lifetime-calculator/lifetime-stats-grid"
import { LifetimeComparisonChart } from "@/components/lifetime-calculator/lifetime-comparison-chart"
import { ReplacementSchedule } from "@/components/lifetime-calculator/replacement-schedule"

const RUNTIME_HOURS_PER_YEAR = 6000
const LS_KEY = "lifetime-calc-v1"

const loadLS = () => {
    if (typeof window === "undefined") return {}
    try { return JSON.parse(localStorage.getItem(LS_KEY) ?? "{}") } catch { return {} }
}
const saveLS = (s: Record<string, unknown>) => localStorage.setItem(LS_KEY, JSON.stringify(s))

// Canton mapping (same as in prediction calculator)
const CANTON_ABBR_TO_CODE: Record<string, string> = {
    'ZH': '1', 'BE': '2', 'LU': '3', 'UR': '4', 'SZ': '5', 'OW': '6',
    'NW': '7', 'GL': '8', 'ZG': '9', 'FR': '10', 'SO': '11', 'BS': '12',
    'BL': '13', 'SH': '14', 'AR': '15', 'AI': '16', 'SG': '17', 'GR': '18',
    'AG': '19', 'TG': '20', 'TI': '21', 'VD': '22', 'VS': '23', 'NE': '24',
    'GE': '25', 'JU': '26'
}

interface PredictionData {
    [year: string]: {
        konservativ: number
        mittel: number
        optimistisch: number
    }
}

export default function LifetimeCalculatorPage() {
    const { data: electricityData, cantons, loading: electricityLoading, error: electricityError } = useElectricityData()
    const { tubes, baseline, loading: ledLoading, error: ledError } = useLedTubeData()
    
    const init = loadLS()
    const [canton, setCanton] = React.useState(init.canton ?? "ZH")
    const [category, setCategory] = React.useState<Cat>(init.category ?? "C3")
    const [selectedLamp, setSelectedLamp] = React.useState<string>(init.lamp ?? "")
    const [installYear, setInstallYear] = React.useState<number>(init.year ?? 2024)
    const [predictionData, setPredictionData] = React.useState<PredictionData | null>(null)
    const [predictionsLoading, setPredictionsLoading] = React.useState(false)
    const [predictionsError, setPredictionsError] = React.useState<string | null>(null)

    const selectedTube = tubes?.find(t => t.id.toString() === selectedLamp)
    const lifetimeYears = selectedTube ? selectedTube.lifetime / RUNTIME_HOURS_PER_YEAR : 0
    const endYear = installYear + lifetimeYears

    // Combine historical and predicted data
    const relevantPrices = React.useMemo(() => {
        const prices: Array<{ year: number; total: number }> = []
        
        // Get historical data
        const historicalData = electricityData[canton]?.[category]?.trend || []
        
        for (let year = installYear; year <= Math.ceil(endYear); year++) {
            // Try historical data first
            const historicalPrice = historicalData.find(h => h.year === year)
            if (historicalPrice) {
                prices.push({ year, total: historicalPrice.total })
            } else if (year > 2024 && predictionData) {
                // Use predicted data for future years (default to "mittel" scenario)
                const predictedPrice = predictionData[year.toString()]?.mittel
                if (predictedPrice) {
                    prices.push({ year, total: predictedPrice })
                }
            }
        }
        
        return prices.sort((a, b) => a.year - b.year)
    }, [electricityData, predictionData, canton, category, installYear, endYear])

    React.useEffect(() => {
        saveLS({ canton, category, lamp: selectedLamp, year: installYear })
    }, [canton, category, selectedLamp, installYear])

    // Fetch predictions (same logic as prediction calculator)
    const fetchPredictions = React.useCallback(async () => {
        if (!canton) return

        setPredictionsLoading(true)
        setPredictionsError(null)
        try {
            const cantonCode = CANTON_ABBR_TO_CODE[canton] || canton
            
            const response = await fetch(
                `/api/predictions/summary?canton=${cantonCode}&category=${category}`
            )
            if (!response.ok) {
                throw new Error('Failed to fetch predictions')
            }
            const data = await response.json()
            setPredictionData(data)
        } catch (error) {
            console.error('Error fetching predictions:', error)
            setPredictionsError('Fehler beim Laden der Prognosen')
            setPredictionData(null)
        } finally {
            setPredictionsLoading(false)
        }
    }, [canton, category])

    // Fetch predictions when canton or category changes
    React.useEffect(() => {
        if (canton && cantons.length > 0) {
            fetchPredictions()
        }
    }, [canton, category, cantons.length, fetchPredictions])

    if (electricityLoading || ledLoading || predictionsLoading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <div className="text-muted-foreground">Lade Daten...</div>
            </div>
        )
    }

    if (electricityError || ledError || predictionsError) {
        return (
            <Alert>
                <TriangleAlert className="h-4 w-4" />
                <div>
                    Fehler beim Laden der Daten:
                    {electricityError && <div>Strompreise: {electricityError}</div>}
                    {ledError && <div>LED-Daten: {ledError}</div>}
                    {predictionsError && <div>Prognosen: {predictionsError}</div>}
                </div>
            </Alert>
        )
    }

    if (!baseline || !tubes || tubes.length === 0) {
        return (
            <Alert>
                <TriangleAlert className="h-4 w-4" />
                <div>LED-Daten werden geladen oder fehlen.</div>
            </Alert>
        )
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold">LED-Übersicht</h1>
                <p className="text-muted-foreground mt-2">
                    Berechne die Gesamtkosten einer Lampe über ihre komplette Lebensdauer 
                    {selectedTube && ` von ${lifetimeYears.toFixed(1)} Jahren`}
                    {" "}bei {RUNTIME_HOURS_PER_YEAR.toLocaleString()} Betriebsstunden pro Jahr.
                </p>
            </div>

            <FilterPanelLifetime
                canton={canton}
                onCantonChange={setCanton}
                category={category}
                onCategoryChange={setCategory}
                selectedLamp={selectedLamp}
                onLampChange={setSelectedLamp}
                installYear={installYear}
                onYearChange={setInstallYear}
                availableCantons={cantons}
                availableLamps={tubes}
                electricityData={electricityData}
            />

            {!selectedTube ? (
                <Alert>
                    <TriangleAlert className="h-4 w-4" />
                    <div>Bitte wähle eine Lampe aus, um die Lebensdauer-Analyse zu starten.</div>
                </Alert>
            ) : (
                <>
                    <LifetimeStatsGrid
                        selectedTube={selectedTube}
                        baseline={baseline}
                        installYear={installYear}
                        lifetimeYears={lifetimeYears}
                        electricityPrices={relevantPrices}
                        runtimeHours={RUNTIME_HOURS_PER_YEAR}
                    />

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <LifetimeComparisonChart
                            selectedTube={selectedTube}
                            baseline={baseline}
                            installYear={installYear}
                            lifetimeYears={lifetimeYears}
                            electricityPrices={relevantPrices}
                            runtimeHours={RUNTIME_HOURS_PER_YEAR}
                        />

                        <ReplacementSchedule
                            selectedTube={selectedTube}
                            baseline={baseline}
                            installYear={installYear}
                            runtimeHours={RUNTIME_HOURS_PER_YEAR}
                        />
                    </div>
                </>
            )}
        </div>
    )
}