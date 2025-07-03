"use client"

import React from "react"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Cat } from "@/app/types/categories"

interface LedTube {
    id: number
    name: string
    brand: string
    price: number
    watt: number
    efficiency: number
    isBaseline: boolean
}

interface FilterPanelLifetimeProps {
    canton: string
    onCantonChange: (canton: string) => void
    category: Cat
    onCategoryChange: (category: Cat) => void
    selectedLamp: string
    onLampChange: (lamp: string) => void
    installYear: number
    onYearChange: (year: number) => void
    availableCantons: Array<{ code: string; label: string }>
    availableLamps: LedTube[]
    electricityData: Record<string, Record<string, { trend: Array<{ year: number; total: number }> }>>
}

export function FilterPanelLifetime({
    canton,
    onCantonChange,
    category,
    onCategoryChange,
    selectedLamp,
    onLampChange,
    installYear,
    onYearChange,
    availableCantons,
    availableLamps,
}: FilterPanelLifetimeProps) {
    const currentYear = new Date().getFullYear()
    const minYear = currentYear - 10
    const maxYear = currentYear + 5

    const sortedLamps = React.useMemo(() => {
        return [...availableLamps].sort((a, b) => {
            if (a.isBaseline && !b.isBaseline) return -1
            if (!a.isBaseline && b.isBaseline) return 1
            return a.price - b.price
        })
    }, [availableLamps])

    return (
        <Card>
            <CardHeader>
                <CardTitle>Filter-Einstellungen</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="canton-select">Kanton</Label>
                    <Select value={canton} onValueChange={onCantonChange}>
                        <SelectTrigger id="canton-select">
                            <SelectValue placeholder="Kanton wählen" />
                        </SelectTrigger>
                        <SelectContent>
                            {availableCantons.map((c) => (
                                <SelectItem key={c.code} value={c.code}>
                                    {c.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="category-select">Kategorie</Label>
                    <Select value={category} onValueChange={(value) => onCategoryChange(value as Cat)}>
                        <SelectTrigger id="category-select">
                            <SelectValue placeholder="Kategorie wählen" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="C2">C2 (Kleinbetrieb)</SelectItem>
                            <SelectItem value="C3">C3 (Mittelbetrieb)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="lamp-select">Lampe</Label>
                    <Select value={selectedLamp} onValueChange={onLampChange}>
                        <SelectTrigger id="lamp-select">
                            <SelectValue placeholder="Lampe wählen" />
                        </SelectTrigger>
                        <SelectContent>
                            {sortedLamps.map((lamp) => (
                                <SelectItem key={lamp.id} value={lamp.id.toString()}>
                                    {lamp.name} - {lamp.price} CHF
                                    {lamp.isBaseline && " (Basis)"}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2 lg:col-span-1">
                    <Label htmlFor="year-input">Einbaujahr</Label>
                    <Input
                        id="year-input"
                        type="number"
                        value={installYear}
                        onChange={(e) => onYearChange(parseInt(e.target.value) || currentYear)}
                        min={minYear}
                        max={maxYear}
                        placeholder="Jahr"
                        className="w-24"
                    />
                    <p className="text-xs text-muted-foreground">
                        {minYear} - {maxYear}
                    </p>
                </div>
            </CardContent>
        </Card>
    )
}