import { ReactNode } from "react"

export function SidebarSectionTitle({ icon, title, subtitle }: {
    icon: ReactNode
    title: string
    subtitle?: string
}) {
    return (
        <div className="flex items-center gap-3 px-2 py-3">
            <div
                className="bg-sidebar-primary text-sidebar-primary-foreground flex size-8 items-center justify-center rounded-lg">
                { icon }
            </div>
            <div className="flex flex-col">
                <span className="text-sm font-medium leading-tight">{ title }</span>
                { subtitle && (
                    <span className="text-xs text-muted-foreground leading-tight">
            { subtitle }
          </span>
                ) }
            </div>
        </div>
    )
}
