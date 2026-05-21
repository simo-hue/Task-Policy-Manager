import { useEffect, useState } from "react";
import { useTasks, type Task } from "@/lib/tasks-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format, isToday, isYesterday, isThisWeek, isThisMonth, differenceInCalendarDays, differenceInCalendarMonths, startOfDay, endOfWeek, isBefore, isWithinInterval } from "date-fns";
import { it } from "date-fns/locale";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { CalendarIcon, Plus, CheckCircle2, Circle, Trash2, Clock, CheckSquare, Pencil, Search, X } from "lucide-react";
import { cn, parseLocalDate } from "@/lib/utils";

const taskSchema = z.object({
  title: z.string().min(1, "Il titolo è obbligatorio"),
  notes: z.string().optional(),
  dueDate: z.date().optional(),
});

type TaskFormValues = z.infer<typeof taskSchema>;

export function Attivita() {
  const { tasks, addTask, completeTask, reopenTask, deleteTask, updateTask } = useTasks();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [search, setSearch] = useState("");
  type QuickFilter = "all" | "overdue" | "thisWeek" | "noDate";
  const [quickFilter, setQuickFilter] = useState<QuickFilter>("all");

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: { title: "", notes: "" },
  });

  const editForm = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: { title: "", notes: "" },
  });

  useEffect(() => {
    if (editingTask) {
      editForm.reset({
        title: editingTask.title,
        notes: editingTask.notes ?? "",
        dueDate: editingTask.dueDate ? parseLocalDate(editingTask.dueDate) : undefined,
      });
    }
  }, [editingTask, editForm]);

  function onSubmit(values: TaskFormValues) {
    addTask({
      title: values.title,
      notes: values.notes || undefined,
      dueDate: values.dueDate ? format(values.dueDate, 'yyyy-MM-dd') : undefined,
    });
    setIsAddOpen(false);
    form.reset();
  }

  function onEditSubmit(values: TaskFormValues) {
    if (!editingTask) return;
    updateTask(editingTask.id, {
      title: values.title,
      notes: values.notes || undefined,
      dueDate: values.dueDate ? format(values.dueDate, 'yyyy-MM-dd') : undefined,
    });
    setEditingTask(null);
    editForm.reset({ title: "", notes: "" });
  }

  const today = startOfDay(new Date());
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 });

  function matchesFilters(t: Task): boolean {
    const q = search.trim().toLowerCase();
    if (q) {
      const inTitle = t.title.toLowerCase().includes(q);
      const inNotes = (t.notes ?? "").toLowerCase().includes(q);
      if (!inTitle && !inNotes) return false;
    }
    if (quickFilter === "overdue") {
      if (!t.dueDate) return false;
      const d = startOfDay(parseLocalDate(t.dueDate));
      if (!isBefore(d, today)) return false;
    } else if (quickFilter === "thisWeek") {
      if (!t.dueDate) return false;
      const d = startOfDay(parseLocalDate(t.dueDate));
      if (!isWithinInterval(d, { start: today, end: weekEnd })) return false;
    } else if (quickFilter === "noDate") {
      if (t.dueDate) return false;
    }
    return true;
  }

  const activeTasks = tasks.filter(t => !t.completedAt && matchesFilters(t)).sort((a, b) => {
    if (!a.dueDate && !b.dueDate) return 0;
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    return parseLocalDate(a.dueDate).getTime() - parseLocalDate(b.dueDate).getTime();
  });

  const completedTasks = tasks.filter(t => t.completedAt && matchesFilters(t)).sort((a, b) => {
    return new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime();
  });

  const hasActiveFilters = search.trim() !== "" || quickFilter !== "all";

  const filterButtons: { value: QuickFilter; label: string }[] = [
    { value: "all", label: "Tutte" },
    { value: "overdue", label: "Scadute" },
    { value: "thisWeek", label: "Questa settimana" },
    { value: "noDate", label: "Senza data" },
  ];

  function groupLabel(date: Date): string {
    if (isToday(date)) return "Oggi";
    if (isYesterday(date)) return "Ieri";
    const daysAgo = differenceInCalendarDays(new Date(), date);
    if (daysAgo < 7 && isThisWeek(date, { weekStartsOn: 1 })) return "Questa settimana";
    if (daysAgo < 14) return "Settimana scorsa";
    if (isThisMonth(date)) return "Questo mese";
    const monthsAgo = differenceInCalendarMonths(new Date(), date);
    if (monthsAgo === 1) return "Mese scorso";
    return format(date, "MMMM yyyy", { locale: it }).replace(/^\w/, c => c.toUpperCase());
  }

  const groupedCompleted: { label: string; tasks: typeof completedTasks }[] = [];
  const groupIndex = new Map<string, number>();
  for (const t of completedTasks) {
    const d = startOfDay(new Date(t.completedAt!));
    const label = groupLabel(d);
    const idx = groupIndex.get(label);
    if (idx !== undefined) {
      groupedCompleted[idx].tasks.push(t);
    } else {
      groupIndex.set(label, groupedCompleted.length);
      groupedCompleted.push({ label, tasks: [t] });
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="min-w-0">
          <div className="text-xs uppercase tracking-[0.18em] text-gold/90 font-semibold mb-2">Da fare</div>
          <h1 className="text-3xl sm:text-4xl font-serif font-semibold text-primary mb-2 tracking-tight">Da Fare</h1>
          <p className="text-muted-foreground text-sm sm:text-base">Gestisci le cose da fare e tieni traccia di quanto completato.</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-task">
              <Plus className="w-4 h-4 mr-2" />
              Nuova attività
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Aggiungi attività</DialogTitle>
              <DialogDescription>Crea una nuova attività da gestire.</DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Titolo</FormLabel>
                      <FormControl>
                        <Input placeholder="Es. Chiamare il cliente..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Note (opzionale)</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Dettagli aggiuntivi..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Data di scadenza (opzionale)</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP", { locale: it })
                              ) : (
                                <span>Seleziona una data</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end pt-4">
                  <Button type="submit" data-testid="button-save-task">Salva attività</Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Dialog open={!!editingTask} onOpenChange={(open) => { if (!open) setEditingTask(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifica attività</DialogTitle>
            <DialogDescription>Aggiorna i dettagli dell'attività selezionata.</DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Titolo</FormLabel>
                    <FormControl>
                      <Input placeholder="Es. Chiamare il cliente..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Note (opzionale)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Dettagli aggiuntivi..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Data di scadenza (opzionale)</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP", { locale: it })
                            ) : (
                              <span>Seleziona una data</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setEditingTask(null)}>Annulla</Button>
                <Button type="submit" data-testid="button-update-task">Salva modifiche</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cerca per titolo o note..."
            className="pl-9 pr-9"
            data-testid="input-search-tasks"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              data-testid="button-clear-search"
              aria-label="Cancella ricerca"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {filterButtons.map(f => (
            <Button
              key={f.value}
              type="button"
              size="sm"
              variant={quickFilter === f.value ? "default" : "outline"}
              onClick={() => setQuickFilter(f.value)}
              data-testid={`button-filter-${f.value}`}
            >
              {f.label}
            </Button>
          ))}
          {hasActiveFilters && (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => { setSearch(""); setQuickFilter("all"); }}
              data-testid="button-reset-filters"
            >
              <X className="w-4 h-4 mr-1" />
              Azzera filtri
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="da-fare" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="da-fare">Da fare ({activeTasks.length})</TabsTrigger>
          <TabsTrigger value="completate">Completate</TabsTrigger>
        </TabsList>
        
        <TabsContent value="da-fare" className="space-y-4">
          {activeTasks.length > 0 ? (
            activeTasks.map(task => (
              <Card key={task.id} className="overflow-hidden shadow-soft hover:shadow-card hover:border-primary/30 transition-all group">
                <CardContent className="p-4 flex items-start gap-4">
                  <button 
                    onClick={() => completeTask(task.id)}
                    className="mt-1 text-muted-foreground hover:text-primary transition-colors"
                    data-testid={`button-complete-task-${task.id}`}
                    aria-label={`Segna come completata: ${task.title}`}
                  >
                    <Circle className="w-6 h-6" />
                  </button>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-lg">{task.title}</h3>
                    {task.notes && <p className="text-muted-foreground text-sm mt-1">{task.notes}</p>}
                    {task.dueDate && (() => {
                      const d = startOfDay(parseLocalDate(task.dueDate));
                      const overdue = isBefore(d, today);
                      const soon = isWithinInterval(d, { start: today, end: weekEnd });
                      const cls = overdue
                        ? "bg-destructive/10 text-destructive ring-destructive/20"
                        : soon
                        ? "bg-gold/10 text-gold ring-gold/20"
                        : "bg-secondary text-secondary-foreground ring-border";
                      return (
                        <span className={cn("inline-flex items-center text-xs font-medium mt-3 px-2.5 py-1 rounded-md ring-1", cls)}>
                          <Clock className="w-3 h-3 mr-1" />
                          {format(parseLocalDate(task.dueDate), "d MMM yyyy", { locale: it })}
                        </span>
                      );
                    })()}
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-primary"
                      onClick={() => setEditingTask(task)}
                      data-testid={`button-edit-task-${task.id}`}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => deleteTask(task.id)}
                      data-testid={`button-delete-task-${task.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="py-12 text-center bg-card border rounded-lg text-muted-foreground shadow-sm">
              <CheckSquare className="w-12 h-12 mx-auto mb-4 opacity-20" />
              {hasActiveFilters ? (
                <>
                  <p className="text-lg font-medium">Nessun risultato.</p>
                  <p className="text-sm mt-1">Prova a modificare la ricerca o i filtri.</p>
                </>
              ) : (
                <>
                  <p className="text-lg font-medium">Nessuna attività da fare.</p>
                  <p className="text-sm mt-1">Goditi il meritato riposo.</p>
                </>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completate" className="space-y-6">
          {groupedCompleted.length > 0 ? (
            groupedCompleted.map(group => (
              <div key={group.label} className="space-y-3">
                <div className="flex items-center gap-3" data-testid={`divider-${group.label}`}>
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">
                    {group.label}
                  </span>
                  <div className="flex-1 h-px bg-border" />
                </div>
                {group.tasks.map(task => (
                  <Card key={task.id} className="overflow-hidden shadow-soft opacity-80 hover:opacity-100 transition-opacity">
                    <CardContent className="p-4 flex items-start gap-4">
                      <button
                        onClick={() => reopenTask(task.id)}
                        className="mt-1 text-primary hover:text-primary/80 transition-colors"
                        data-testid={`button-reopen-task-${task.id}`}
                        aria-label={`Riapri attività: ${task.title}`}
                      >
                        <CheckCircle2 className="w-6 h-6" />
                      </button>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-lg line-through text-muted-foreground">{task.title}</h3>
                        {task.completedAt && (
                          <div className="text-xs text-muted-foreground mt-2">
                            Completata il {format(new Date(task.completedAt), "d MMM yyyy", { locale: it })}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground hover:text-primary"
                          onClick={() => setEditingTask(task)}
                          data-testid={`button-edit-task-${task.id}`}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground hover:text-destructive"
                          onClick={() => deleteTask(task.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ))
          ) : (
            <div className="py-12 text-center bg-card border rounded-lg text-muted-foreground shadow-sm">
              <p>Nessuna attività completata finora.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
