import { useState } from "react";
import { useTasks } from "@/lib/tasks-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { CalendarIcon, Plus, CheckCircle2, Circle, Trash2, Clock, CheckSquare } from "lucide-react";
import { cn } from "@/lib/utils";

const taskSchema = z.object({
  title: z.string().min(1, "Il titolo è obbligatorio"),
  notes: z.string().optional(),
  dueDate: z.date().optional(),
});

export function Attivita() {
  const { tasks, addTask, completeTask, reopenTask, deleteTask } = useTasks();
  const [isAddOpen, setIsAddOpen] = useState(false);

  const form = useForm<z.infer<typeof taskSchema>>({
    resolver: zodResolver(taskSchema),
    defaultValues: { title: "", notes: "" },
  });

  function onSubmit(values: z.infer<typeof taskSchema>) {
    addTask({
      title: values.title,
      notes: values.notes || undefined,
      dueDate: values.dueDate ? format(values.dueDate, 'yyyy-MM-dd') : undefined,
    });
    setIsAddOpen(false);
    form.reset();
  }

  const activeTasks = tasks.filter(t => !t.completedAt).sort((a, b) => {
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });

  const completedTasks = tasks.filter(t => t.completedAt).sort((a, b) => {
    return new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime();
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif text-primary mb-2">Attività</h1>
          <p className="text-muted-foreground">Gestisci le cose da fare e tieni traccia di quanto completato.</p>
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

      <Tabs defaultValue="da-fare" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="da-fare">Da fare ({activeTasks.length})</TabsTrigger>
          <TabsTrigger value="completate">Completate</TabsTrigger>
        </TabsList>
        
        <TabsContent value="da-fare" className="space-y-4">
          {activeTasks.length > 0 ? (
            activeTasks.map(task => (
              <Card key={task.id} className="overflow-hidden hover:shadow-md transition-shadow group">
                <CardContent className="p-4 flex items-start gap-4">
                  <button 
                    onClick={() => completeTask(task.id)}
                    className="mt-1 text-muted-foreground hover:text-primary transition-colors"
                    data-testid={`button-complete-task-${task.id}`}
                  >
                    <Circle className="w-6 h-6" />
                  </button>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-lg">{task.title}</h3>
                    {task.notes && <p className="text-muted-foreground text-sm mt-1">{task.notes}</p>}
                    {task.dueDate && (
                      <div className="flex items-center text-xs font-medium mt-3 text-amber-600 bg-amber-50 w-max px-2 py-1 rounded-md">
                        <Clock className="w-3 h-3 mr-1" />
                        {format(new Date(task.dueDate), "d MMM yyyy", { locale: it })}
                      </div>
                    )}
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity"
                    onClick={() => deleteTask(task.id)}
                    data-testid={`button-delete-task-${task.id}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="py-12 text-center bg-card border rounded-lg text-muted-foreground shadow-sm">
              <CheckSquare className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p className="text-lg font-medium">Nessuna attività da fare.</p>
              <p className="text-sm mt-1">Goditi il meritato riposo.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="completate" className="space-y-4">
          {completedTasks.length > 0 ? (
            completedTasks.map(task => (
              <Card key={task.id} className="overflow-hidden opacity-75">
                <CardContent className="p-4 flex items-start gap-4">
                  <button 
                    onClick={() => reopenTask(task.id)}
                    className="mt-1 text-primary hover:text-primary/80 transition-colors"
                    data-testid={`button-reopen-task-${task.id}`}
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
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => deleteTask(task.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
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