"use client"

import { Card, CardContent, CardHeader, CardTitle, } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger, } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ChevronDown } from "lucide-react"

import { toast } from "sonner"
import { useElectricityData } from "@/app/hooks/useElectricityData"
import { Cat } from "@/app/types/categories";

export function FilterPanel({
                                cantons, onCantonsChange, category, onCategoryChange,
                            }: {
    cantons: string[]
    onCantonsChange: (c: string[]) => void
    category: Cat
    onCategoryChange: (c: Cat) => void
}) {
    const { data: DEMO, cantons: availableCantons } = useElectricityData()
    
    // Filter cantons that have data for the selected category
    const cantonsWithData = availableCantons.filter(canton => {
        return DEMO[canton.code] && DEMO[canton.code][category]
    })
    
    /* Umschalten eines Kantons */
    const toggleCanton = (c: string) => {
        if (!DEMO[c] || !DEMO[c][category]) {
            /* Fehl-Toast & Abbruch */
            toast.error(`Für «${ c }» liegen derzeit keine ${category} Daten vor.`)
            return
        }
        onCantonsChange(
            cantons.includes(c) ? cantons.filter((x) => x !== c) : [ ...cantons, c ],
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Filter</CardTitle>
            </CardHeader>

            <CardContent className="flex flex-col gap-6 pt-4">
                {/* Kanton MultiSelect */ }
                <div className="space-y-2">
                    <Label>Kanton(e)</Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className="w-56 justify-between">
                                { cantons.length ? cantons.join(", ") : "Bitte wählen" }
                                <ChevronDown className="ml-2 size-4" />
                            </Button>
                        </PopoverTrigger>

                        <PopoverContent className="p-0 w-56">
                            <ScrollArea className="h-60">
                                <div className="p-2 space-y-1">
                                    { cantonsWithData.map((canton) => (
                                        <div
                                            key={ canton.code }
                                            className="flex items-center gap-2 rounded-sm px-2 py-1.5 hover:bg-muted/50"
                                            onClick={ () => toggleCanton(canton.code) }
                                        >
                                            <Checkbox checked={ cantons.includes(canton.code) } />
                                            <span>{ canton.code } - { canton.label }</span>
                                        </div>
                                    )) }
                                </div>
                            </ScrollArea>
                        </PopoverContent>
                    </Popover>
                </div>

                {/* Kategorie */ }
                <div className="space-y-2">
                    <Label>Kategorie</Label>
                    <RadioGroup
                        value={ category }
                        onValueChange={ (val) => onCategoryChange(val as Cat) }
                        className="flex gap-6"
                    >
                        <div className="flex items-center gap-2">
                            <RadioGroupItem value="C2" id="c2" />
                            <Label htmlFor="c2">C2 – mittel</Label>
                        </div>
                        <div className="flex items-center gap-2">
                            <RadioGroupItem value="C3" id="c3" />
                            <Label htmlFor="c3">C3 – gross</Label>
                        </div>
                    </RadioGroup>
                </div>
            </CardContent>
        </Card>
    )
}
