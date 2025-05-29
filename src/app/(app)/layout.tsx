
"use client"; // Required for usePathname

import { Sidebar, SidebarContent, SidebarHeader, SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
// import AppSidebarNav from "@/components/layout/SidebarNav"; // No longer used here
import { APP_NAME } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Menu, LayoutDashboard, ListChecks } from "lucide-react";
import NextLink from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/transactions', label: 'Transactions', icon: ListChecks },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

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
          {/* <AppSidebarNav /> Removed from here */}
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-30 flex h-16 items-center border-b bg-background/80 backdrop-blur-sm px-4 md:px-6">
            <div className="flex items-center"> {/* Container for triggers */}
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
            </div>

            <nav className="flex-1 flex justify-center items-center">
              <div className="flex space-x-1">
                {navItems.map((item) => {
                  const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
                  return (
                    <NextLink key={item.label} href={item.href} legacyBehavior passHref>
                      <a
                        className={cn(
                          "inline-flex items-center justify-center rounded-md px-3 py-1.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
                          isActive
                            ? "bg-primary/10 text-primary shadow-sm"
                            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                          "group-data-[collapsible=icon]:hidden" // Hide text if sidebar is collapsed to icon, if needed for other context
                        )}
                      >
                        <item.icon className={cn("h-4 w-4 mr-2", isActive ? "text-primary" : "text-muted-foreground group-hover:text-accent-foreground")} />
                        {item.label}
                      </a>
                    </NextLink>
                  );
                })}
              </div>
            </nav>

            <div>
              {/* User Menu, Notifications, etc. can go here */}
            </div>
        </header>
        <main className="flex-1 p-4 md:p-6 lg:p-8 bg-background">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
