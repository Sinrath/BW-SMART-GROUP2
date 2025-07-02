"use client"
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

import { DEMO, LAMPS, CANTON_LIST } from "@/app/fakeData"
import { Cat } from "@/app/types/categories"

const lampList = Object.entries(LAMPS)
const YEARS = [2017,2018,2019,2020,2021,2022,2023,2024]

export function FilterPanelAmortisation({
                                            canton,          onCantonChange,
                                            category,        onCategoryChange,
                                            lamps,           onLampsChange,
                                            installYear,     onYearChange,
                                            className,
                                        }: {
    canton: string;  onCantonChange:(c:string)=>void
    category: Cat;   onCategoryChange:(c:Cat)=>void
    lamps: string[]; onLampsChange:(l:string[])=>void
    installYear:number; onYearChange:(y:number)=>void
    className?: string
}) {
    const toggleLamp = (id:string)=>
        onLampsChange(lamps.includes(id)? lamps.filter(x=>x!==id): [...lamps,id])

    const selectCanton = (c:string)=>{
        if(!DEMO[c]){ toast.error(`Für «${c}» keine Daten`); return }
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
                                {CANTON_LIST.map(c=>(
                                    <div key={c}
                                         className="cursor-pointer px-3 py-1.5 hover:bg-muted/50"
                                         onClick={()=>selectCanton(c)}>
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
                    <RadioGroup
                        value={category}
                        onValueChange={v=>onCategoryChange(v as Cat)}
                        className="flex gap-4"
                    >
                        {["C2","C3"].map(k=>(
                            <div key={k} className="flex items-center gap-2">
                                <RadioGroupItem value={k} id={`cat-${k}`}/>
                                <Label htmlFor={`cat-${k}`}>{k}</Label>
                            </div>
                        ))}
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
                                        : lamps.map(id=>LAMPS[id].label.split(" ")[0]).join(", ")
                                    : "Bitte wählen"}
                                <ChevronDown className="ml-2 size-4"/>
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="p-0 w-60">
                            <ScrollArea className="h-56">
                                <div className="p-2 space-y-1">
                                    {lampList.map(([id,l])=>(
                                        <div key={id}
                                             className="flex items-center gap-2 rounded-sm px-2 py-1.5 hover:bg-muted/50 cursor-pointer"
                                             onClick={()=>toggleLamp(id)}>
                                            <Checkbox checked={lamps.includes(id)}/>
                                            <span>{l.label}</span>
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
