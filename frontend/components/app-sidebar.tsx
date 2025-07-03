"use client"

import * as React from "react"
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
} from "@/components/ui/sidebar"
import { SidebarSectionTitle } from "@/components/SidebarTitle";
import { Book } from "lucide-react";
import { usePathname } from "next/navigation";

const navMain = [
    {
        title: "Dokumentation",
        url: "/dokumentation",
        items: [
            { title: "Disposition", url: "/dokumentation/disposition" },
            { title: "Wissenschaftliche Arbeit", url: "/dokumentation/arbeit" },
        ],
    },
    {
        title: "Analysen",
        url: "/tool",
        items: [
            { title: "Strompreis-Analyse", url: "/tool/strompreise", isActive: true },
            { title: "LED-Amortisation", url: "/tool/amortisation" },
            { title: "Szenario-Vergleich", url: "/tool/szenarien" },
            { title: "Prognose-Rechner", url: "/tool/vorhersage" },
        ],
    },
];


export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const pathname = usePathname()

    return (
        <Sidebar { ...props }>
            <SidebarHeader>
                <SidebarSectionTitle title="Smart Living Dashboard"
                                     icon={ <Book className="size-4" /> }
                                     subtitle="Disposition & Arbeit"
                />

            </SidebarHeader>
            <SidebarContent>
                {/* We create a SidebarGroup for each parent. */ }
                { navMain.map((item) => (
                    <SidebarGroup key={ item.title }>
                        <SidebarGroupLabel>{ item.title }</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                { item.items.map((subItem) => {
                                    const isActive = pathname === subItem.url
                                    return (
                                        <SidebarMenuItem key={ subItem.title }>
                                            <SidebarMenuButton asChild isActive={ isActive }>
                                                <a href={ subItem.url }>{ subItem.title }</a>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    )
                                }) }
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                )) }
            </SidebarContent>
            <SidebarRail />
        </Sidebar>
    )
}
