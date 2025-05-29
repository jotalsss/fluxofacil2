
"use client";

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import NextLink from 'next/link';
import { APP_NAME } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Menu, LayoutDashboard, ListChecks, LogOut, UserCircle } from "lucide-react";
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { signOutUser } from '@/lib/firebase/authService';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";


const navItems = [
  { href: '/dashboard', label: 'Painel', icon: LayoutDashboard },
  { href: '/transactions', label: 'Transações', icon: ListChecks },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, loading } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, loading, router]);

  const handleLogout = async () => {
    try {
      await signOutUser();
      toast({ title: "Logout realizado", description: "Você foi desconectado." });
      router.push('/login');
    } catch (error) {
      toast({ variant: "destructive", title: "Erro no Logout", description: "Não foi possível fazer logout." });
    }
  };

  if (loading || !isAuthenticated) {
    // Você pode mostrar um loader aqui ou null, pois o useEffect fará o redirect
    // Para evitar piscar a tela, pode-se mostrar um loader mais persistente ou
    // o AuthProvider já mostra um loader global.
    return (
        <div className="flex justify-center items-center min-h-screen bg-background">
            <Menu className="h-12 w-12 animate-spin text-primary" /> {/* Usando Menu como placeholder de loader */}
        </div>
    );
  }

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
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                      "duration-300 ease-in-out"
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

        <div className="w-auto">
          {isAuthenticated && user && (
             <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                   <UserCircle className="h-7 w-7" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.displayName || "Usuário"}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sair</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </header>
      <main className="flex-1 p-4 md:p-6 lg:p-8 bg-background animate-in fade-in-0 slide-in-from-bottom-5 duration-500 ease-out">
        {children}
      </main>
    </div>
  );
}
