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
import { Book, Home } from "lucide-react";
import { usePathname } from "next/navigation";

interface NavItem {
    title: string;
    url: string;
    icon?: React.ComponentType<{ className?: string }>;
    isActive?: boolean;
}

interface NavSection {
    title: string;
    url: string;
    items: NavItem[];
}

const navMain: NavSection[] = [
    {
        title: "Start",
        url: "/",
        items: [
            { title: "Startseite", url: "/", icon: Home },
        ],
    },
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
            { title: "Strompreis-Analyse", url: "/tool/price-analysis", isActive: true },
            { title: "Historie-Rechner", url: "/tool/historical-calculator" },
            { title: "Prognose-Rechner", url: "/tool/prediction-calculator" },
            { title: "Szenario-Vergleich", url: "/tool/canton-comparison" },
            { title: "LED-Übersicht", url: "/tool/lifetime-calculator" },
        ],
    },
];


export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const pathname = usePathname()

    return (
        <Sidebar {...props}>
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
                                    const Icon = subItem.icon
                                    return (
                                        <SidebarMenuItem key={ subItem.title }>
                                            <SidebarMenuButton asChild isActive={ isActive }>
                                                <a href={ subItem.url }>
                                                    { Icon && <Icon className="mr-2 h-4 w-4" /> }
                                                    { subItem.title }
                                                </a>
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
