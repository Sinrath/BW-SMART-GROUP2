"use client"

import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { TriangleAlert } from "lucide-react"

import { FilterPanel } from "@/components/price-analysis/filter-panel"
import { TrendChart } from "@/components/price-analysis/trend-chart"
import { ComponentChart } from "@/components/price-analysis/component-chart"
import { useElectricityData } from "@/app/hooks/useElectricityData"
import { Cat } from "@/app/types/categories";
import { PriceSpreadChart } from "@/components/price-analysis/price-spread-chart";
import { RadarCard } from "@/components/price-analysis/radar-chart";

export default function StrompreisExplorerPage() {
    const { data: DEMO, loading, error } = useElectricityData()
    
    /* ─── State ─────────────────────────────────────────── */
    const [ cantons, setCantons ] = React.useState<string[]>(() => {
        if (typeof window !== 'undefined') {
            return JSON.parse(localStorage.getItem("cantons") ?? '["ZH"]')
        }
        return ["ZH"]
    })
    const [ category, setCategory ] = React.useState<Cat>(() => {
        if (typeof window !== 'undefined') {
            return (localStorage.getItem("category") as Cat) ?? "C2"
        }
        return "C2"
    })

    /* Speichern, sobald sich etwas ändert */
    React.useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem("cantons", JSON.stringify(cantons))
        }
    }, [ cantons ])

    React.useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem("category", category)
        }
    }, [ category ])

    if (loading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <div className="text-muted-foreground">Lade Daten...</div>
            </div>
        )
    }

    if (error) {
        return (
            <Alert>
                <TriangleAlert className="h-4 w-4" />
                <AlertDescription>
                    Fehler beim Laden der Daten: {error}
                </AlertDescription>
            </Alert>
        )
    }

    /* ─── 1) nur Kantone, die echte Daten haben ─────────── */
    const validCantons = cantons.filter((c) => {
        const cantonData = DEMO[c as keyof typeof DEMO]
        const categoryData = cantonData?.[category]
        // Check if we have both trend data and comp24 data
        const hasData = categoryData && categoryData.trend && categoryData.trend.length > 0
        return hasData
    })
    const hasSelection = validCantons.length > 0

    /* ─── 2) Trend-Daten zusammenführen ─────────────────── */
    const years = (() => {
        // Get years from the first valid canton/category combination
        for (const canton of validCantons) {
            const categoryData = DEMO[canton as keyof typeof DEMO]?.[category];
            if (categoryData?.trend?.length > 0) {
                return categoryData.trend.map((d) => d.year);
            }
        }
        // Fallback: get years from any available data
        for (const cantonKey of Object.keys(DEMO)) {
            for (const catKey of Object.keys(DEMO[cantonKey])) {
                const trend = DEMO[cantonKey][catKey]?.trend;
                if (trend?.length > 0) {
                    return trend.map((d) => d.year);
                }
            }
        }
        return [];
    })();
    const trendData = hasSelection
        ? years.map((year) => {
            const obj: {year: number; [key: string]: number | undefined} = { year }
            validCantons.forEach((c) => {
                const trend = DEMO[c as keyof typeof DEMO]?.[category]?.trend
                obj[c] = trend?.find((t) => t.year === year)?.total
            })
            return obj
        })
        : []

    /* ─── 3) Komponenten-Chart = Durchschnitt aller Kantone */
    let compData: {
        aidfee: number
        charge: number
        gridusage: number
        energy: number
    } | null = null

    if (hasSelection) {
        const sum = validCantons.reduce(
            (acc, c) => {
                const d = DEMO[c as keyof typeof DEMO]?.[category]?.comp24
                if (d) {
                    acc.aidfee += d.aidfee || 0
                    acc.charge += d.charge || 0
                    acc.gridusage += d.gridusage || 0
                    acc.energy += d.energy || 0
                }
                return acc
            },
            { aidfee: 0, charge: 0, gridusage: 0, energy: 0 }
        )
        compData = {
            aidfee: +(sum.aidfee / validCantons.length).toFixed(2),
            charge: +(sum.charge / validCantons.length).toFixed(2),
            gridusage: +(sum.gridusage / validCantons.length).toFixed(2),
            energy: +(sum.energy / validCantons.length).toFixed(2),
        }
    }

    return (
        <div className="space-y-6">
            {/* ─── Titel & Beschreibung ───────────────────────── */ }
            <div className="space-y-1">
                <h1 className="text-2xl font-semibold">Strompreis-Explorer</h1>
                <p className="text-muted-foreground max-w-3xl">
                    Interaktive Analyse der schweizerischen Strompreise für Kleinbetriebe
                    (C2: Kleinbetrieb 30&apos;000 kWh/Jahr) und mittlere Betriebe (C3: Mittlerer Betrieb 150&apos;000 kWh/Jahr). Datenquelle:&nbsp;
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

            {/* ─── Filter Panel ──────────────────────────────── */ }
            <FilterPanel
                cantons={ cantons }
                onCantonsChange={ setCantons }
                category={ category }
                onCategoryChange={ setCategory }
            />

            {/* ─── Hinweis bei keiner Auswahl ────────────────── */ }
            { !hasSelection && (
                <Alert>
                    <TriangleAlert className="h-4 w-4" />
                    <AlertDescription>
                        {cantons.length > 0 
                            ? `Keine Daten für ${category} in den ausgewählten Kantonen (${cantons.join(', ')}) verfügbar.`
                            : "Bitte mindestens einen Kanton auswählen."
                        }
                    </AlertDescription>
                </Alert>
            ) }

            {/* ─── Charts ────────────────────────────────────── */ }
            { hasSelection && (
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Trend-Chart */ }
                    <Card>
                        <CardHeader>
                            <CardTitle>Preis-Trend ({ category })</CardTitle>
                            <CardDescription>
                                Gesamtkosten in Rp./kWh – mehrere Kantone auswählbar
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="h-80">
                            <TrendChart data={ trendData } cantons={ validCantons } />
                        </CardContent>
                    </Card>

                    {/* Komponenten-Chart */ }
                    <Card>
                        <CardHeader>
                            <CardTitle>
                                Preis­komponenten&nbsp;2024&nbsp;
                                { validCantons.length === 1
                                    ? `(${ validCantons[0] })`
                                    : `(${ validCantons.length } Kantone Ø)` }
                            </CardTitle>
                            <CardDescription>
                                Aidfee = Netzzuschlag · Charge = Abgaben/Gebühren&nbsp;|&nbsp;
                                Gridusage = Netznutzung · Energy = Energiepreis
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="h-80">
                            { compData ? (
                                <ComponentChart data={ compData } />
                            ) : (
                                <div className="flex h-full items-center justify-center text-muted-foreground">
                                    Kein Datensatz verfügbar
                                </div>
                            ) }
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Komponenten-Entwicklung&nbsp;2024&nbsp;
                                { validCantons.length === 1
                                    ? `(${ validCantons[0] })`
                                    : `(${ validCantons.length } Kantone Ø)` }
                            </CardTitle>
                            <CardDescription>Absolute Werte in Rp./kWh</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <PriceSpreadChart cantons={ validCantons } category={ category } />
                        </CardContent>
                    </Card>

                    <RadarCard cantons={ validCantons } category={ category } />
                </div>
            ) }
        </div>
    )
}