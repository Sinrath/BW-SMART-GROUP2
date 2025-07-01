"use client"

import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { TriangleAlert } from "lucide-react"

import { FilterPanel } from "@/components/filter-panel"
import { TrendChart } from "@/components/trend-chart"
import { ComponentChart } from "@/components/component-chart"
import { DEMO } from "@/app/fakeData"

export type Cat = "C2" | "C3"

export default function StrompreisExplorerPage() {
    /* ─── State ─────────────────────────────────────────── */
    const [ cantons, setCantons ] = React.useState<string[]>([ "ZH", "BE" ])
    const [ category, setCategory ] = React.useState<Cat>("C2")

    /* ─── 1) nur Kantone, die echte Daten haben ─────────── */
    const validCantons = cantons.filter((c) => DEMO[c])
    const hasSelection = validCantons.length > 0

    /* ─── 2) Trend-Daten zusammenführen ─────────────────── */
    const years = DEMO.ZH.C2.trend.map((d) => d.year)         // gemeinsame X-Achse
    const trendData = hasSelection
        ? years.map((year) => {
            const obj: any = { year }
            validCantons.forEach((c) => {
                obj[c] = DEMO[c][category].trend.find((t) => t.year === year)?.total
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
                const d = DEMO[c][category].comp24
                acc.aidfee += d.aidfee
                acc.charge += d.charge
                acc.gridusage += d.gridusage
                acc.energy += d.energy
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
                    Interaktive Analyse der schweizerischen Strompreise für mittlere
                    (C2) und grosse (C3) Unternehmen. Datenquelle:&nbsp;
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
                        Bitte mindestens einen Kanton auswählen.
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
                </div>
            ) }
        </div>
    )
}
