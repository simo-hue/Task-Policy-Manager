import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { LayoutDashboard, CheckSquare, FileText, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";

const navItems = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard },
  { path: "/attivita", label: "Attività", icon: CheckSquare },
  { path: "/polizze", label: "Polizze", icon: FileText },
];

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted ? resolvedTheme === "dark" : false;

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

  return (
    <div className="flex min-h-screen bg-muted/30">
      <aside className="w-64 border-r bg-card flex flex-col">
        <div className="h-16 flex items-center px-6 border-b">
          <h1 className="font-serif text-xl font-bold text-primary">TO Mattioli DO</h1>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map((item) => {
            const isActive = location === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
                data-testid={`nav-${item.label.toLowerCase()}`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto px-4 py-4 border-t">
          <ThemeToggle />
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        <div className="max-w-5xl mx-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
