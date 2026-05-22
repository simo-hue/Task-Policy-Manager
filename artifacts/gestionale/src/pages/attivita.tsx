import { useEffect, useState } from "react";
import { useTasks, type Task } from "@/lib/tasks-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format, isToday, isYesterday, isThisWeek, isThisMonth, differenceInCalendarDays, differenceInCalendarMonths, startOfDay, endOfWeek, isBefore, isWithinInterval } from "date-fns";
import { it } from "date-fns/locale";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { CalendarIcon, Plus, Circle, Trash2, Clock, CheckSquare, Pencil, Search, X, MessageSquare } from "lucide-react";
import { cn, parseLocalDate } from "@/lib/utils";

const taskSchema = z.object({
  title: z.string().min(1, "Il titolo è obbligatorio"),
  notes: z.string().optional(),
  dueDate: z.date().optional(),
});

type TaskFormValues = z.infer<typeof taskSchema>;

export function Attivita() {
  const { tasks, addTask, completeTask, reopenTask, deleteTask, updateTask } = useTasks();
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);
  const [editingNoteTask, setEditingNoteTask] = useState<Task | null>(null);
  const [search, setSearch] = useState("");
  type QuickFilter = "all" | "overdue" | "thisWeek" | "noDate";
  const [quickFilter, setQuickFilter] = useState<QuickFilter>("all");
  const [quickDate, setQuickDate] = useState<Date | undefined>(undefined);

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

  const hasActiveFilters = search.trim() !== "" || quickFilter !== "all";

  const filterButtons: { value: QuickFilter; label: string }[] = [
    { value: "all", label: "Tutte" },
    { value: "overdue", label: "Scadute" },
    { value: "thisWeek", label: "Questa settimana" },
    { value: "noDate", label: "Senza data" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="min-w-0">
          <div className="text-xs uppercase tracking-[0.18em] text-gold/90 font-semibold mb-2">Da fare</div>
          <h1 className="text-3xl sm:text-4xl font-serif font-semibold text-primary mb-2 tracking-tight">Da Fare</h1>
          <p className="text-muted-foreground text-sm sm:text-base">Gestisci le cose da fare e tieni traccia di quanto completato.</p>
        </div>
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

      <form 
        onSubmit={(e) => {
          e.preventDefault();
          const target = e.target as HTMLFormElement;
          const titleInput = target.elements.namedItem("quickTitle") as HTMLInputElement;
          const title = titleInput.value.trim();
          const notesInput = target.elements.namedItem("quickNotes") as HTMLInputElement;
          const notes = notesInput.value.trim();
          if (title) {
            addTask({ 
              title,
              notes: notes || undefined,
              dueDate: quickDate ? format(quickDate, 'yyyy-MM-dd') : undefined
            });
            titleInput.value = "";
            notesInput.value = "";
            setQuickDate(undefined);
          }
        }}
        className="flex flex-col sm:flex-row sm:items-center gap-2 bg-card p-2 rounded-xl border border-border/60 shadow-sm focus-within:ring-2 focus-within:ring-primary/30 transition-all"
      >
        <div className="flex-1 relative">
          <Plus className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            name="quickTitle"
            placeholder="Scrivi qui una nuova attività veloce..." 
            className="pl-9 h-10 border-0 focus-visible:ring-0 shadow-none bg-transparent placeholder:text-muted-foreground/70"
            autoComplete="off"
            required
          />
        </div>

        <div className="hidden sm:block w-[1px] h-6 bg-border/60 mx-1"></div>

        <div className="flex-1 relative min-w-[150px]">
          <Input 
            name="quickNotes"
            placeholder="Note (opzionali)..." 
            className="h-10 border-0 focus-visible:ring-0 shadow-none bg-transparent placeholder:text-muted-foreground/70"
            autoComplete="off"
          />
        </div>
        
        <div className="hidden sm:block w-[1px] h-6 bg-border/60 mx-1"></div>
        
        <Popover>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant={"outline"}
              className={cn(
                "w-full sm:w-[160px] h-10 justify-start text-left font-normal border-0 shadow-none bg-transparent focus:ring-0",
                !quickDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4 opacity-50 shrink-0" />
              {quickDate ? format(quickDate, "P", { locale: it }) : <span>Data (opzionale)</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={quickDate}
              onSelect={setQuickDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        <Button 
          type="submit" 
          variant="secondary" 
          size="sm" 
          className="h-10 px-6 sm:ml-auto font-semibold hover:scale-105 active:scale-95 transition-transform"
        >
          Aggiungi
        </Button>
      </form>

      <div className="space-y-4">
          {activeTasks.length > 0 ? (
            activeTasks.map(task => (
              <Card key={task.id} className="overflow-hidden shadow-soft hover:shadow-card hover:border-primary/30 transition-all group">
                <CardContent className="p-4 flex items-start gap-4">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <button 
                        className="mt-1 text-muted-foreground hover:text-emerald-500 transition-colors"
                        data-testid={`button-complete-task-${task.id}`}
                        aria-label={`Segna come completata: ${task.title}`}
                      >
                        <Circle className="w-6 h-6" />
                      </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Completare l'attività?</AlertDialogTitle>
                        <AlertDialogDescription>
                          L'attività verrà segnata come completata ed eliminata definitivamente. Vuoi procedere?
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Annulla</AlertDialogCancel>
                        <AlertDialogAction onClick={() => completeTask(task.id)} className="bg-emerald-600 hover:bg-emerald-700 text-white">Completa</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
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
                      className={cn("hover:text-primary", task.notes ? "text-primary" : "text-muted-foreground")}
                      onClick={() => setEditingNoteTask(task)}
                      title="Aggiungi o modifica nota"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </Button>
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
                      onClick={() => setDeletingTask(task)}
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
      </div>

      <Dialog open={!!deletingTask} onOpenChange={(open) => { if (!open) setDeletingTask(null); }}>
        <DialogContent className="max-w-md border-border/80 shadow-elevated">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl font-semibold text-destructive mb-1 flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-destructive" />
              Conferma Eliminazione
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-sm leading-relaxed">
              Sei sicuro di voler eliminare definitivamente l'attività <strong className="text-foreground">{deletingTask?.title}</strong>? Questa azione è irreversibile.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 pt-5">
            <Button variant="outline" onClick={() => setDeletingTask(null)}>
              Annulla
            </Button>
            <Button
              variant="destructive"
              className="font-medium shadow-soft border-0 transition-colors"
              onClick={() => {
                if (deletingTask) {
                  deleteTask(deletingTask.id);
                  setDeletingTask(null);
                }
              }}
            >
              Elimina
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingNoteTask} onOpenChange={(open) => { if (!open) setEditingNoteTask(null); }}>
        <DialogContent className="max-w-md border-border/80 shadow-elevated">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl font-semibold text-primary mb-1 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" />
              Note Attività
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            if (editingNoteTask) {
              const formData = new FormData(e.currentTarget);
              const notes = formData.get("notes") as string;
              updateTask(editingNoteTask.id, { notes: notes || undefined });
              setEditingNoteTask(null);
            }
          }}>
            <div className="pt-4 pb-6">
              <Textarea 
                name="notes"
                defaultValue={editingNoteTask?.notes || ""}
                placeholder="Scrivi qui i tuoi appunti, dettagli o numeri di telefono..."
                className="min-h-[120px] resize-y"
                autoFocus
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setEditingNoteTask(null)}>
                Annulla
              </Button>
              <Button type="submit" className="font-medium shadow-soft">
                Salva Nota
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
