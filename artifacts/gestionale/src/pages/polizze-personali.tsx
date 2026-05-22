import { useState, useEffect } from "react";
import { usePoliciesPersonali, Policy } from "@/lib/policies-store";
import { useSettings } from "@/hooks/use-settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { format, differenceInDays } from "date-fns";
import { it } from "date-fns/locale";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { CalendarIcon, Plus, ShieldAlert, FileSignature, Trash2, ArrowRight, Pencil, Settings2, Check, ChevronDown, MessageSquare } from "lucide-react";
import { cn, parseLocalDate } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

const policySchema = z.object({
  clientName: z.string().min(1, "Il nome cliente è obbligatorio"),
  policyType: z.string().min(1, "Il tipo di polizza è obbligatorio"),
  notes: z.string().optional(),
  status: z.enum(["da_emettere", "emessa"]),
  expiryDate: z.date().optional(),
  targetIssueDate: z.date().optional(),
  daMettereACassa: z.boolean().optional(),
  cassaStato: z.enum(["regolare", "da_mettere", "pagata"]).optional(),
}).superRefine((data, ctx) => {
  if (data.status === "emessa") {
    if (!data.expiryDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "La data di scadenza è obbligatoria per le polizze emesse",
        path: ["expiryDate"],
      });
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (data.expiryDate < today) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "La data di scadenza non può essere nel passato",
          path: ["expiryDate"],
        });
      }
    }
  }
});

type PolicyFormValues = z.infer<typeof policySchema>;

