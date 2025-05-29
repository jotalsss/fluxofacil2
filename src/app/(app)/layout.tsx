
import { Sidebar, SidebarContent, SidebarHeader, SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AppSidebarNav from "@/components/layout/SidebarNav";
import { APP_NAME } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import NextLink from 'next/link'; // Import next/link

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider defaultOpen={true} open={true}>
      <Sidebar variant="sidebar" collapsible="icon" className="border-r bg-sidebar text-sidebar-foreground">
        <SidebarHeader className="p-4 flex items-center justify-between">
          <NextLink href="/dashboard" className="flex items-center gap-2 group-data-[collapsible=icon]:hidden">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7 text-primary">
              <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
              <path d="M2 17l10 5 10-5"></path>
              <path d="M2 12l10 5 10-5"></path>
            </svg>
            <h1 className="text-2xl font-semibold text-foreground">
              {APP_NAME}
            </h1>
          </NextLink>
          <NextLink href="/dashboard" className="items-center gap-2 hidden group-data-[collapsible=icon]:flex">
             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-primary">
              <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
              <path d="M2 17l10 5 10-5"></path>
              <path d="M2 12l10 5 10-5"></path>
            </svg>
          </NextLink>
        </SidebarHeader>
        <SidebarContent className="p-2">
          <AppSidebarNav />
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/80 backdrop-blur-sm px-4 md:px-6">
            <div className="md:hidden"> {/* Mobile trigger */}
                <SidebarTrigger asChild>
                    <Button variant="ghost" size="icon"><Menu /></Button>
                </SidebarTrigger>
            </div>
             <div className="hidden md:block"> {/* Desktop trigger, shown when sidebar is icon collapsible */}
                <SidebarTrigger className="peer-data-[variant=sidebar]:hidden" asChild>
                     <Button variant="ghost" size="icon"><Menu /></Button>
                </SidebarTrigger>
            </div>
            <div className="flex-1">
              {/* Page title or breadcrumbs can go here */}
            </div>
            <div>
              {/* User Menu, Notifications, etc. */}
              {/* <UserNav /> */}
            </div>
        </header>
        <main className="flex-1 p-4 md:p-6 lg:p-8 bg-background">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

// Removed local Link component definition
