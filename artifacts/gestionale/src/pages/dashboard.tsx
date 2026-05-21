import { useTasks } from "@/lib/tasks-store";
import { usePolicies } from "@/lib/policies-store";
import { useSettings } from "@/hooks/use-settings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format, isBefore, isToday, addDays, isAfter, startOfDay } from "date-fns";
import { it } from "date-fns/locale";
import { CheckSquare, AlertCircle, FileText, CalendarClock, Plus } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Dashboard() {
  const { tasks } = useTasks();
  const { policies } = usePolicies();
  const { settings } = useSettings();

  const now = startOfDay(new Date());
  const threshold = settings.expiryThresholdDays;

  const activeTasks = tasks.filter(t => !t.completedAt);
  const tasksDueToday = activeTasks.filter(t => t.dueDate && isToday(new Date(t.dueDate)));
  const overdueTasks = activeTasks.filter(t => t.dueDate && isBefore(new Date(t.dueDate), now));

  const inScadenzaPolicies = policies.filter(p => p.status === 'emessa' && p.expiryDate);
  const daEmetterePolicies = policies.filter(p => p.status === 'da_emettere');

  const policiesExpiringSoon = inScadenzaPolicies.filter(p => {
    if (!p.expiryDate) return false;
    const exp = new Date(p.expiryDate);
    return isAfter(exp, now) && isBefore(exp, addDays(now, threshold));
  });

  const topUrgentTasks = [...activeTasks]
    .filter(t => t.dueDate)
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
    .slice(0, 5);

  const topUpcomingPolicies = [...inScadenzaPolicies]
    .sort((a, b) => new Date(a.expiryDate!).getTime() - new Date(b.expiryDate!).getTime())
    .slice(0, 5);

  const statCards = [
    {
      title: "Attività di oggi",
      value: tasksDueToday.length,
      icon: <CheckSquare className="w-4 h-4 text-muted-foreground" />,
      href: "/attivita",
      testId: "card-tasks-today",
    },
    {
      title: "Attività in ritardo",
      value: overdueTasks.length,
      valueClass: "text-destructive",
      icon: <AlertCircle className="w-4 h-4 text-destructive" />,
      href: "/attivita",
      testId: "card-tasks-overdue",
    },
    {
      title: `Scadenze a ${threshold}gg`,
      value: policiesExpiringSoon.length,
      icon: <CalendarClock className="w-4 h-4 text-muted-foreground" />,
      href: "/polizze",
      testId: "card-policies-expiring",
    },
    {
      title: "Da emettere",
      value: daEmetterePolicies.length,
      icon: <FileText className="w-4 h-4 text-muted-foreground" />,
      href: "/polizze",
      testId: "card-policies-to-issue",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-serif text-primary mb-2">Buongiorno</h1>
          <p className="text-muted-foreground">Ecco la situazione di oggi, {format(new Date(), "d MMMM yyyy", { locale: it })}.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/attivita">
            <Button variant="outline" data-testid="button-quick-new-task">
              <Plus className="w-4 h-4 mr-2" />
              Nuova attività
            </Button>
          </Link>
          <Link href="/polizze">
            <Button data-testid="button-quick-new-policy">
              <Plus className="w-4 h-4 mr-2" />
              Nuova polizza
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((c) => (
          <Link key={c.testId} href={c.href} className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg">
            <Card
              className="cursor-pointer transition-all hover:shadow-md hover:border-primary/40 hover:-translate-y-0.5"
              data-testid={c.testId}
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{c.title}</CardTitle>
                {c.icon}
              </CardHeader>
              <CardContent>
                <div className={cn("text-2xl font-bold", c.valueClass)}>{c.value}</div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-serif text-primary">Prossime scadenze</h2>
            <Link href="/polizze" className="text-sm text-muted-foreground hover:text-primary">
              Vedi tutte &rarr;
            </Link>
          </div>
          {topUpcomingPolicies.length > 0 ? (
            <div className="space-y-3">
              {topUpcomingPolicies.map(p => (
                <Link key={p.id} href="/polizze" className="block">
                  <div
                    className="flex justify-between items-center p-4 bg-card border rounded-lg shadow-sm cursor-pointer transition-all hover:shadow-md hover:border-primary/40"
                    data-testid={`dashboard-policy-${p.id}`}
                  >
                    <div>
                      <div className="font-medium">{p.clientName}</div>
                      <div className="text-sm text-muted-foreground">{p.policyType}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {p.expiryDate ? format(new Date(p.expiryDate), 'd MMM yyyy', { locale: it }) : ''}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <Link href="/polizze" className="block">
              <div className="p-8 text-center bg-muted/20 border border-dashed rounded-lg text-muted-foreground cursor-pointer hover:border-primary/40 hover:text-primary transition-all">
                Nessuna polizza in scadenza a breve.
              </div>
            </Link>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-serif text-primary">Attività urgenti</h2>
            <Link href="/attivita" className="text-sm text-muted-foreground hover:text-primary">
              Vedi tutte &rarr;
            </Link>
          </div>
          {topUrgentTasks.length > 0 ? (
            <div className="space-y-3">
              {topUrgentTasks.map(t => (
                <Link key={t.id} href="/attivita" className="block">
                  <div
                    className="flex justify-between items-center p-4 bg-card border rounded-lg shadow-sm cursor-pointer transition-all hover:shadow-md hover:border-primary/40"
                    data-testid={`dashboard-task-${t.id}`}
                  >
                    <div className="truncate pr-4">
                      <div className="font-medium truncate">{t.title}</div>
                      {t.notes && <div className="text-sm text-muted-foreground truncate">{t.notes}</div>}
                    </div>
                    <div className="text-right whitespace-nowrap">
                      <div className={cn("text-sm font-medium", t.dueDate && isBefore(new Date(t.dueDate), now) ? "text-destructive" : "")}>
                        {t.dueDate ? format(new Date(t.dueDate), 'd MMM yyyy', { locale: it }) : ''}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <Link href="/attivita" className="block">
              <div className="p-8 text-center bg-muted/20 border border-dashed rounded-lg text-muted-foreground cursor-pointer hover:border-primary/40 hover:text-primary transition-all">
                Nessuna attività urgente. Ottimo lavoro.
              </div>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
