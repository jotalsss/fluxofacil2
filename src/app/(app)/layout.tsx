
"use client"; // Required for usePathname

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
    <div className="flex min-h-svh w-full flex-col">
      <header className="sticky top-0 z-30 flex h-16 items-center border-b bg-background/80 backdrop-blur-sm px-4 md:px-6">
        <div className="flex items-center gap-2">
          <NextLink href="/dashboard" className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7 text-primary">
              <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
              <path d="M2 17l10 5 10-5"></path>
              <path d="M2 12l10 5 10-5"></path>
            </svg>
            <h1 className="text-2xl font-semibold text-foreground hidden sm:block">
              {APP_NAME}
            </h1>
          </NextLink>
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
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <item.icon className={cn("h-4 w-4", isActive ? "text-primary" : "text-muted-foreground group-hover:text-accent-foreground", "sm:mr-2")} />
                    <span className="hidden sm:inline">{item.label}</span>
                  </a>
                </NextLink>
              );
            })}
          </div>
        </nav>

        <div className="w-[calc(var(--sidebar-width-icon)_+_theme(spacing.4))] sm:w-auto">
          {/* User Menu, Notifications, etc. can go here, preserving some space on the right if needed */}
        </div>
      </header>
      <main className="flex-1 p-4 md:p-6 lg:p-8 bg-background">
        {children}
      </main>
    </div>
  );
}
