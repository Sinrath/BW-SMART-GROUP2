"use client"
import React from "react"
import {
    Card, CardHeader, CardContent, CardTitle,
} from "@/components/ui/card"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ChevronDown } from "lucide-react"
import { toast } from "sonner"
import clsx from "clsx"

import { Cat } from "@/app/types/categories"
import { LedTube, ElectricityData } from "@/app/services/api"

const YEARS = [2011,2012,2013,2014,2015,2016,2017,2018,2019,2020,2021,2022,2023,2024]

export function FilterPanelAmortisation({
                                            canton,          onCantonChange,
                                            category,        onCategoryChange,
                                            lamps,           onLampsChange,
                                            installYear,     onYearChange,
                                            className,
                                            availableCantons,
                                            availableLamps,
                                            electricityData,
                                        }: {
    canton: string;  onCantonChange:(c:string)=>void
    category: Cat;   onCategoryChange:(c:Cat)=>void
    lamps: string[]; onLampsChange:(l:string[])=>void
    installYear:number; onYearChange:(y:number)=>void
    className?: string
    availableCantons: Array<{code: string, label: string}>
    availableLamps: LedTube[]
    electricityData: ElectricityData
}) {
    const lampList = availableLamps.filter(tube => !tube.isBaseline).map(tube => [
        tube.name.toLowerCase().replace(/[^a-z]/g, ''),
        tube
    ] as [string, LedTube])
    
    const validLampIds = lampList.map(([id]) => id)
    
    // Clean up invalid lamp IDs from state
    React.useEffect(() => {
        const validSelectedLamps = lamps.filter(id => validLampIds.includes(id))
        if (validSelectedLamps.length !== lamps.length) {
            console.log('Cleaning up invalid lamp IDs:', lamps, '→', validSelectedLamps)
            onLampsChange(validSelectedLamps)
        }
    }, [validLampIds.join(','), lamps.join(',')]) // eslint-disable-line react-hooks/exhaustive-deps
    
    const toggleLamp = (id:string)=> {
        const newLamps = lamps.includes(id) ? lamps.filter(x=>x!==id) : [...lamps,id]
        onLampsChange(newLamps)
    }

    const selectCanton = (c:string)=>{
        if(!electricityData[c]){ toast.error(`Für «${c}» keine Daten`); return }
        onCantonChange(c)
    }

    return (
        <Card className={clsx(className)}>
            <CardHeader><CardTitle>Filter</CardTitle></CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

                {/* Kanton */}
                <div className="space-y-1">
                    <Label>Kanton</Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className="w-40 justify-between">
                                {canton} <ChevronDown className="ml-2 size-4"/>
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="p-0 w-40">
                            <ScrollArea className="h-56">
                                {availableCantons.map(canton=>(
                                    <div key={canton.code}
                                         className="cursor-pointer px-3 py-1.5 hover:bg-muted/50"
                                         onClick={()=>selectCanton(canton.code)}>
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
                    <RadioGroup
                        value={category}
                        onValueChange={v=>onCategoryChange(v as Cat)}
                        className="flex gap-4"
                    >
                        <div className="flex items-center gap-2">
                            <RadioGroupItem value="C2" id="cat-C2"/>
                            <Label htmlFor="cat-C2">C2: Kleinbetrieb (30&apos;000 kWh/Jahr)</Label>
                        </div>
                        <div className="flex items-center gap-2">
                            <RadioGroupItem value="C3" id="cat-C3"/>
                            <Label htmlFor="cat-C3">C3: Mittlerer Betrieb (150&apos;000 kWh/Jahr)</Label>
                        </div>
                    </RadioGroup>
                </div>

                {/* Installationsjahr */}
                <div className="space-y-1">
                    <Label>Installationsjahr</Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className="w-40 justify-between">
                                {installYear} <ChevronDown className="ml-2 size-4"/>
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="p-0 w-40">
                            {YEARS.map(y=>(
                                <div key={y}
                                     className="cursor-pointer px-3 py-1.5 hover:bg-muted/50"
                                     onClick={()=>onYearChange(y)}>
                                    {y}
                                </div>
                            ))}
                        </PopoverContent>
                    </Popover>
                </div>

                {/* Smart-Lampen MultiSelect */}
                <div className="col-span-full space-y-1">
                    <Label>Smarte Lampen</Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className="w-48 justify-between truncate">
                                {lamps.length
                                    ? lamps.length>2
                                        ? `${lamps.length} Lampen gewählt`
                                        : lamps.map(id=>{
                                            const tube = availableLamps.find(t => t.name.toLowerCase().replace(/[^a-z]/g, '') === id)
                                            return tube ? tube.name.split(" ")[0] : id
                                        }).join(", ")
                                    : "Bitte wählen"}
                                <ChevronDown className="ml-2 size-4"/>
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="p-0 w-60">
                            <ScrollArea className="h-56">
                                <div className="p-2 space-y-1">
                                    {lampList.map(([id,tube])=>(
                                        <div key={id}
                                             className="flex items-center gap-2 rounded-sm px-2 py-1.5 hover:bg-muted/50 cursor-pointer"
                                             onClick={()=>toggleLamp(id)}>
                                            <Checkbox checked={lamps.includes(id)}/>
                                            <span>{tube.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </PopoverContent>
                    </Popover>
                </div>
            </CardContent>
        </Card>
    )
}