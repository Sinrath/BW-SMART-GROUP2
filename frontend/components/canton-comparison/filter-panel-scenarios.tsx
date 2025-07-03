"use client"

import React from "react"
import {
    Card, CardHeader, CardContent, CardTitle,
} from "@/components/ui/card"
import {
    Popover, PopoverTrigger, PopoverContent,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Slider } from "@/components/ui/slider"
import { ChevronDown } from "lucide-react"
import { toast } from "sonner"

import { useElectricityData } from "@/app/hooks/useElectricityData"
import { useLedTubeData } from "@/app/hooks/useLedTubeData"
import { Cat } from "@/app/types/categories"

export function FilterPanelScenarios({
                                         cantons,onCantonsChange,
                                         category,onCategoryChange,
                                         lamps,onLampsChange,
                                         installYear,onYearChange,
                                         runtime,onRuntimeChange,
                                     }:{
    cantons:string[];onCantonsChange:(c:string[])=>void
    category:Cat;    onCategoryChange:(c:Cat)=>void
    lamps:string[];  onLampsChange:(l:string[])=>void
    installYear:number; onYearChange:(y:number)=>void
    runtime:number;     onRuntimeChange:(r:number)=>void
}){
    const { data: DEMO, cantons: availableCantons } = useElectricityData()
    const { tubes } = useLedTubeData()
    
    const LAMPS = tubes.filter(t => !t.isBaseline).reduce((acc, tube) => {
        const key = tube.name.toLowerCase().replace(/[^a-z]/g, '')
        acc[key] = {
            label: tube.name,
            price: tube.price,
            watt: tube.watt
        }
        return acc
    }, {} as Record<string, { label: string; price: number; watt: number }>)

    const validLampIds = Object.keys(LAMPS)
    
    // Clean up invalid lamp IDs from state
    React.useEffect(() => {
        const validSelectedLamps = lamps.filter(id => validLampIds.includes(id))
        if (validSelectedLamps.length !== lamps.length) {
            console.log('Cleaning up invalid lamp IDs in scenarios:', lamps, '→', validSelectedLamps)
            onLampsChange(validSelectedLamps)
        }
    }, [validLampIds.join(','), lamps.join(',')]) // eslint-disable-line react-hooks/exhaustive-deps
    
    // Reset installation year if it's too recent (need sufficient historical data for amortization)
    React.useEffect(() => {
        if (installYear > 2021) {
            console.log('Resetting installation year from', installYear, 'to 2020 (insufficient historical data)')
            onYearChange(2020)
        }
    }, [installYear, onYearChange])

    const toggleC=(c:string)=>{
        if(!DEMO[c]){ toast.error(`Keine Daten für ${c}`); return }
        onCantonsChange(cantons.includes(c)? cantons.filter(x=>x!==c):[...cantons,c])
    }
    const toggleLamp=(id:string)=>
        onLampsChange(lamps.includes(id)? lamps.filter(x=>x!==id):[...lamps,id])

    return (
        <Card>
            <CardHeader><CardTitle>Filter</CardTitle></CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Kantone */}
                <div className="space-y-1">
                    <Label>Kanton(e)</Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className="w-48 justify-between">
                                {cantons.length? cantons.join(", "):"Bitte wählen"}
                                <ChevronDown className="size-4 ml-2"/>
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="p-0 w-48">
                            <ScrollArea className="h-56">
                                {availableCantons.map(canton=>(
                                    <div key={canton.code} className="px-3 py-1.5 hover:bg-muted/50 flex gap-2 items-center"
                                         onClick={()=>toggleC(canton.code)}>
                                        <Checkbox checked={cantons.includes(canton.code)}/>
                                        {canton.code} - {canton.label}
                                    </div>
                                ))}
                            </ScrollArea>
                        </PopoverContent>
                    </Popover>
                </div>

                {/* Kategorie */}
                <div className="space-y-1">
                    <Label>Kategorie</Label>
                    <RadioGroup value={category} onValueChange={(v)=>onCategoryChange(v as Cat)}
                                className="flex gap-6">
                        <div className="flex items-center gap-2">
                            <RadioGroupItem value="C2" id="c2"/><Label htmlFor="c2">C2: Kleinbetrieb (30&apos;000 kWh/Jahr)</Label>
                        </div>
                        <div className="flex items-center gap-2">
                            <RadioGroupItem value="C3" id="c3"/><Label htmlFor="c3">C3: Mittlerer Betrieb (150&apos;000 kWh/Jahr)</Label>
                        </div>
                    </RadioGroup>
                </div>

                {/* Installation */}
                <div className="space-y-1">
                    <Label>Installationsjahr</Label>
                    <select
                        className="border rounded-md px-3 py-2 text-sm"
                        value={installYear}
                        onChange={(e)=>onYearChange(+e.target.value)}
                    >
                        {Array.from({length:11},(_,i)=>2011+i).map(y=>(
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>
                    <div className="text-xs text-muted-foreground">
                        Jahre ab 2022 haben unzureichende historische Daten für Amortisationsberechnungen
                    </div>
                </div>

                {/* Smart-Lampenauswahl */}
                <div className="col-span-full space-y-1">
                    <Label>Smarte Lampen</Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className="w-48 justify-between">
                                {lamps.length
                                    ? lamps.length===1
                                        ? LAMPS[lamps[0]]?.label || lamps[0]
                                        : `${lamps.length} Lampen gewählt`
                                    : "Bitte wählen"}
                                <ChevronDown className="size-4 ml-2"/>
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="p-0 w-56">
                            {Object.entries(LAMPS).map(([id,l])=>(
                                <div key={id}
                                     className="px-3 py-1.5 hover:bg-muted/50 flex gap-2 items-center"
                                     onClick={()=>toggleLamp(id)}>
                                    <Checkbox checked={lamps.includes(id)}/>
                                    {l.label}
                                </div>
                            ))}
                        </PopoverContent>
                    </Popover>
                </div>

                {/* Laufzeit */}
                <div className="col-span-full space-y-1">
                    <Label>Laufzeit pro Jahr: {runtime.toLocaleString("de-CH")} h</Label>
                    <Slider
                        value={[runtime]}
                        onValueChange={v=>onRuntimeChange(v[0])}
                        min={3000} max={9000} step={500}
                    />
                </div>
            </CardContent>
        </Card>
    )
}