import { useTasks } from "@/lib/tasks-store";
import { usePolicies } from "@/lib/policies-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format, isBefore, isToday, addDays, isPast, isAfter, startOfDay } from "date-fns";
import { it } from "date-fns/locale";
import { CheckSquare, AlertCircle, FileText, CalendarClock } from "lucide-react";
import { Link } from "wouter";

export function Dashboard() {
  const { tasks } = useTasks();
  const { policies } = usePolicies();

  const now = startOfDay(new Date());

  const activeTasks = tasks.filter(t => !t.completedAt);
  const tasksDueToday = activeTasks.filter(t => t.dueDate && isToday(new Date(t.dueDate)));
  const overdueTasks = activeTasks.filter(t => t.dueDate && isBefore(new Date(t.dueDate), now));
  
  const inScadenzaPolicies = policies.filter(p => p.status === 'emessa' && p.expiryDate);
  const daEmetterePolicies = policies.filter(p => p.status === 'da_emettere');
  
  const policiesExpiringSoon = inScadenzaPolicies.filter(p => {
    if (!p.expiryDate) return false;
    const exp = new Date(p.expiryDate);
    return isAfter(exp, now) && isBefore(exp, addDays(now, 30));
  });

  const topUrgentTasks = [...activeTasks]
    .filter(t => t.dueDate)
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
    .slice(0, 5);

  const topUpcomingPolicies = [...inScadenzaPolicies]
    .sort((a, b) => new Date(a.expiryDate!).getTime() - new Date(b.expiryDate!).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-serif text-primary mb-2">Buongiorno</h1>
        <p className="text-muted-foreground">Ecco la situazione di oggi, {format(new Date(), "d MMMM yyyy", { locale: it })}.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Attività di oggi</CardTitle>
            <CheckSquare className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tasksDueToday.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Attività in ritardo</CardTitle>
            <AlertCircle className="w-4 h-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{overdueTasks.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Scadenze a 30gg</CardTitle>
            <CalendarClock className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{policiesExpiringSoon.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Da emettere</CardTitle>
            <FileText className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{daEmetterePolicies.length}</div>
          </CardContent>
        </Card>
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
                <div key={p.id} className="flex justify-between items-center p-4 bg-card border rounded-lg shadow-sm">
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
              ))}
            </div>
          ) : (
            <div className="p-8 text-center bg-muted/20 border border-dashed rounded-lg text-muted-foreground">
              Nessuna polizza in scadenza a breve.
            </div>
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
                <div key={t.id} className="flex justify-between items-center p-4 bg-card border rounded-lg shadow-sm">
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
              ))}
            </div>
          ) : (
            <div className="p-8 text-center bg-muted/20 border border-dashed rounded-lg text-muted-foreground">
              Nessuna attività urgente. Ottimo lavoro.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Ensure cn is defined here or imported. Add utility import to dashboard.
import { cn } from "@/lib/utils";
