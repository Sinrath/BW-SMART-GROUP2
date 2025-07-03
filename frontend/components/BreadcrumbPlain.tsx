"use client"

import { usePathname } from "next/navigation"
import { DotIcon } from "lucide-react"

const segmentLabels: Record<string, string> = {
    dokumentation: "Dokumentation",
    disposition: "Disposition",
    arbeit: "Wissenschaftliche Arbeit",
    tool: "Analysen",
    strompreise: "Strompreis-Analyse",
    amortisation: "Historie-Rechner",
    szenarien: "Szenario-Vergleich",
    vorhersage: "Prognose-Rechner",
}

export function BreadcrumbPlain() {
    const pathname = usePathname()
    const segments = pathname.split("/").filter(Boolean)

    if (segments.length === 0) return null

    return (
        <div className="flex items-center text-sm text-muted-foreground space-x-1">
            { segments.map((segment, index) => {
                const label = segmentLabels[segment] || segment
                const isLast = index === segments.length - 1

                return (
                    <span key={ index } className="flex items-center">
            <span className={ isLast ? "font-medium text-foreground" : "" }>
              { label }
            </span>
                        { !isLast && <DotIcon className="mx-1 size-4" /> }
          </span>
                )
            }) }
        </div>
    )
}
