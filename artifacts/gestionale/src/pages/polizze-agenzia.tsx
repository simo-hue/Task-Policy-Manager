import { useState, useEffect } from "react";
import { usePoliciesAgenzia, Policy } from "@/lib/policies-store";
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
import { CalendarIcon, Plus, ShieldAlert, FileSignature, Trash2, ArrowRight, Pencil, Settings2 } from "lucide-react";
import { cn, parseLocalDate } from "@/lib/utils";

const policySchema = z.object({
  clientName: z.string().min(1, "Il nome cliente è obbligatorio"),
  policyType: z.string().min(1, "Il tipo di polizza è obbligatorio"),
  notes: z.string().optional(),
  status: z.enum(["da_emettere", "emessa"]),
  expiryDate: z.date().optional(),
  targetIssueDate: z.date().optional(),
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

export function PolizzeAgenzia() {
  const { policies, addPolicy, updatePolicy, deletePolicy } = usePoliciesAgenzia();
  const { settings, setExpiryThresholdDays } = useSettings();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<Policy | null>(null);
  const [issuingPolicy, setIssuingPolicy] = useState<Policy | null>(null);

  const form = useForm<PolicyFormValues>({
    resolver: zodResolver(policySchema),
    defaultValues: { clientName: "", policyType: "", notes: "", status: "da_emettere" },
  });

  const editForm = useForm<PolicyFormValues>({
    resolver: zodResolver(policySchema),
    defaultValues: { clientName: "", policyType: "", notes: "", status: "da_emettere" },
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
      });
    }
  }, [editingPolicy, editForm]);

  function onSubmit(values: PolicyFormValues) {
    addPolicy({
      clientName: values.clientName,
      policyType: values.policyType,
      notes: values.notes || undefined,
      status: values.status,
      expiryDate: values.expiryDate ? format(values.expiryDate, 'yyyy-MM-dd') : undefined,
      targetIssueDate: values.targetIssueDate ? format(values.targetIssueDate, 'yyyy-MM-dd') : undefined,
    });
    setIsAddOpen(false);
    form.reset({ clientName: "", policyType: "", notes: "", status: "da_emettere" });
  }

  function onEditSubmit(values: PolicyFormValues) {
    if (!editingPolicy) return;
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
    });
    setEditingPolicy(null);
  }

  const statusWatcher = form.watch("status");
  const editStatusWatcher = editForm.watch("status");

  const threshold = settings.expiryThresholdDays;

  const emesse = policies.filter(p => p.status === 'emessa' && p.expiryDate);

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const inScadenza = emesse
    .filter(p => differenceInDays(parseLocalDate(p.expiryDate!), todayStart) <= threshold)
    .sort((a, b) => parseLocalDate(a.expiryDate!).getTime() - parseLocalDate(b.expiryDate!).getTime());

  const daEmettere = policies.filter(p => p.status === 'da_emettere').sort((a, b) => {
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

  const renderPolicyFormFields = (
    f: typeof form,
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
              <Input placeholder="Es. RC Auto, Vita, Infortuni..." {...field} />
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
                <SelectItem value="da_emettere">Sinistri</SelectItem>
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
          <div className="text-xs uppercase tracking-[0.18em] text-gold/90 font-semibold mb-2">Agenzia</div>
          <h1 className="text-3xl sm:text-4xl font-serif font-semibold text-primary mb-2 tracking-tight">Polizze Agenzia</h1>
          <p className="text-muted-foreground text-sm sm:text-base">Monitora il portafoglio agenzia e gestisci i sinistri.</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-policy">
              <Plus className="w-4 h-4 mr-2" />
              Nuova polizza
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Aggiungi polizza</DialogTitle>
              <DialogDescription>Inserisci i dati della nuova polizza.</DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {renderPolicyFormFields(form, statusWatcher)}
                <div className="flex justify-end pt-4">
                  <Button type="submit">Salva polizza</Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
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
        <TabsList className="mb-6">
          <TabsTrigger value="in-scadenza" data-testid="tab-in-scadenza">
            <ShieldAlert className="w-4 h-4 mr-2" />
            In scadenza ({inScadenza.length})
          </TabsTrigger>
          <TabsTrigger value="da-emettere" data-testid="tab-da-emettere">
            <FileSignature className="w-4 h-4 mr-2" />
            Sinistri ({daEmettere.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="in-scadenza" className="space-y-4">
          <div className="inline-flex items-center gap-3 text-sm bg-card border rounded-full pl-4 pr-1.5 py-1.5 shadow-soft flex-wrap max-w-full">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Settings2 className="w-4 h-4" />
              <label htmlFor="threshold-input" className="font-medium whitespace-nowrap">In scadenza entro</label>
            </div>
            <div className="flex items-center gap-0.5 bg-muted/60 rounded-full p-0.5">
              {[
                { label: "7", value: 7 },
                { label: "14", value: 14 },
                { label: "30", value: 30 },
                { label: "60", value: 60 },
                { label: "90", value: 90 },
              ].map((preset) => {
                const active = threshold === preset.value;
                return (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => setExpiryThresholdDays(preset.value)}
                    data-testid={`button-threshold-${preset.value}`}
                    aria-pressed={active}
                    className={cn(
                      "h-7 min-w-[2.25rem] px-2.5 rounded-full text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-card",
                      active
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {preset.label}
                    <span className="ml-0.5 opacity-60 font-normal">gg</span>
                  </button>
                );
              })}
            </div>
            <div className="flex items-center gap-1.5 pl-1 border-l border-border/70">
              <Input
                id="threshold-input"
                type="number"
                min={1}
                max={365}
                value={threshold}
                onChange={(e) => {
                  const v = parseInt(e.target.value, 10);
                  if (!Number.isNaN(v) && v > 0 && v <= 365) setExpiryThresholdDays(v);
                }}
                className="w-14 h-7 text-sm text-center font-semibold tabular-nums border-0 bg-transparent shadow-none focus-visible:ring-1 focus-visible:ring-ring px-1"
                data-testid="input-threshold"
              />
              <span className="text-muted-foreground text-xs pr-2">giorni</span>
            </div>
          </div>

          {inScadenza.length > 0 ? (
            <div className="grid gap-3">
              {inScadenza.map(policy => (
                <Card key={policy.id} className="overflow-hidden group shadow-soft hover:shadow-card hover:border-primary/30 transition-all">
                  <CardContent className="p-0 flex flex-col sm:flex-row sm:items-center">
                    <div className="p-5 flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-3 mb-2 flex-wrap">
                        <h3 className="font-semibold text-base sm:text-lg truncate">{policy.clientName}</h3>
                        {policy.expiryDate && <UrgencyBadge date={policy.expiryDate} />}
                      </div>
                      <div className="flex items-center gap-3 text-muted-foreground text-sm flex-wrap">
                        <span className="bg-secondary px-2 py-0.5 rounded-md text-secondary-foreground font-medium text-xs">{policy.policyType}</span>
                        {policy.notes && <span className="truncate max-w-xs">{policy.notes}</span>}
                      </div>
                    </div>
                    <div className="px-4 sm:px-5 pb-4 sm:py-5 flex items-center justify-end sm:border-l sm:h-full gap-1 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-within:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" onClick={() => setEditingPolicy(policy)} className="text-muted-foreground hover:text-primary" data-testid={`button-edit-policy-${policy.id}`}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => deletePolicy(policy.id)} className="text-muted-foreground hover:text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="p-10 text-center bg-card/50 border border-dashed rounded-xl text-muted-foreground text-sm">
              Nessuna polizza in scadenza entro {threshold} giorni.
            </div>
          )}
        </TabsContent>

        <TabsContent value="da-emettere" className="space-y-4">
          {daEmettere.length > 0 ? (
            <div className="grid gap-3">
              {daEmettere.map(policy => (
                <Card key={policy.id} className="overflow-hidden group shadow-soft hover:shadow-card hover:border-primary/30 transition-all border-dashed">
                  <CardContent className="p-0 flex flex-col sm:flex-row sm:items-center">
                    <div className="p-5 flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-3 mb-2 flex-wrap">
                        <h3 className="font-semibold text-base sm:text-lg truncate">{policy.clientName}</h3>
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
                    <div className="px-4 sm:px-5 pb-4 sm:py-5 flex items-center justify-end sm:border-l sm:h-full gap-2">
                      <Dialog open={issuingPolicy?.id === policy.id} onOpenChange={(open) => {
                        if (!open) setIssuingPolicy(null);
                        else setIssuingPolicy(policy);
                      }}>
                        <DialogTrigger asChild>
                          <Button variant="secondary" className="font-medium">
                            Segna emessa <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                          <DialogHeader>
                            <DialogTitle>Conferma emissione</DialogTitle>
                            <DialogDescription>
                              Sei sicuro di voler segnare la polizza di <strong>{policy.clientName}</strong> come emessa? Verrà archiviata e non sarà più visibile in questo elenco.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="flex justify-end gap-3 pt-4">
                            <Button variant="outline" onClick={() => setIssuingPolicy(null)}>
                              Annulla
                            </Button>
                            <Button
                              onClick={() => {
                                updatePolicy(policy.id, {
                                  status: "emessa",
                                  targetIssueDate: undefined,
                                  issuedAt: new Date().toISOString(),
                                });
                                setIssuingPolicy(null);
                              }}
                            >
                              Conferma
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Button variant="ghost" size="icon" onClick={() => setEditingPolicy(policy)} className="text-muted-foreground hover:text-primary opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity" data-testid={`button-edit-policy-${policy.id}`}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => deletePolicy(policy.id)} className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="p-10 text-center bg-card/50 border border-dashed rounded-xl text-muted-foreground text-sm">
              Nessun sinistro registrato.
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
