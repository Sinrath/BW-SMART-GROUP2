"use client"

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

import { DEMO, LAMPS, CANTON_LIST } from "@/app/fakeData"
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
                                {CANTON_LIST.map(c=>(
                                    <div key={c} className="px-3 py-1.5 hover:bg-muted/50 flex gap-2 items-center"
                                         onClick={()=>toggleC(c)}>
                                        <Checkbox checked={cantons.includes(c)}/>
                                        {c}
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
                            <RadioGroupItem value="C2" id="c2"/><Label htmlFor="c2">C2</Label>
                        </div>
                        <div className="flex items-center gap-2">
                            <RadioGroupItem value="C3" id="c3"/><Label htmlFor="c3">C3</Label>
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
                        {Array.from({length:8},(_,i)=>2017+i).map(y=>(
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>
                </div>

                {/* Smart-Lampenauswahl */}
                <div className="col-span-full space-y-1">
                    <Label>Smarte Lampen</Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className="w-48 justify-between">
                                {lamps.length
                                    ? lamps.length===1
                                        ? LAMPS[lamps[0]].label
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
