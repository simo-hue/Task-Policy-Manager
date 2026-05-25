import React, { useState, useEffect } from "react";
import { usePreventivi, Preventivo } from "@/lib/preventivi-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus, Trash2, Pencil, Check, MessageSquare, ClipboardList, Briefcase, CheckCircle2, CalendarIcon } from "lucide-react";
import { cn, parseLocalDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

const preventivoSchema = z.object({
  clientName: z.string().min(1, "Il nome cliente è obbligatorio"),
  policyType: z.string().min(1, "Il tipo di polizza è obbligatorio"),
  premio: z.coerce.number().optional(),
  notes: z.string().optional(),
  status: z.enum(["da_fare", "accettato", "consegnato"]),
  createdAt: z.date().optional(),
});

type PreventivoFormValues = z.infer<typeof preventivoSchema>;

export function Preventivi() {
  const { preventivi, addPreventivo, updatePreventivo, deletePreventivo } = usePreventivi();
  const [editingPreventivo, setEditingPreventivo] = useState<Preventivo | null>(null);
  const [deletingPreventivo, setDeletingPreventivo] = useState<Preventivo | null>(null);
  const [completingPreventivo, setCompletingPreventivo] = useState<Preventivo | null>(null);
  const [editingNotePreventivo, setEditingNotePreventivo] = useState<Preventivo | null>(null);
  const [quickType, setQuickType] = useState("Auto");
  const [selectedStatus, setSelectedStatus] = useState<"da_fare" | "consegnato">("da_fare");
  const [quickDate, setQuickDate] = useState<Date | undefined>(undefined);
  const [quickDatePopoverOpen, setQuickDatePopoverOpen] = useState(false);
  const [editDatePopoverOpen, setEditDatePopoverOpen] = useState(false);

  const editForm = useForm<PreventivoFormValues>({
    resolver: zodResolver(preventivoSchema),
    defaultValues: { clientName: "", policyType: "", notes: "", status: "da_fare", premio: undefined },
  });

  useEffect(() => {
    if (editingPreventivo) {
      editForm.reset({
        clientName: editingPreventivo.clientName,
        policyType: editingPreventivo.policyType,
        notes: editingPreventivo.notes ?? "",
        status: editingPreventivo.status,
        premio: editingPreventivo.premio,
        createdAt: editingPreventivo.createdAt ? new Date(editingPreventivo.createdAt) : undefined,
      });
    }
  }, [editingPreventivo, editForm]);

  function onEditSubmit(values: PreventivoFormValues) {
    if (!editingPreventivo) return;
    if (values.status === "accettato") {
      deletePreventivo(editingPreventivo.id);
    } else {
      updatePreventivo(editingPreventivo.id, {
        clientName: values.clientName,
        policyType: values.policyType,
        notes: values.notes ?? "",
        status: values.status,
        premio: values.premio,
        createdAt: values.createdAt ? values.createdAt.toISOString() : undefined,
      });
    }
    setEditingPreventivo(null);
  }

  const renderQuickAdd = (defaultStatus: "da_fare" | "consegnato" | "accettato") => (
    <div className="fixed md:static bottom-[calc(48px+env(safe-area-inset-bottom))] md:bottom-auto left-0 right-0 px-3 md:px-0 z-30 pt-6 pb-0 md:py-0 bg-gradient-to-t from-background via-background/95 to-transparent md:bg-none pointer-events-none md:pointer-events-auto">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const target = e.target as HTMLFormElement;
          const nameInput = target.elements.namedItem("quickName") as HTMLInputElement;
          const clientName = nameInput.value.trim();
          const notesInput = target.elements.namedItem("quickNotes") as HTMLInputElement;
          const notes = notesInput.value.trim();
          const premioInput = target.elements.namedItem("quickPremio") as HTMLInputElement;
          const premioVal = premioInput?.value.trim();
          const premio = premioVal ? Number(premioVal) : undefined;

          if (clientName) {
            addPreventivo({
              clientName,
              policyType: quickType,
              status: defaultStatus,
              notes: notes || "",
              premio,
              createdAt: quickDate ? quickDate.toISOString() : new Date().toISOString()
            });
            nameInput.value = "";
            notesInput.value = "";
            if (premioInput) premioInput.value = "";
            setQuickDate(undefined);
          }
        }}
        className="pointer-events-auto flex flex-col md:flex-row gap-2 bg-card/95 md:bg-card backdrop-blur-md md:backdrop-blur-none p-2 rounded-2xl border border-border/60 shadow-elevated md:shadow-sm transition-all max-w-7xl mx-auto"
      >
        <div className="flex gap-1.5 w-full md:w-auto md:flex-1">
          <div className="flex-1 relative">
            <Plus className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              name="quickName"
              placeholder="Nuovo preventivo..."
              className="pl-8 h-10 border-0 bg-secondary/50 focus-visible:ring-1 focus-visible:ring-primary/30 rounded-xl w-full"
              autoComplete="off"
              required
            />
          </div>
          <Button
            type="submit"
            size="sm"
            className="md:hidden font-medium shrink-0 h-10 px-4 rounded-xl"
          >
            Salva
          </Button>
        </div>

        <div className="grid grid-cols-2 md:flex gap-1.5 w-full md:w-auto">
          <Select value={quickType} onValueChange={setQuickType}>
            <SelectTrigger className="h-10 md:w-[130px] border-0 bg-secondary/50 focus:ring-1 focus:ring-primary/30 rounded-xl text-xs sm:text-sm font-medium">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Auto">Auto</SelectItem>
              <SelectItem value="Moto">Moto</SelectItem>
              <SelectItem value="Furgone">Furgone</SelectItem>
              <SelectItem value="Abitazione">Abitazione</SelectItem>
              <SelectItem value="Infortuni">Infortuni</SelectItem>
              <SelectItem value="Malattia">Malattia</SelectItem>
              <SelectItem value="Vita">Vita</SelectItem>
              <SelectItem value="TCM">TCM</SelectItem>
              <SelectItem value="Commercio">Commercio</SelectItem>
              <SelectItem value="RC Professionale">RC Professionale</SelectItem>
              <SelectItem value="RC Terzi">RC Terzi</SelectItem>
              <SelectItem value="RC Capofamiglia">RC Capofamiglia</SelectItem>
              <SelectItem value="Animali">Animali</SelectItem>
              <SelectItem value="Non specificata">Altro...</SelectItem>
            </SelectContent>
          </Select>

          <Popover open={quickDatePopoverOpen} onOpenChange={setQuickDatePopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                variant={"secondary"}
                className={cn(
                  "h-10 md:w-[120px] px-3 bg-secondary/50 font-normal border-0 text-xs sm:text-sm rounded-xl justify-start",
                  !quickDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-3.5 w-3.5 opacity-50 shrink-0" />
                <span className="truncate">{quickDate ? format(quickDate, "d MMM", { locale: it }) : "Data"}</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 border-none bg-transparent shadow-none" align="start">
              <Calendar
                mode="single"
                disabled={false}
                selected={quickDate}
                onSelect={(date) => {
                  setQuickDate(date);
                  setQuickDatePopoverOpen(false);
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="grid grid-cols-3 md:flex gap-1.5 w-full md:w-auto md:flex-1">
          <div className="col-span-1 relative md:w-[100px]">
            <Input
              name="quickPremio"
              type="number"
              inputMode="decimal"
              step="0.01"
              placeholder="Premio €"
              className="h-10 border-0 bg-secondary/50 focus-visible:ring-1 focus-visible:ring-primary/30 rounded-xl text-xs sm:text-sm w-full"
              autoComplete="off"
            />
          </div>

          <div className="col-span-2 relative md:flex-1">
            <Input
              name="quickNotes"
              placeholder="Note..."
              className="h-10 border-0 bg-secondary/50 focus-visible:ring-1 focus-visible:ring-primary/30 rounded-xl text-xs sm:text-sm w-full"
              autoComplete="off"
            />
          </div>
        </div>

        <Button
          type="submit"
          size="sm"
          className="hidden md:flex font-medium shrink-0 h-10 px-5 rounded-xl"
        >
          Aggiungi
        </Button>
      </form>
    </div>
  );

  const renderPreventivoList = (list: Preventivo[], emptyMessage: string) => (
    list.length > 0 ? (
      <div className="grid gap-3">
        {list.map((preventivo, index) => {
          const currentDateKey = preventivo.createdAt ? format(new Date(preventivo.createdAt), "d MMMM yyyy", { locale: it }).toUpperCase() : "DATA SCONOSCIUTA";
          const groupKey = currentDateKey;

          let showSeparator = false;
          if (index === 0) {
            showSeparator = true;
          } else {
            const prevPreventivo = list[index - 1];
            const prevDateKey = prevPreventivo.createdAt ? format(new Date(prevPreventivo.createdAt), "d MMMM yyyy", { locale: it }).toUpperCase() : "DATA SCONOSCIUTA";
            showSeparator = groupKey !== prevDateKey;
          }

          return (
            <React.Fragment key={preventivo.id}>
              {showSeparator && (
                <div className={cn("relative flex items-center pb-2", index !== 0 && "pt-6")}>
                  <div className="flex-grow border-t border-border/60"></div>
                  <span className="mx-4 text-xs font-semibold tracking-[0.18em] text-primary/80 uppercase text-center">
                    {groupKey}
                  </span>
                  <div className="flex-grow border-t border-border/60"></div>
                </div>
              )}
              <Card className="overflow-hidden group shadow-soft hover:shadow-card hover:border-primary/30 transition-all border-dashed">
                <CardContent className="p-0 flex flex-col sm:flex-row sm:items-center">
                  <div className="p-3 sm:p-5 flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-3 mb-2 flex-wrap">
                      <h3 className="font-semibold text-base sm:text-lg flex items-center gap-2 min-w-0 flex-wrap">
                        <span className="truncate max-w-[180px] sm:max-w-xs">{preventivo.clientName}</span>
                        <span className="bg-secondary px-2 py-0.5 rounded-md text-secondary-foreground font-medium text-xs">{preventivo.policyType}</span>
                        {preventivo.premio !== undefined && (
                          <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-md font-medium text-xs whitespace-nowrap">
                            € {preventivo.premio.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        )}
                      </h3>
                    </div>
                    {preventivo.notes && (
                      <div className="flex items-center gap-3 text-muted-foreground text-sm flex-wrap">
                        <span className="truncate max-w-xs">{preventivo.notes}</span>
                      </div>
                    )}
                  </div>
                  <div className="px-3 sm:px-5 pb-3 sm:py-5 flex items-center justify-end sm:border-l sm:h-full gap-1.5 sm:gap-2 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-within:opacity-100 transition-opacity flex-wrap">
                    {selectedStatus === "da_fare" ? (
                      <Button
                        variant="secondary"
                        size="sm"
                        className="font-medium text-xs gap-1.5 h-8 hover:bg-amber-500/10 hover:text-amber-600 hover:border-amber-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                        onClick={() => updatePreventivo(preventivo.id, { status: "consegnato" })}
                      >
                        <Check className="w-3.5 h-3.5 text-amber-500" />
                        Consegnato
                      </Button>
                    ) : (
                      <Button
                        variant="secondary"
                        size="sm"
                        className="font-medium text-xs gap-1.5 h-8 hover:bg-emerald-500/10 hover:text-emerald-600 hover:border-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                        onClick={() => setCompletingPreventivo(preventivo)}
                      >
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        Accettato
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn("hover:text-primary", preventivo.notes ? "text-primary" : "text-muted-foreground")}
                      onClick={() => setEditingNotePreventivo(preventivo)}
                      title="Aggiungi o modifica nota"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setEditingPreventivo(preventivo)} className="text-muted-foreground hover:text-primary">
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setDeletingPreventivo(preventivo)} className="text-muted-foreground hover:text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </React.Fragment>
          );
        })}
      </div>
    ) : (
      <div className="p-10 text-center bg-card/50 border border-dashed rounded-xl text-muted-foreground text-sm">
        {emptyMessage}
      </div>
    )
  );

  const filteredPreventivi = preventivi.filter(p => p.status === selectedStatus);

  const sortedPreventivi = [...filteredPreventivi].sort((a, b) => {
    const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return dateA - dateB;
  });

  const filterOptions = [
    { value: "da_fare" as const, label: `Da Fare (${preventivi.filter(p => p.status === "da_fare").length})` },
    { value: "consegnato" as const, label: `Consegnati (${preventivi.filter(p => p.status === "consegnato").length})` }
  ];

  return (
    <div className="space-y-6 sm:space-y-12 flex flex-col h-full min-h-[calc(100vh-120px)] relative">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="min-w-0">
          <div className="text-xs uppercase tracking-[0.18em] text-gold/90 font-semibold mb-2">Vendite</div>
          <h1 className="text-2xl sm:text-4xl font-serif font-semibold text-primary mb-1 sm:mb-2 tracking-tight">Preventivi</h1>
          <p className="text-muted-foreground text-sm sm:text-base">Gestisci le richieste di preventivo e le trattative in corso.</p>
        </div>
      </div>

      {renderQuickAdd("da_fare")}

      <Dialog open={!!editingPreventivo} onOpenChange={(open) => { if (!open) setEditingPreventivo(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Modifica preventivo</DialogTitle>
            <DialogDescription>Aggiorna i dati del preventivo selezionato.</DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="clientName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome Cliente</FormLabel>
                    <FormControl>
                      <Input placeholder="Es. Mario Rossi" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="policyType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo di Polizza</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input placeholder="Es. RC Auto, Vita, Infortuni..." list="preventivi-policy-types" {...field} />
                        <datalist id="preventivi-policy-types">
                          <option value="RC Auto Personale" />
                          <option value="Infortuni Personale" />
                          <option value="Casa e Fabbricato" />
                          <option value="Vita" />
                          <option value="Salute e Sanitaria" />
                          <option value="Tutela Legale" />
                          <option value="Viaggio" />
                          <option value="Fideiussione" />
                        </datalist>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="premio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Premio</FormLabel>
                    <FormControl>
                      <Input type="number" inputMode="decimal" step="0.01" placeholder="Es. 250.50" {...field} value={field.value ?? ""} onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stato</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleziona stato" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="da_fare">Da Fare</SelectItem>
                        <SelectItem value="consegnato">Consegnato</SelectItem>
                        <SelectItem value="accettato">Accettato (Elimina)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="createdAt"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Data (opzionale)</FormLabel>
                    <Popover open={editDatePopoverOpen} onOpenChange={setEditDatePopoverOpen}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? format(field.value, "PPP", { locale: it }) : <span>Seleziona data</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 border-none bg-transparent shadow-none" align="start">
                        <Calendar
                          mode="single"
                          disabled={false}
                          selected={field.value}
                          onSelect={(date) => {
                            field.onChange(date);
                            setEditDatePopoverOpen(false);
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Note</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Dettagli..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end pt-4">
                <Button type="submit">Salva modifiche</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deletingPreventivo} onOpenChange={(open) => { if (!open) setDeletingPreventivo(null); }}>
        <DialogContent className="max-w-md border-border/80 shadow-elevated">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl font-semibold text-destructive mb-1 flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-destructive" />
              Conferma Eliminazione
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-sm leading-relaxed">
              Sei sicuro di voler eliminare il preventivo di <strong className="text-foreground">{deletingPreventivo?.clientName}</strong>? Questa azione è irreversibile.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 pt-5">
            <Button variant="outline" onClick={() => setDeletingPreventivo(null)}>
              Annulla
            </Button>
            <Button
              variant="destructive"
              className="shadow-soft border-0 transition-colors"
              onClick={() => {
                if (deletingPreventivo) {
                  deletePreventivo(deletingPreventivo.id);
                  setDeletingPreventivo(null);
                }
              }}
            >
              Elimina
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!completingPreventivo} onOpenChange={(open) => { if (!open) setCompletingPreventivo(null); }}>
        <DialogContent className="max-w-md border-border/80 shadow-elevated">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl font-semibold text-emerald-600 mb-1 flex items-center gap-2">
              <Check className="w-5 h-5 text-emerald-500" />
              Preventivo Accettato
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-sm leading-relaxed">
              Sei sicuro di voler contrassegnare il preventivo di <strong className="text-foreground">{completingPreventivo?.clientName}</strong> come accettato? <strong>Verrà eliminato definitivamente dal database</strong> e non sarà più recuperabile.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 pt-5">
            <Button variant="outline" onClick={() => setCompletingPreventivo(null)}>
              Annulla
            </Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-soft border-0 transition-colors"
              onClick={() => {
                if (completingPreventivo) {
                  deletePreventivo(completingPreventivo.id);
                  setCompletingPreventivo(null);
                }
              }}
            >
              Conferma
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingNotePreventivo} onOpenChange={(open) => { if (!open) setEditingNotePreventivo(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" />
              Note Preventivo
            </DialogTitle>
            <DialogDescription>
              Aggiungi o modifica le note per <strong className="text-foreground">{editingNotePreventivo?.clientName}</strong>.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!editingNotePreventivo) return;
              const target = e.target as HTMLFormElement;
              const notesInput = target.elements.namedItem("notes") as HTMLTextAreaElement;
              updatePreventivo(editingNotePreventivo.id, { notes: notesInput.value.trim() || "" });
              setEditingNotePreventivo(null);
            }}
            className="space-y-4"
          >
            <Textarea
              name="notes"
              placeholder="Inserisci i dettagli qui..."
              defaultValue={editingNotePreventivo?.notes || ""}
              className="min-h-[120px] resize-none"
              autoFocus
            />
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setEditingNotePreventivo(null)}>Annulla</Button>
              <Button type="submit">Salva note</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <div className="space-y-4 pb-32 md:pb-4 flex flex-col flex-1 h-full">
        <div className="flex justify-center w-full mb-6">
          <div className="relative p-1.5 inline-flex flex-wrap justify-center gap-1.5 items-center bg-muted/30 backdrop-blur-lg border border-border/50 rounded-2xl shadow-inner">
            {filterOptions.map((opt) => {
              const isSelected = selectedStatus === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => setSelectedStatus(opt.value)}
                  className={cn(
                    "relative px-4 py-2 text-sm font-semibold rounded-xl transition-all duration-300 ease-out outline-none select-none",
                    isSelected
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-background/40"
                  )}
                >
                  {isSelected && (
                    <span className="absolute inset-0 bg-background border border-border/80 rounded-xl shadow-soft -z-10" />
                  )}
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
        {renderPreventivoList(sortedPreventivi, "Nessun preventivo in questo stato.")}
      </div>
    </div>
  );
}
