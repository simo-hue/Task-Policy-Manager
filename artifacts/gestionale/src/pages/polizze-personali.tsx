import { useState, useEffect, Fragment } from "react";
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
import { format, differenceInDays, isToday, isYesterday } from "date-fns";
import { it } from "date-fns/locale";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { CalendarIcon, Plus, ShieldAlert, FileSignature, Trash2, ArrowRight, Pencil, Settings2, Check, ChevronDown, MessageSquare, User, Shield, CreditCard, FileText, Landmark } from "lucide-react";
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
  premio: z.coerce.number().optional(),
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
  const [quickDatePopoverOpen, setQuickDatePopoverOpen] = useState(false);
  const [editExpiryDatePopoverOpen, setEditExpiryDatePopoverOpen] = useState(false);
  const [editTargetDatePopoverOpen, setEditTargetDatePopoverOpen] = useState(false);
  const [quickAddOpen, setQuickAddOpen] = useState(false);

  const editForm = useForm<PolicyFormValues>({
    resolver: zodResolver(policySchema),
    defaultValues: { clientName: "", policyType: "", notes: "", status: "da_emettere", daMettereACassa: false, cassaStato: "regolare", premio: undefined },
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
        premio: editingPolicy.premio,
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
        notes: values.notes ?? "",
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
        premio: values.premio,
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
    <Dialog open={quickAddOpen} onOpenChange={setQuickAddOpen}>
      <DialogTrigger asChild>
        <Button 
          size="icon" 
          className="md:hidden fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom))] md:bottom-8 right-4 md:right-8 w-14 h-14 rounded-full shadow-elevated z-40 hover:scale-105 active:scale-95 transition-all bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="w-6 h-6" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl p-0 border-border/80 shadow-elevated overflow-hidden">
        <DialogHeader className="p-6 pb-5 border-b border-border/40 bg-gradient-to-r from-primary/5 via-background to-background relative overflow-hidden">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 ring-1 ring-primary/20">
            <Plus className="w-6 h-6 text-primary" />
          </div>
          <DialogTitle className="text-2xl font-serif font-semibold tracking-tight text-primary">
            Nuova Polizza
          </DialogTitle>
          <DialogDescription className="text-base">
            {defaultStatus === "emessa" ? "Inserisci i dettagli della polizza in scadenza." : "Prepara una nuova polizza da emettere in futuro."}
          </DialogDescription>
        </DialogHeader>
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
              addPolicy({ 
                clientName, 
                policyType: quickType, 
                status: defaultStatus, 
                expiryDate: defaultStatus === "emessa" && quickDate ? format(quickDate, 'yyyy-MM-dd') : undefined,
                targetIssueDate: defaultStatus === "da_emettere" && quickDate ? format(quickDate, 'yyyy-MM-dd') : undefined,
                daMettereACassa: quickCassa === "da_mettere", 
                cassaStato: quickCassa as any,
                notes: notes || "",
                premio
              });
              nameInput.value = "";
              notesInput.value = "";
              if (premioInput) premioInput.value = "";
              setQuickDate(undefined);
              setQuickAddOpen(false);
            }
          }}
          className="p-6 flex flex-col gap-5"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-sm font-medium leading-none text-foreground/90">Nome Cliente</label>
              <div className="relative">
                <Input name="quickName" placeholder="Es. Mario Rossi" required className="pl-9 h-11 bg-muted/30 border-transparent focus-visible:bg-background focus-visible:ring-primary/30 transition-all" autoComplete="off" />
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/70" />
              </div>
            </div>
            
            <div className="space-y-1.5">
              <label className="text-sm font-medium leading-none text-foreground/90">Tipo Polizza</label>
              <div className="relative">
                <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/70 z-10 pointer-events-none" />
                <Select value={quickType} onValueChange={setQuickType}>
                  <SelectTrigger className="h-11 pl-9 bg-muted/30 border-transparent focus:bg-background focus:ring-primary/30 transition-all">
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
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium leading-none text-foreground/90">{defaultStatus === "emessa" ? "Scadenza" : "Prevista Emissione"}</label>
              <Popover open={quickDatePopoverOpen} onOpenChange={setQuickDatePopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn("w-full h-11 justify-start text-left font-normal bg-muted/30 border-transparent hover:bg-muted/50 focus-visible:ring-primary/30 transition-all", !quickDate && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 opacity-70 shrink-0" />
                    {quickDate ? format(quickDate, "P", { locale: it }) : "Seleziona data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 border-none bg-transparent shadow-none" align="start">
                  <Calendar mode="single" selected={quickDate} onSelect={(date) => { setQuickDate(date); setQuickDatePopoverOpen(false); }} initialFocus />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium leading-none text-foreground/90">Premio Stimato</label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/70" />
                <Input name="quickPremio" type="number" inputMode="decimal" step="0.01" placeholder="Es. 250.00" className="pl-9 h-11 bg-muted/30 border-transparent focus-visible:bg-background focus-visible:ring-primary/30 transition-all" autoComplete="off" />
              </div>
            </div>

            {defaultStatus === "emessa" && (
              <div className="space-y-1.5">
                <label className="text-sm font-medium leading-none text-foreground/90">Stato Cassa</label>
                <div className="relative">
                  <Landmark className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/70 z-10 pointer-events-none" />
                  <Select value={quickCassa} onValueChange={setQuickCassa}>
                    <SelectTrigger className="h-11 pl-9 bg-muted/30 border-transparent focus:bg-background focus:ring-primary/30 transition-all">
                      <SelectValue placeholder="Stato cassa" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="regolare">Regolare</SelectItem>
                      <SelectItem value="da_mettere">Da mettere a cassa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            <div className={cn("space-y-1.5", defaultStatus === "emessa" ? "sm:col-span-1" : "sm:col-span-2")}>
              <label className="text-sm font-medium leading-none text-foreground/90">Note Opzionali</label>
              <div className="relative">
                <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/70" />
                <Input name="quickNotes" placeholder="Note aggiuntive..." className="pl-9 h-11 bg-muted/30 border-transparent focus-visible:bg-background focus-visible:ring-primary/30 transition-all" autoComplete="off" />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-5 mt-2 border-t border-border/40 gap-3">
            <Button type="button" variant="ghost" onClick={() => setQuickAddOpen(false)}>Annulla</Button>
            <Button type="submit" className="px-6" disabled={defaultStatus === "emessa" && !quickDate}>Aggiungi Polizza</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );

  const renderDesktopQuickAdd = (defaultStatus: "emessa" | "da_emettere") => (
    <div className="hidden md:block w-full mb-4">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const target = e.target as HTMLFormElement;
          const nameInput = target.elements.namedItem("quickNameDesktop") as HTMLInputElement;
          const clientName = nameInput.value.trim();
          const notesInput = target.elements.namedItem("quickNotesDesktop") as HTMLInputElement;
          const notes = notesInput.value.trim();
          const premioInput = target.elements.namedItem("quickPremioDesktop") as HTMLInputElement;
          const premioVal = premioInput?.value.trim();
          const premio = premioVal ? Number(premioVal) : undefined;
          
          if (clientName) {
            addPolicy({ 
              clientName, 
              policyType: quickType, 
              status: defaultStatus, 
              expiryDate: defaultStatus === "emessa" && quickDate ? format(quickDate, 'yyyy-MM-dd') : undefined,
              targetIssueDate: defaultStatus === "da_emettere" && quickDate ? format(quickDate, 'yyyy-MM-dd') : undefined,
              daMettereACassa: quickCassa === "da_mettere", 
              cassaStato: quickCassa as any,
              notes: notes || "",
              premio
            });
            nameInput.value = "";
            notesInput.value = "";
            if (premioInput) premioInput.value = "";
            setQuickDate(undefined);
          }
        }}
        className="flex flex-row items-center gap-2 bg-card p-2 rounded-xl border border-border/60 shadow-sm transition-all w-full mx-auto"
      >
        <div className="flex-1 relative min-w-[200px]">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/70" />
          <Input 
            name="quickNameDesktop" 
            placeholder="Nome Cliente" 
            className="pl-9 h-10 border-0 bg-secondary/50 focus-visible:ring-1 focus-visible:ring-primary/30 rounded-xl text-sm" 
            autoComplete="off" 
            required 
          />
        </div>

        <Select value={quickType} onValueChange={setQuickType}>
          <SelectTrigger className="h-10 w-[140px] border-0 bg-secondary/50 focus:ring-1 focus:ring-primary/30 rounded-xl text-sm font-medium">
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
              className={cn("h-10 w-[140px] bg-secondary/50 font-normal border-0 text-sm rounded-xl justify-start", !quickDate && "text-muted-foreground")}
            >
              <CalendarIcon className="mr-2 h-4 w-4 opacity-50 shrink-0" />
              <span className="truncate">{quickDate ? format(quickDate, "d MMM yy", { locale: it }) : (defaultStatus === "emessa" ? "Scadenza" : "Emissione")}</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 border-none bg-transparent shadow-none" align="start">
            <Calendar mode="single" selected={quickDate} onSelect={(date) => { setQuickDate(date); setQuickDatePopoverOpen(false); }} initialFocus />
          </PopoverContent>
        </Popover>

        <div className="w-[110px]">
          <Input 
            name="quickPremioDesktop" 
            type="number" 
            inputMode="decimal" 
            step="0.01" 
            placeholder="Premio €" 
            className="h-10 border-0 bg-secondary/50 focus-visible:ring-1 focus-visible:ring-primary/30 rounded-xl text-sm" 
            autoComplete="off" 
          />
        </div>

        {defaultStatus === "emessa" && (
          <Select value={quickCassa} onValueChange={setQuickCassa}>
            <SelectTrigger className="h-10 w-[140px] border-0 bg-secondary/50 focus:ring-1 focus:ring-primary/30 rounded-xl text-sm font-medium">
              <SelectValue placeholder="Cassa" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="regolare">Regolare</SelectItem>
              <SelectItem value="da_mettere">Da mettere</SelectItem>
            </SelectContent>
          </Select>
        )}

        <div className="flex-1 relative min-w-[150px]">
          <Input 
            name="quickNotesDesktop" 
            placeholder="Note..." 
            className="h-10 border-0 bg-secondary/50 focus-visible:ring-1 focus-visible:ring-primary/30 rounded-xl text-sm" 
            autoComplete="off" 
          />
        </div>

        <Button type="submit" size="sm" className="h-10 px-5 font-medium rounded-xl shrink-0" disabled={defaultStatus === "emessa" && !quickDate}>
          Aggiungi
        </Button>
      </form>
    </div>
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
        name="premio"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Premio (€) (opzionale)</FormLabel>
            <FormControl>
              <Input type="number" inputMode="decimal" step="0.01" placeholder="Es. 250.50" {...field} value={field.value ?? ""} onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)} />
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
              <Popover open={editExpiryDatePopoverOpen} onOpenChange={setEditExpiryDatePopoverOpen}>
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
                <PopoverContent className="w-auto p-0 border-none bg-transparent shadow-none" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={(date) => {
                      field.onChange(date);
                      setEditExpiryDatePopoverOpen(false);
                    }}
                    initialFocus
                  />
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
              <Popover open={editTargetDatePopoverOpen} onOpenChange={setEditTargetDatePopoverOpen}>
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
                <PopoverContent className="w-auto p-0 border-none bg-transparent shadow-none" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={(date) => {
                      field.onChange(date);
                      setEditTargetDatePopoverOpen(false);
                    }}
                    initialFocus
                  />
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
    <div className="flex flex-col h-full min-h-[calc(100vh-120px)] space-y-6 sm:space-y-12 relative">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="min-w-0">
          <div className="text-xs uppercase tracking-[0.18em] text-gold/90 font-semibold mb-2">Personale</div>
          <h1 className="text-2xl sm:text-4xl font-serif font-semibold text-primary mb-1 sm:mb-2 tracking-tight">Personali</h1>
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

      <Tabs defaultValue="in-scadenza" className="w-full flex flex-col flex-1">
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

        <TabsContent value="in-scadenza" className="space-y-4 flex flex-col flex-1 pb-32 md:pb-4 h-full">
          {renderDesktopQuickAdd("emessa")}
          {inScadenza.length > 0 ? (
            <div className="flex flex-col gap-3 flex-1">
              {inScadenza.map((policy, index) => {
                const dateKey = policy.expiryDate ? format(parseLocalDate(policy.expiryDate), "yyyy-MM-dd") : "none";
                const prevDateKey = index > 0 ? (inScadenza[index - 1].expiryDate ? format(parseLocalDate(inScadenza[index - 1].expiryDate!), "yyyy-MM-dd") : "none") : null;
                
                const showSeparator = dateKey !== prevDateKey;
                
                let separatorLabel = "";
                if (showSeparator) {
                  if (dateKey === "none") {
                    separatorLabel = "NESSUNA SCADENZA";
                  } else {
                    const d = parseLocalDate(policy.expiryDate!);
                    separatorLabel = format(d, "d MMMM yyyy", { locale: it }).toUpperCase();
                    if (isToday(d)) separatorLabel = "OGGI - " + separatorLabel;
                    if (isYesterday(d)) separatorLabel = "IERI - " + separatorLabel;
                  }
                }

                return (
                  <Fragment key={policy.id}>
                    {showSeparator && (
                      <div className={cn("relative flex items-center pb-1", index !== 0 && "pt-4")}>
                        <div className="flex-grow border-t border-border/60"></div>
                        <span className="mx-4 text-xs font-semibold tracking-[0.18em] text-primary/80 uppercase text-center">
                          {separatorLabel}
                        </span>
                        <div className="flex-grow border-t border-border/60"></div>
                      </div>
                    )}
                    <Card className="overflow-hidden group shadow-soft hover:shadow-card hover:border-primary/30 transition-all">
                      <CardContent className="p-0 flex flex-col sm:flex-row sm:items-center">
                        <div className="p-3 sm:p-5 flex-1 min-w-0">
                          <div className="flex justify-between items-start gap-3 mb-2 flex-wrap">
                            <h3 className="font-semibold text-base sm:text-lg flex items-center gap-2 min-w-0 flex-wrap">
                              <span className="truncate max-w-[180px] sm:max-w-xs">{policy.clientName}</span>
                              {renderCassaBadge(policy)}
                              <span className="bg-secondary px-2 py-0.5 rounded-md text-secondary-foreground font-medium text-xs">{policy.policyType}</span>
                              {policy.premio !== undefined && (
                                <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-md font-medium text-xs whitespace-nowrap">
                                  € {policy.premio.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                              )}
                            </h3>
                          </div>
                      {policy.notes && (
                        <div className="flex items-center gap-3 text-muted-foreground text-sm flex-wrap">
                          <span className="truncate max-w-xs">{policy.notes}</span>
                        </div>
                      )}
                    </div>
                    <div className="px-3 sm:px-5 pb-3 sm:py-5 flex items-center justify-end sm:border-l sm:h-full gap-1.5 sm:gap-2 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-within:opacity-100 transition-opacity flex-wrap">
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
                  </Fragment>
                );
              })}
            </div>
          ) : (
            <div className="p-10 text-center bg-card/50 border border-dashed rounded-xl text-muted-foreground text-sm flex-1">
              Nessuna polizza in scadenza.
            </div>
          )}
          {renderQuickAdd("emessa")}
        </TabsContent>

        <TabsContent value="da-emettere" className="space-y-4 flex flex-col flex-1 pb-32 md:pb-4 h-full">
          {renderDesktopQuickAdd("da_emettere")}
          {daEmettere.length > 0 ? (
            <div className="flex flex-col gap-3 flex-1">
              {daEmettere.map((policy, index) => {
                const dateKey = policy.targetIssueDate ? format(parseLocalDate(policy.targetIssueDate), "yyyy-MM-dd") : "none";
                const prevDateKey = index > 0 ? (daEmettere[index - 1].targetIssueDate ? format(parseLocalDate(daEmettere[index - 1].targetIssueDate!), "yyyy-MM-dd") : "none") : null;
                
                const showSeparator = dateKey !== prevDateKey;
                
                let separatorLabel = "";
                if (showSeparator) {
                  if (dateKey === "none") {
                    separatorLabel = "NESSUNA DATA";
                  } else {
                    const d = parseLocalDate(policy.targetIssueDate!);
                    separatorLabel = format(d, "d MMMM yyyy", { locale: it }).toUpperCase();
                    if (isToday(d)) separatorLabel = "OGGI - " + separatorLabel;
                    if (isYesterday(d)) separatorLabel = "IERI - " + separatorLabel;
                  }
                }

                return (
                  <Fragment key={policy.id}>
                    {showSeparator && (
                      <div className={cn("relative flex items-center pb-1", index !== 0 && "pt-4")}>
                        <div className="flex-grow border-t border-border/60"></div>
                        <span className="mx-4 text-xs font-semibold tracking-[0.18em] text-primary/80 uppercase text-center">
                          {separatorLabel}
                        </span>
                        <div className="flex-grow border-t border-border/60"></div>
                      </div>
                    )}
                    <Card className="overflow-hidden group shadow-soft hover:shadow-card hover:border-primary/30 transition-all border-dashed">
                      <CardContent className="p-0 flex flex-col sm:flex-row sm:items-center">
                        <div className="p-3 sm:p-5 flex-1 min-w-0">
                          <div className="flex justify-between items-start gap-3 mb-2 flex-wrap">
                            <h3 className="font-semibold text-base sm:text-lg flex items-center gap-2 min-w-0 flex-wrap">
                              <span className="truncate max-w-[180px] sm:max-w-xs">{policy.clientName}</span>
                              <span className="bg-secondary px-2 py-0.5 rounded-md text-secondary-foreground font-medium text-xs">{policy.policyType}</span>
                              {policy.premio !== undefined && (
                                <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-md font-medium text-xs whitespace-nowrap">
                                  € {policy.premio.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                              )}
                            </h3>
                          </div>
                      {policy.notes && (
                        <div className="flex items-center gap-3 text-muted-foreground text-sm flex-wrap">
                          <span className="truncate max-w-xs">{policy.notes}</span>
                        </div>
                      )}
                    </div>
                    <div className="px-3 sm:px-5 pb-3 sm:py-5 flex items-center justify-end sm:border-l sm:h-full gap-1.5 sm:gap-2 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-within:opacity-100 transition-opacity flex-wrap">
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
                  </Fragment>
                );
              })}
            </div>
          ) : (
            <div className="p-10 text-center bg-card/50 border border-dashed rounded-xl text-muted-foreground text-sm flex-1">
              Nessuna polizza da emettere.
            </div>
          )}
          {renderQuickAdd("da_emettere")}
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
              updatePolicy(editingNotePolicy.id, { notes: notes || "" });
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
