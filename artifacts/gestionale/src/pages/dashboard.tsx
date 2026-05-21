import { useTasks } from "@/lib/tasks-store";
import { usePoliciesPersonali, usePoliciesAgenzia } from "@/lib/policies-store";
import { useSettings } from "@/hooks/use-settings";
import { Card } from "@/components/ui/card";
import { format, isBefore, isToday, addDays, isAfter, startOfDay, differenceInCalendarDays } from "date-fns";
import { it } from "date-fns/locale";
import { CheckSquare, AlertCircle, FileText, CalendarClock, Plus, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { cn, parseLocalDate } from "@/lib/utils";

type Tone = "neutral" | "danger" | "gold" | "muted";

const toneStyles: Record<Tone, { chip: string; value: string }> = {
  neutral: { chip: "bg-primary/10 text-primary", value: "text-foreground" },
  danger: { chip: "bg-destructive/10 text-destructive", value: "text-destructive" },
  gold: { chip: "bg-gold/15 text-gold", value: "text-foreground" },
  muted: { chip: "bg-muted text-muted-foreground", value: "text-foreground" },
};

export function Dashboard() {
  const { tasks } = useTasks();
  const { policies: personali } = usePoliciesPersonali();
  const { policies: agenzia } = usePoliciesAgenzia();
  const { settings } = useSettings();

  const policies = [
    ...personali.map(p => ({ ...p, scope: 'personali' as const })),
    ...agenzia.map(p => ({ ...p, scope: 'agenzia' as const }))
  ];

  const now = startOfDay(new Date());
  const threshold = settings.expiryThresholdDays;

  const activeTasks = tasks.filter(t => !t.completedAt);
  const tasksDueToday = activeTasks.filter(t => t.dueDate && isToday(parseLocalDate(t.dueDate)));
  const overdueTasks = activeTasks.filter(t => t.dueDate && isBefore(parseLocalDate(t.dueDate), now));

  const inScadenzaPolicies = policies.filter(p => p.status === 'emessa' && p.expiryDate);
  const daEmetterePolicies = policies.filter(p => p.status === 'da_emettere');

  const policiesExpiringSoon = inScadenzaPolicies.filter(p => {
    if (!p.expiryDate) return false;
    const days = differenceInCalendarDays(parseLocalDate(p.expiryDate), now);
    return days >= 0 && days <= threshold;
  });

  const topUrgentTasks = [...activeTasks]
    .filter(t => t.dueDate)
    .sort((a, b) => parseLocalDate(a.dueDate!).getTime() - parseLocalDate(b.dueDate!).getTime())
    .slice(0, 5);

  const topUpcomingPolicies = [...inScadenzaPolicies]
    .sort((a, b) => parseLocalDate(a.expiryDate!).getTime() - parseLocalDate(b.expiryDate!).getTime())
    .slice(0, 5);

  const statCards: {
    title: string;
    value: number;
    icon: React.ComponentType<{ className?: string }>;
    href: string;
    testId: string;
    tone: Tone;
    hint?: string;
  }[] = [
    {
      title: "Da Fare",
      value: tasksDueToday.length,
      icon: CheckSquare,
      href: "/attivita",
      testId: "card-tasks-today",
      tone: "neutral",
      hint: "in scadenza oggi",
    },
    {
      title: "In Sospeso",
      value: overdueTasks.length,
      icon: AlertCircle,
      href: "/attivita",
      testId: "card-tasks-overdue",
      tone: overdueTasks.length > 0 ? "danger" : "muted",
      hint: "da gestire subito",
    },
    {
      title: "Scadenze senza nessun timeframe",
      value: policiesExpiringSoon.length,
      icon: CalendarClock,
      href: "/polizze-personali",
      testId: "card-policies-expiring",
      tone: "gold",
      hint: "polizze in scadenza",
    },
    {
      title: "Sinistri",
      value: daEmetterePolicies.length,
      icon: FileText,
      href: "/polizze-personali",
      testId: "card-policies-to-issue",
      tone: "neutral",
      hint: "sinistri in attesa",
    },
  ];

  const todayFormatted = format(new Date(), "EEEE d MMMM yyyy", { locale: it });
  const todayCapitalized = todayFormatted.charAt(0).toUpperCase() + todayFormatted.slice(1);

  return (
    <div className="space-y-10">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="min-w-0">
          <div className="text-xs uppercase tracking-[0.18em] text-gold/90 font-semibold mb-2">
            Dashboard
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-semibold text-primary mb-2 tracking-tight">
            Buongiorno
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            {todayCapitalized}.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Link href="/attivita">
            <Button variant="outline" data-testid="button-quick-new-task">
              <Plus className="w-4 h-4 mr-2" />
              Nuova attività
            </Button>
          </Link>
          <Link href="/polizze-personali">
            <Button variant="outline" data-testid="button-quick-new-policy-personali">
              <Plus className="w-4 h-4 mr-2" />
              Nuova p. personale
            </Button>
          </Link>
          <Link href="/polizze-agenzia">
            <Button data-testid="button-quick-new-policy-agenzia">
              <Plus className="w-4 h-4 mr-2" />
              Nuova p. agenzia
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((c) => {
          const t = toneStyles[c.tone];
          const Icon = c.icon;
          return (
            <Link
              key={c.testId}
              href={c.href}
              className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl"
            >
              <Card
                className="relative overflow-hidden p-5 shadow-card cursor-pointer transition-all hover:shadow-elevated hover:-translate-y-0.5 hover:border-primary/30"
                data-testid={c.testId}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="text-sm font-medium text-muted-foreground">{c.title}</div>
                  <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center", t.chip)}>
                    <Icon className="w-[18px] h-[18px]" />
                  </div>
                </div>
                <div className={cn("text-3xl sm:text-4xl font-serif font-semibold tracking-tight", t.value)}>
                  {c.value}
                </div>
                {c.hint && (
                  <div className="text-xs text-muted-foreground mt-1.5">{c.hint}</div>
                )}
              </Card>
            </Link>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
        <SectionList
          title="Prossime scadenze"
          href="/polizze-personali"
          empty="Nessuna polizza in scadenza a breve."
        >
          {topUpcomingPolicies.length > 0 && (
            <div className="divide-y divide-border">
              {topUpcomingPolicies.map(p => {
                const exp = p.expiryDate ? parseLocalDate(p.expiryDate) : null;
                const days = exp ? differenceInCalendarDays(exp, now) : null;
                const tone =
                  days === null ? "muted" :
                  days < 0 ? "danger" :
                  days <= 7 ? "danger" :
                  days <= 30 ? "gold" : "neutral";
                const targetHref = p.scope === 'personali' ? '/polizze-personali' : '/polizze-agenzia';
                return (
                  <Link key={p.id} href={targetHref} className="block">
                    <div
                      className="flex justify-between items-center gap-4 px-5 py-4 transition-colors hover:bg-muted/40"
                      data-testid={`dashboard-policy-${p.id}`}
                    >
                      <div className="min-w-0">
                        <div className="font-medium truncate">{p.clientName}</div>
                        <div className="text-sm text-muted-foreground truncate">
                          {p.policyType} <span className="text-[10px] uppercase font-bold text-gold bg-gold/10 px-1.5 py-0.5 rounded ml-1.5">{p.scope === 'personali' ? 'Pers.' : 'Agenzia'}</span>
                        </div>
                      </div>
                      <DatePill date={exp} tone={tone} />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </SectionList>

        <SectionList
          title="Attività urgenti"
          href="/attivita"
          empty="Nessuna attività urgente. Ottimo lavoro."
        >
          {topUrgentTasks.length > 0 && (
            <div className="divide-y divide-border">
              {topUrgentTasks.map(t => {
                const due = t.dueDate ? parseLocalDate(t.dueDate) : null;
                const tone =
                  due === null ? "muted" :
                  isBefore(due, now) ? "danger" :
                  isToday(due) ? "gold" : "neutral";
                return (
                  <Link key={t.id} href="/attivita" className="block">
                    <div
                      className="flex justify-between items-center gap-4 px-5 py-4 transition-colors hover:bg-muted/40"
                      data-testid={`dashboard-task-${t.id}`}
                    >
                      <div className="min-w-0 pr-2">
                        <div className="font-medium truncate">{t.title}</div>
                        {t.notes && <div className="text-sm text-muted-foreground truncate">{t.notes}</div>}
                      </div>
                      <DatePill date={due} tone={tone} />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </SectionList>
      </div>
    </div>
  );
}

function SectionList({
  title,
  href,
  empty,
  children,
}: {
  title: string;
  href: string;
  empty: string;
  children: React.ReactNode;
}) {
  const hasChildren = !!children && (Array.isArray(children) ? children.length > 0 : true);
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-serif font-semibold text-primary">{title}</h2>
        <Link
          href={href}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          Vedi tutte
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
      {hasChildren ? (
        <Card className="overflow-hidden shadow-soft">
          {children}
        </Card>
      ) : (
        <Link href={href} className="block">
          <div className="p-8 text-center bg-card/50 border border-dashed border-border rounded-xl text-muted-foreground text-sm hover:border-primary/40 hover:text-primary transition-all">
            {empty}
          </div>
        </Link>
      )}
    </div>
  );
}

function DatePill({ date, tone }: { date: Date | null; tone: Tone }) {
  if (!date) return null;
  const cls =
    tone === "danger"
      ? "bg-destructive/10 text-destructive ring-destructive/20"
      : tone === "gold"
      ? "bg-gold/10 text-gold ring-gold/20"
      : tone === "muted"
      ? "bg-muted text-muted-foreground ring-border"
      : "bg-secondary text-secondary-foreground ring-border";
  return (
    <span
      className={cn(
        "shrink-0 inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-md ring-1 whitespace-nowrap",
        cls
      )}
    >
      {format(date, "d MMM yyyy", { locale: it })}
    </span>
  );
}
