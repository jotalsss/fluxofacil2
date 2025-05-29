
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ListChecks, DollarSign } from 'lucide-react'; // DollarSign is not used here, but keeping for consistency if added later
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/transactions', label: 'Transactions', icon: ListChecks },
  // Future pages can be added here
  // { href: '/reports', label: 'Reports', icon: BarChart3 },
  // { href: '/settings', label: 'Settings', icon: Settings },
];

export default function AppSidebarNav() {
  const pathname = usePathname();

  return (
    <SidebarMenu>
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
        return (
          <SidebarMenuItem key={item.label}>
            <SidebarMenuButton
              asChild
              isActive={isActive}
              className={cn(
                // w-full and justify-start are part of the base button variant styles
                // but explicitly keeping them here if they were intended as overrides.
                // Base variant already includes: "flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm"
                "w-full justify-start",
                isActive && "bg-sidebar-accent text-sidebar-accent-foreground"
              )}
              tooltip={{ children: item.label, side: 'right', align: 'center' }}
            >
              <Link href={item.href} legacyBehavior passHref>
                <a> {/* This 'a' tag will receive classes from SidebarMenuButton via asChild */}
                  <Icon className="h-5 w-5" /> {/* Removed mr-3; gap is handled by parent's flex properties */}
                  <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
                </a>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}
