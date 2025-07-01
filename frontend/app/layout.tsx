import type { Metadata } from "next";
import "./globals.css";

import { AppSidebar } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger, } from "@/components/ui/sidebar";
import { BreadcrumbPlain } from "@/components/DynamicBreadcrumb";

export const metadata: Metadata = {
    title: "Dashboard",
    description: "Amortisations Dashboard für Smarte LED-Röhren",
};

export default function RootLayout({ children }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="de">
        <body className="flex min-h-screen">
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
                    <SidebarTrigger className="-ml-1" />
                    <Separator
                        orientation="vertical"
                        className="mr-2 data-[orientation=vertical]:h-4"
                    />
                    <BreadcrumbPlain />
                </header>
                <main className="flex flex-1 flex-col gap-4 p-4">
                    { children }
                </main>
            </SidebarInset>
        </SidebarProvider>
        </body>
        </html>
    );
}
