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
        title: "Amortisationsrechner",
        url: "/tool",
        items: [
            { title: "Strompreis-Explorer", url: "/tool/strompreise", isActive: true },
            { title: "Amortisations-Graf", url: "/tool/amortisation" },
            { title: "Szenarien-Vergleich", url: "/tool/szenarien" },
        ],
    },
];


export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
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
                                { item.items.map((item) => (
                                    <SidebarMenuItem key={ item.title }>
                                        <SidebarMenuButton asChild isActive={ item.isActive }>
                                            <a href={ item.url }>{ item.title }</a>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                )) }
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                )) }
            </SidebarContent>
            <SidebarRail />
        </Sidebar>
    )
}
