import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { LayoutDashboard, CheckSquare, FileText, Sun, Moon, PanelLeftClose, PanelLeftOpen, AlertOctagon } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const navItems = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard },
  { path: "/attivita", label: "Da Fare", icon: CheckSquare },
  { path: "/polizze-personali", label: "Polizze Personali", icon: FileText },
  { path: "/polizze-agenzia", label: "Polizze Agenzia", icon: FileText },
  { path: "/sinistri", label: "Sinistri", icon: AlertOctagon },
];

function ThemeToggle({ collapsed }: { collapsed: boolean }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted ? resolvedTheme === "dark" : false;

  if (collapsed) {
    return (
      <button
        type="button"
        onClick={() => setTheme(isDark ? "light" : "dark")}
        disabled={!mounted}
        aria-label="Attiva/disattiva dark mode"
        data-testid="switch-theme"
        className="flex items-center justify-center w-10 h-10 mx-auto rounded-md text-sidebar-foreground/60 hover:bg-white/5 hover:text-sidebar-foreground transition-colors"
      >
        {isDark ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
      </button>
    );
  }

  return (
    <div className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-sidebar-foreground/80">
      <Sun className={cn("w-4 h-4 transition-opacity", isDark ? "opacity-40" : "opacity-100")} />
      <Switch
        checked={isDark}
        onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
        disabled={!mounted}
        aria-label="Attiva/disattiva dark mode"
        data-testid="switch-theme"
      />
      <Moon className={cn("w-4 h-4 transition-opacity", isDark ? "opacity-100" : "opacity-40")} />
    </div>
  );
}

function Logo({ collapsed }: { collapsed: boolean }) {
  if (collapsed) {
    return (
      <div className="flex items-center justify-center w-9 h-9 rounded-md bg-gold/15 text-gold font-serif font-bold text-base">
        M
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2.5 min-w-0">
      <div className="flex items-center justify-center w-9 h-9 rounded-md bg-gold/15 text-gold font-serif font-bold text-base shrink-0">
        M
      </div>
      <div className="min-w-0 leading-tight">
        <div className="font-serif text-base font-semibold text-sidebar-foreground truncate">
          TO Mattioli DO
        </div>
        <div className="text-[10px] uppercase tracking-[0.18em] text-sidebar-foreground/50">
          Gestionale
        </div>
      </div>
    </div>
  );
}

export function Shell({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [collapsed, setCollapsed] = useLocalStorage<boolean>("gestionale.sidebar.collapsed.v1", false);

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex min-h-screen bg-app-gradient">
        <aside
          className={cn(
            "border-r border-sidebar-border bg-sidebar bg-sidebar-gradient flex flex-col transition-[width] duration-200 ease-in-out",
            collapsed ? "w-16" : "w-64"
          )}
        >
          <div
            className={cn(
              "h-16 flex items-center border-b border-sidebar-border/60",
              collapsed ? "justify-center px-2" : "justify-between px-4"
            )}
          >
            <Logo collapsed={collapsed} />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCollapsed(!collapsed)}
              aria-label={collapsed ? "Espandi sidebar" : "Minimizza sidebar"}
              data-testid="button-toggle-sidebar"
              className={cn(
                "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-white/5",
                collapsed && "hidden"
              )}
            >
              <PanelLeftClose className="w-5 h-5" />
            </Button>
          </div>
          {collapsed && (
            <div className="px-2 pt-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCollapsed(false)}
                aria-label="Espandi sidebar"
                className="w-10 h-10 mx-auto text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-white/5"
              >
                <PanelLeftOpen className="w-5 h-5" />
              </Button>
            </div>
          )}
          <nav className={cn("flex-1 py-6 space-y-1", collapsed ? "px-2" : "px-3")}>
            {navItems.map((item) => {
              const isActive = location === item.path;
              const Icon = item.icon;
              const link = (
                <Link
                  key={item.path}
                  href={item.path}
                  className={cn(
                    "group relative flex items-center rounded-md text-sm font-medium transition-all",
                    collapsed ? "justify-center w-10 h-10 mx-auto" : "gap-3 px-3 py-2.5",
                    isActive
                      ? "bg-white/10 text-sidebar-foreground"
                      : "text-sidebar-foreground/60 hover:bg-white/5 hover:text-sidebar-foreground"
                  )}
                  data-testid={`nav-${item.label.toLowerCase()}`}
                >
                  {isActive && !collapsed && (
                    <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-r bg-gold" aria-hidden />
                  )}
                  <Icon className={cn("w-[18px] h-[18px] shrink-0", isActive && "text-gold")} />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </Link>
              );

              if (collapsed) {
                return (
                  <Tooltip key={item.path}>
                    <TooltipTrigger asChild>{link}</TooltipTrigger>
                    <TooltipContent side="right">{item.label}</TooltipContent>
                  </Tooltip>
                );
              }
              return link;
            })}
          </nav>
          <div className={cn("mt-auto py-4 border-t border-sidebar-border/60", collapsed ? "px-2" : "px-4")}>
            <ThemeToggle collapsed={collapsed} />
          </div>
        </aside>
        <main className="flex-1 overflow-auto min-w-0">
          <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 xl:p-10">
            {children}
          </div>
        </main>
      </div>
    </TooltipProvider>
  );
}