export function PolizzePersonali() {
  const { policies, addPolicy, updatePolicy, deletePolicy } = usePoliciesPersonali();
  const { settings } = useSettings();
  const [editingPolicy, setEditingPolicy] = useState<Policy | null>(null);
  const [issuingPolicy, setIssuingPolicy] = useState<Policy | null>(null);
  const [deletingPolicy, setDeletingPolicy] = useState<Policy | null>(null);
  const [editingNotePolicy, setEditingNotePolicy] = useState<Policy | null>(null);
  const [payingPolicy, setPayingPolicy] = useState<Policy | null>(null);
  const [quickType, setQuickType] = useState("Auto");
  const [quickCassa, setQuickCassa] = useState("regolare");
  const [quickDate, setQuickDate] = useState<Date | undefined>(undefined);

  const editForm = useForm<PolicyFormValues>({
    resolver: zodResolver(policySchema),
    defaultValues: { clientName: "", policyType: "", notes: "", status: "da_emettere", daMettereACassa: false, cassaStato: "regolare" },
  });

  useEffect(() => {
    if (editingPolicy) {
      editForm.reset({
        clientName: editingPolicy.clientName,
        policyType: editingPolicy.policyType,
        notes: editingPolicy.notes ?? "",
        status: editingPolicy.status,
        expiryDate: editingPolicy.expiryDate ? parseLocalDate(editingPolicy.expiryDate) : undefined,
        targetIssueDate: editingPolicy.targetIssueDate ? parseLocalDate(editingPolicy.targetIssueDate) : undefined,
        daMettereACassa: editingPolicy.daMettereACassa ?? false,
        cassaStato: editingPolicy.cassaStato ?? (editingPolicy.daMettereACassa ? "da_mettere" : "regolare"),
      });
    }
  }, [editingPolicy, editForm]);


  function onEditSubmit(values: PolicyFormValues) {
    if (!editingPolicy) return;
    if (values.cassaStato === "pagata") {
      deletePolicy(editingPolicy.id);
    } else {
      updatePolicy(editingPolicy.id, {
        clientName: values.clientName,
        policyType: values.policyType,
        notes: values.notes || undefined,
        status: values.status,
        expiryDate: values.status === "emessa" && values.expiryDate
          ? format(values.expiryDate, 'yyyy-MM-dd')
          : undefined,
        targetIssueDate: values.status === "da_emettere" && values.targetIssueDate
          ? format(values.targetIssueDate, 'yyyy-MM-dd')
          : undefined,
        issuedAt: values.status === "emessa"
          ? (editingPolicy.issuedAt ?? new Date().toISOString())
          : editingPolicy.issuedAt,
        daMettereACassa: values.cassaStato === "da_mettere",
        cassaStato: values.cassaStato || "regolare",
      });
    }
    setEditingPolicy(null);
  }

  const editStatusWatcher = editForm.watch("status");

  const emesse = policies.filter(p => p.status === 'emessa' && p.expiryDate && p.cassaStato !== 'pagata');

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const inScadenza = emesse
    .sort((a, b) => parseLocalDate(a.expiryDate!).getTime() - parseLocalDate(b.expiryDate!).getTime());

  const daEmettere = policies.filter(p => p.status === 'da_emettere' && p.cassaStato !== 'pagata').sort((a, b) => {
    if (!a.targetIssueDate && !b.targetIssueDate) return 0;
    if (!a.targetIssueDate) return 1;
    if (!b.targetIssueDate) return -1;
    return parseLocalDate(a.targetIssueDate).getTime() - parseLocalDate(b.targetIssueDate).getTime();
  });

  const getUrgencyLevel = (dateString?: string) => {
    if (!dateString) return "neutral";
    const d = parseLocalDate(dateString);
    const days = differenceInDays(d, todayStart);
    if (days < 0) return "danger";
    if (days < 7) return "danger";
    if (days <= 30) return "warning";
    return "neutral";
  };

  const UrgencyBadge = ({ date }: { date: string }) => {
    const level = getUrgencyLevel(date);
    const label = format(parseLocalDate(date), "d MMM yyyy", { locale: it });
    
    if (level === "danger") return <span className="inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-md bg-destructive/10 text-destructive ring-1 ring-destructive/20 whitespace-nowrap"><CalendarIcon className="w-3 h-3 mr-1"/>{label}</span>;
    if (level === "warning") return <span className="inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-md bg-gold/10 text-gold ring-1 ring-gold/20 whitespace-nowrap"><CalendarIcon className="w-3 h-3 mr-1"/>{label}</span>;
    return <span className="inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-md bg-secondary text-secondary-foreground ring-1 ring-border whitespace-nowrap"><CalendarIcon className="w-3 h-3 mr-1"/>{label}</span>;
  };

  const renderCassaBadge = (policy: Policy) => {
    const currentCassaStato = policy.cassaStato || (policy.daMettereACassa ? "da_mettere" : "regolare");

    const cassaConfig = {
      regolare: {
        label: "Regolare",
        className: "bg-sky-500/10 text-sky-600 border-sky-500/20 hover:bg-sky-500/20",
        dotColor: "bg-sky-500"
      },
      da_mettere: {
        label: "Da mettere a cassa",
        className: "bg-amber-500/10 text-amber-600 border-amber-500/20 hover:bg-amber-500/20",
        dotColor: "bg-amber-500"
      },
      pagata: {
        label: "Pagata",
        className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/20",
        dotColor: "bg-emerald-500"
      }
    };

    const current = cassaConfig[currentCassaStato] || cassaConfig.regolare;

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Badge
            variant="outline"
            className={cn(
              "cursor-pointer text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition-all duration-200 select-none flex items-center gap-1 hover:scale-105 active:scale-95 py-0.5 px-2 rounded-full border shadow-sm",
              current.className
            )}
          >
            <span>{current.label}</span>
            <ChevronDown className="w-3 h-3 opacity-60" />
          </Badge>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56 p-1.5 rounded-lg border shadow-lg bg-popover text-popover-foreground z-50">
          <DropdownMenuLabel className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground px-2 py-1">
            Cambia Stato Cassa
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="my-1" />
          
          <DropdownMenuItem
            onClick={() => updatePolicy(policy.id, { cassaStato: "regolare", daMettereACassa: false })}
            className="flex items-center justify-between cursor-pointer rounded-md px-2 py-1.5 text-xs hover:bg-accent focus:bg-accent"
          >
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500 shrink-0" />
              <span>Regolare</span>
            </div>
            {currentCassaStato === "regolare" && <Check className="w-3.5 h-3.5 text-primary shrink-0" />}
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => updatePolicy(policy.id, { cassaStato: "da_mettere", daMettereACassa: true })}
            className="flex items-center justify-between cursor-pointer rounded-md px-2 py-1.5 text-xs hover:bg-accent focus:bg-accent"
          >
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
              <span>Da mettere a cassa</span>
            </div>
            {currentCassaStato === "da_mettere" && <Check className="w-3.5 h-3.5 text-primary shrink-0" />}
          </DropdownMenuItem>

          <DropdownMenuSeparator className="my-1" />

          <DropdownMenuItem
            onClick={() => setPayingPolicy(policy)}
            className="flex items-center justify-between cursor-pointer text-emerald-600 dark:text-emerald-400 rounded-md px-2 py-1.5 text-xs hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 focus:bg-emerald-50/50 focus:text-emerald-700"
          >
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
              <span className="font-semibold">Pagata (Elimina)</span>
            </div>
            {currentCassaStato === "pagata" && <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  const renderQuickAdd = (defaultStatus: "emessa" | "da_emettere") => (
    <form 
      onSubmit={(e) => {
        e.preventDefault();
        const target = e.target as HTMLFormElement;
        const nameInput = target.elements.namedItem("quickName") as HTMLInputElement;
        const clientName = nameInput.value.trim();
        const notesInput = target.elements.namedItem("quickNotes") as HTMLInputElement;
        const notes = notesInput.value.trim();
        if (clientName) {
          addPolicy({ 
            clientName, 
            policyType: quickType, 
            status: defaultStatus, 
            expiryDate: defaultStatus === "emessa" && quickDate ? format(quickDate, 'yyyy-MM-dd') : undefined,
            daMettereACassa: quickCassa === "da_mettere", 
            cassaStato: quickCassa as any,
            notes: notes || undefined
          });
          nameInput.value = "";
          notesInput.value = "";
          setQuickDate(undefined);
        }
      }}
      className="flex flex-col sm:flex-row sm:items-center gap-2 mb-6 bg-card p-2 rounded-xl border border-border/60 shadow-sm focus-within:ring-2 focus-within:ring-primary/30 transition-all"
    >
      <div className="flex-1 relative">
        <Plus className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input 
          name="quickName"
          placeholder="Nome cliente..." 
          className="pl-9 h-10 border-0 focus-visible:ring-0 shadow-none bg-transparent"
          autoComplete="off"
          required
        />
      </div>
      
      {defaultStatus === "emessa" && (
        <>
          <div className="hidden sm:block w-[1px] h-6 bg-border/60 mx-1"></div>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full sm:w-[140px] h-10 justify-start text-left font-normal border-0 shadow-none bg-transparent focus:ring-0",
                  !quickDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4 opacity-50 shrink-0" />
                {quickDate ? format(quickDate, "P", { locale: it }) : <span>Scadenza...</span>}
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
        </>
      )}

      <div className="hidden sm:block w-[1px] h-6 bg-border/60 mx-1"></div>
      <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
        <Select value={quickType} onValueChange={setQuickType}>
          <SelectTrigger className="h-10 border-0 bg-transparent shadow-none w-full sm:w-[140px] focus:ring-0 font-medium">
            <SelectValue placeholder="Tipo polizza" />
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
        {defaultStatus === "emessa" && (
          <>
            <div className="hidden sm:block w-[1px] h-6 bg-border/60 mx-1"></div>
            <Select value={quickCassa} onValueChange={setQuickCassa}>
              <SelectTrigger className="h-10 border-0 bg-transparent shadow-none w-full sm:w-[150px] focus:ring-0 font-medium">
                <SelectValue placeholder="Stato cassa" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="regolare">Regolare</SelectItem>
                <SelectItem value="da_mettere">Da mettere a cassa</SelectItem>
              </SelectContent>
            </Select>
          </>
        )}
        <div className="hidden sm:block w-[1px] h-6 bg-border/60 mx-1"></div>
        <div className="flex-1 relative min-w-[150px]">
          <Input 
            name="quickNotes"
            placeholder="Note (opzionali)..." 
            className="h-10 border-0 focus-visible:ring-0 shadow-none bg-transparent placeholder:text-muted-foreground/70"
            autoComplete="off"
          />
        </div>
        <Button 
          type="submit" 
          size="sm" 
          className="font-medium shrink-0 h-10 px-4"
          disabled={defaultStatus === "emessa" && !quickDate}
        >
          Aggiungi
        </Button>
      </div>
    </form>
  );

  const renderPolicyFormFields = (
    f: ReturnType<typeof useForm<PolicyFormValues>>,
    currentStatus: PolicyFormValues["status"],
  ) => (
    <>
      <FormField
        control={f.control}
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
        control={f.control}
        name="policyType"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tipo di Polizza</FormLabel>
            <FormControl>
              <div className="relative">
                <Input placeholder="Es. RC Auto, Vita, Infortuni..." list="personal-policy-types" {...field} />
                <datalist id="personal-policy-types">
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
        control={f.control}
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
                <SelectItem value="da_emettere">Da emettere</SelectItem>
                <SelectItem value="emessa">Emessa (In Scadenza)</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {currentStatus === "emessa" ? (
        <FormField
          control={f.control}
          name="expiryDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Data di Scadenza *</FormLabel>
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
                      {field.value ? format(field.value, "PPP", { locale: it }) : <span>Seleziona una data</span>}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
      ) : (
        <FormField
          control={f.control}
          name="targetIssueDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Data Prevista Emissione (opzionale)</FormLabel>
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
                      {field.value ? format(field.value, "PPP", { locale: it }) : <span>Seleziona una data</span>}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      <FormField
        control={f.control}
        name="cassaStato"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Stato Cassa</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona stato cassa" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="regolare">Regolare</SelectItem>
                <SelectItem value="da_mettere">Da mettere a cassa</SelectItem>
                <SelectItem value="pagata">Pagata (Elimina)</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={f.control}
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
    </>
  );

  return (
    <div className="space-y-12">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="min-w-0">
          <div className="text-xs uppercase tracking-[0.18em] text-gold/90 font-semibold mb-2">Personale</div>
          <h1 className="text-3xl sm:text-4xl font-serif font-semibold text-primary mb-2 tracking-tight">Polizze Personali</h1>
          <p className="text-muted-foreground text-sm sm:text-base">Monitora il portafoglio personale e gestisci i sinistri.</p>
        </div>
      </div>

      <Dialog open={!!editingPolicy} onOpenChange={(open) => { if (!open) setEditingPolicy(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Modifica polizza</DialogTitle>
            <DialogDescription>Aggiorna i dati della polizza selezionata.</DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
              {renderPolicyFormFields(editForm, editStatusWatcher)}
              <div className="flex justify-end pt-4">
                <Button type="submit" data-testid="button-save-edit-policy">Salva modifiche</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Tabs defaultValue="in-scadenza" className="w-full">
        <div className="flex justify-center mb-6">
          <TabsList>
            <TabsTrigger value="in-scadenza" data-testid="tab-in-scadenza">
              <ShieldAlert className="w-4 h-4 mr-2" />
              In scadenza ({inScadenza.length})
            </TabsTrigger>
            <TabsTrigger value="da-emettere" data-testid="tab-da-emettere">
              <FileSignature className="w-4 h-4 mr-2" />
              Da emettere ({daEmettere.length})
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="in-scadenza" className="space-y-4">
          {renderQuickAdd("emessa")}

          {inScadenza.length > 0 ? (
            <div className="grid gap-3">
              {inScadenza.map(policy => (
                <Card key={policy.id} className="overflow-hidden group shadow-soft hover:shadow-card hover:border-primary/30 transition-all">
                  <CardContent className="p-0 flex flex-col sm:flex-row sm:items-center">
                    <div className="p-5 flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-3 mb-2 flex-wrap">
                        <h3 className="font-semibold text-base sm:text-lg flex items-center gap-2 min-w-0">
                          <span className="truncate">{policy.clientName}</span>
                          {renderCassaBadge(policy)}
                        </h3>
                        {policy.expiryDate && <UrgencyBadge date={policy.expiryDate} />}
                      </div>
                      <div className="flex items-center gap-3 text-muted-foreground text-sm flex-wrap">
                        <span className="bg-secondary px-2 py-0.5 rounded-md text-secondary-foreground font-medium text-xs">{policy.policyType}</span>
                        {policy.notes && <span className="truncate max-w-xs">{policy.notes}</span>}
                      </div>
                    </div>
                    <div className="px-4 sm:px-5 pb-4 sm:py-5 flex items-center justify-end sm:border-l sm:h-full gap-2 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-within:opacity-100 transition-opacity">
                      <Button 
                        variant="secondary" 
                        size="sm" 
                        className="font-medium text-xs gap-1.5 h-8 hover:bg-emerald-500/10 hover:text-emerald-600 hover:border-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                        onClick={() => setPayingPolicy(policy)}
                      >
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        Pagato
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={cn("hover:text-primary", policy.notes ? "text-primary" : "text-muted-foreground")}
                        onClick={() => setEditingNotePolicy(policy)}
                        title="Aggiungi o modifica nota"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setEditingPolicy(policy)} className="text-muted-foreground hover:text-primary" data-testid={`button-edit-policy-${policy.id}`}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeletingPolicy(policy)} className="text-muted-foreground hover:text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="p-10 text-center bg-card/50 border border-dashed rounded-xl text-muted-foreground text-sm">
              Nessuna polizza in scadenza.
            </div>
          )}
        </TabsContent>

        <TabsContent value="da-emettere" className="space-y-4">
          {renderQuickAdd("da_emettere")}

          {daEmettere.length > 0 ? (
            <div className="grid gap-3">
              {daEmettere.map(policy => (
                <Card key={policy.id} className="overflow-hidden group shadow-soft hover:shadow-card hover:border-primary/30 transition-all border-dashed">
                  <CardContent className="p-0 flex flex-col sm:flex-row sm:items-center">
                    <div className="p-5 flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-3 mb-2 flex-wrap">
                        <h3 className="font-semibold text-base sm:text-lg flex items-center gap-2 min-w-0">
                          <span className="truncate">{policy.clientName}</span>
                        </h3>
                        {policy.targetIssueDate && (
                          <span className="inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-md bg-secondary text-secondary-foreground ring-1 ring-border whitespace-nowrap">
                            <CalendarIcon className="w-3 h-3 mr-1" />
                            {format(parseLocalDate(policy.targetIssueDate), "d MMM yyyy", { locale: it })}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-muted-foreground text-sm flex-wrap">
                        <span className="bg-secondary px-2 py-0.5 rounded-md text-secondary-foreground font-medium text-xs">{policy.policyType}</span>
                        {policy.notes && <span className="truncate max-w-xs">{policy.notes}</span>}
                      </div>
                    </div>
                    <div className="px-4 sm:px-5 pb-4 sm:py-5 flex items-center justify-end sm:border-l sm:h-full gap-2 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-within:opacity-100 transition-opacity">
                      <Button 
                        variant="secondary" 
                        size="sm" 
                        className="font-medium text-xs gap-1.5 h-8 hover:bg-primary/10 hover:text-primary hover:border-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                        onClick={() => setIssuingPolicy(policy)}
                      >
                        <Check className="w-3.5 h-3.5 text-primary" />
                        Segna emessa
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={cn("hover:text-primary", policy.notes ? "text-primary" : "text-muted-foreground")}
                        onClick={() => setEditingNotePolicy(policy)}
                        title="Aggiungi o modifica nota"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setEditingPolicy(policy)} className="text-muted-foreground hover:text-primary" data-testid={`button-edit-policy-${policy.id}`}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeletingPolicy(policy)} className="text-muted-foreground hover:text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="p-10 text-center bg-card/50 border border-dashed rounded-xl text-muted-foreground text-sm">
              Nessuna polizza da emettere.
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={!!payingPolicy} onOpenChange={(open) => { if (!open) setPayingPolicy(null); }}>
        <DialogContent className="max-w-md border-border/80 shadow-elevated">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl font-semibold text-primary mb-1 flex items-center gap-2">
              <Check className="w-5 h-5 text-emerald-500" />
              Conferma Pagamento
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-sm leading-relaxed">
              Sei sicuro di voler contrassegnare la polizza di <strong className="text-foreground">{payingPolicy?.clientName}</strong> come pagata? <strong>Verrà eliminata definitivamente dal database</strong> e non sarà più recuperabile.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 pt-5">
            <Button variant="outline" onClick={() => setPayingPolicy(null)}>
              Annulla
            </Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-soft border-0 transition-colors"
              onClick={() => {
                if (payingPolicy) {
                  deletePolicy(payingPolicy.id);
                  setPayingPolicy(null);
                }
              }}
            >
              Conferma
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!issuingPolicy} onOpenChange={(open) => { if (!open) setIssuingPolicy(null); }}>
        <DialogContent className="max-w-md border-border/80 shadow-elevated">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl font-semibold text-primary mb-1 flex items-center gap-2">
              <Check className="w-5 h-5 text-primary" />
              Conferma Emissione
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-sm leading-relaxed">
              Sei sicuro di voler segnare la polizza di <strong className="text-foreground">{issuingPolicy?.clientName}</strong> come emessa? <strong>Verrà archiviata ed eliminata definitivamente dal database.</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 pt-5">
            <Button variant="outline" onClick={() => setIssuingPolicy(null)}>
              Annulla
            </Button>
            <Button
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-soft border-0 transition-colors"
              onClick={() => {
                if (issuingPolicy) {
                  deletePolicy(issuingPolicy.id);
                  setIssuingPolicy(null);
                }
              }}
            >
              Conferma
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deletingPolicy} onOpenChange={(open) => { if (!open) setDeletingPolicy(null); }}>
        <DialogContent className="max-w-md border-border/80 shadow-elevated">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl font-semibold text-destructive mb-1 flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-destructive" />
              Conferma Eliminazione
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-sm leading-relaxed">
              Sei sicuro di voler eliminare definitivamente la polizza di <strong className="text-foreground">{deletingPolicy?.clientName}</strong>? Questa azione è irreversibile.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 pt-5">
            <Button variant="outline" onClick={() => setDeletingPolicy(null)}>
              Annulla
            </Button>
            <Button
              variant="destructive"
              className="font-medium shadow-soft border-0 transition-colors"
              onClick={() => {
                if (deletingPolicy) {
                  deletePolicy(deletingPolicy.id);
                  setDeletingPolicy(null);
                }
              }}
            >
              Elimina
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingNotePolicy} onOpenChange={(open) => { if (!open) setEditingNotePolicy(null); }}>
        <DialogContent className="max-w-md border-border/80 shadow-elevated">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl font-semibold text-primary mb-1 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" />
              Note Polizza
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            if (editingNotePolicy) {
              const formData = new FormData(e.currentTarget);
              const notes = formData.get("notes") as string;
              updatePolicy(editingNotePolicy.id, { notes: notes || undefined });
              setEditingNotePolicy(null);
            }
          }}>
            <div className="pt-4 pb-6">
              <Textarea 
                name="notes"
                defaultValue={editingNotePolicy?.notes || ""}
                placeholder="Scrivi qui i tuoi appunti, dettagli o numeri di telefono..."
                className="min-h-[120px] resize-y"
                autoFocus
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setEditingNotePolicy(null)}>
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
