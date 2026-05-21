import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { LayoutDashboard, CheckSquare, FileText, Sun, Moon, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const navItems = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard },
  { path: "/attivita", label: "Attività", icon: CheckSquare },
  { path: "/polizze", label: "Polizze", icon: FileText },
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
        className="flex items-center justify-center w-10 h-10 mx-auto rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
      >
        {isDark ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
      </button>
    );
  }

  return (
    <div className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-sidebar-foreground">
      <Sun className={cn("w-4 h-4 transition-opacity", isDark ? "opacity-50" : "opacity-100")} />
      <Switch
        checked={isDark}
        onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
        disabled={!mounted}
        aria-label="Attiva/disattiva dark mode"
        data-testid="switch-theme"
      />
      <Moon className={cn("w-4 h-4 transition-opacity", isDark ? "opacity-100" : "opacity-50")} />
    </div>
  );
}

export function Shell({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [collapsed, setCollapsed] = useLocalStorage<boolean>("gestionale.sidebar.collapsed.v1", false);

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex min-h-screen bg-muted/30">
        <aside
          className={cn(
            "border-r bg-card flex flex-col transition-[width] duration-200 ease-in-out",
            collapsed ? "w-16" : "w-64"
          )}
        >
          <div
            className={cn(
              "h-16 flex items-center border-b",
              collapsed ? "justify-center px-2" : "justify-between px-4"
            )}
          >
            {!collapsed && (
              <h1 className="font-serif text-xl font-bold text-primary truncate">TO Mattioli DO</h1>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCollapsed(!collapsed)}
              aria-label={collapsed ? "Espandi sidebar" : "Minimizza sidebar"}
              data-testid="button-toggle-sidebar"
              className="text-muted-foreground hover:text-foreground"
            >
              {collapsed ? <PanelLeftOpen className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
            </Button>
          </div>
          <nav className={cn("flex-1 py-6 space-y-2", collapsed ? "px-2" : "px-4")}>
            {navItems.map((item) => {
              const isActive = location === item.path;
              const Icon = item.icon;
              const link = (
                <Link
                  key={item.path}
                  href={item.path}
                  className={cn(
                    "flex items-center rounded-md text-sm font-medium transition-colors",
                    collapsed ? "justify-center w-10 h-10 mx-auto" : "gap-3 px-3 py-2.5",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                  data-testid={`nav-${item.label.toLowerCase()}`}
                >
                  <Icon className="w-5 h-5" />
                  {!collapsed && item.label}
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
          <div className={cn("mt-auto py-4 border-t", collapsed ? "px-2" : "px-4")}>
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
