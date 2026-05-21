import { useState, useEffect } from "react";
import { usePolicies, Policy } from "@/lib/policies-store";
import { useSettings } from "@/hooks/use-settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { format, differenceInDays, isPast } from "date-fns";
import { it } from "date-fns/locale";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { CalendarIcon, Plus, ShieldAlert, FileSignature, Trash2, ArrowRight, Pencil, Settings2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const policySchema = z.object({
  clientName: z.string().min(1, "Il nome cliente è obbligatorio"),
  policyType: z.string().min(1, "Il tipo di polizza è obbligatorio"),
  notes: z.string().optional(),
  status: z.enum(["da_emettere", "emessa"]),
  expiryDate: z.date().optional(),
  targetIssueDate: z.date().optional(),
}).superRefine((data, ctx) => {
  if (data.status === "emessa" && !data.expiryDate) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "La data di scadenza è obbligatoria per le polizze emesse",
      path: ["expiryDate"],
    });
  }
});

type PolicyFormValues = z.infer<typeof policySchema>;

export function Polizze() {
  const { policies, addPolicy, updatePolicy, deletePolicy, issuePolicy } = usePolicies();
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

  const issueForm = useForm<{ expiryDate: Date }>({
    defaultValues: { expiryDate: undefined as unknown as Date }
  });

  useEffect(() => {
    if (editingPolicy) {
      editForm.reset({
        clientName: editingPolicy.clientName,
        policyType: editingPolicy.policyType,
        notes: editingPolicy.notes ?? "",
        status: editingPolicy.status,
        expiryDate: editingPolicy.expiryDate ? new Date(editingPolicy.expiryDate) : undefined,
        targetIssueDate: editingPolicy.targetIssueDate ? new Date(editingPolicy.targetIssueDate) : undefined,
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
        : undefined,
    });
    setEditingPolicy(null);
  }

  function onIssueSubmit(values: { expiryDate: Date }) {
    if (issuingPolicy && values.expiryDate) {
      issuePolicy(issuingPolicy.id, format(values.expiryDate, 'yyyy-MM-dd'));
      setIssuingPolicy(null);
      issueForm.reset();
    }
  }

  const statusWatcher = form.watch("status");
  const editStatusWatcher = editForm.watch("status");

  const threshold = settings.expiryThresholdDays;

  const emesse = policies.filter(p => p.status === 'emessa' && p.expiryDate);

  const inScadenza = emesse
    .filter(p => differenceInDays(new Date(p.expiryDate!), new Date()) <= threshold)
    .sort((a, b) => new Date(a.expiryDate!).getTime() - new Date(b.expiryDate!).getTime());

  const daEmettere = policies.filter(p => p.status === 'da_emettere').sort((a, b) => {
    if (!a.targetIssueDate) return 1;
    if (!b.targetIssueDate) return -1;
    return new Date(a.targetIssueDate).getTime() - new Date(b.targetIssueDate).getTime();
  });

  const getUrgencyLevel = (dateString?: string) => {
    if (!dateString) return "neutral";
    const days = differenceInDays(new Date(dateString), new Date());
    if (days < 0 || isPast(new Date(dateString))) return "danger";
    if (days < 7) return "danger";
    if (days <= 30) return "warning";
    return "neutral";
  };

  const UrgencyBadge = ({ date }: { date: string }) => {
    const level = getUrgencyLevel(date);
    const label = format(new Date(date), "d MMM yyyy", { locale: it });
    
    if (level === "danger") return <Badge variant="destructive" className="font-semibold text-sm px-2 py-1"><CalendarIcon className="w-3 h-3 mr-1"/>{label}</Badge>;
    if (level === "warning") return <Badge variant="secondary" className="bg-amber-100 text-amber-800 hover:bg-amber-100 font-semibold text-sm px-2 py-1 border-amber-200"><CalendarIcon className="w-3 h-3 mr-1"/>{label}</Badge>;
    return <Badge variant="outline" className="font-medium text-sm px-2 py-1 text-muted-foreground"><CalendarIcon className="w-3 h-3 mr-1"/>{label}</Badge>;
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
                <SelectItem value="da_emettere">Da Emettere</SelectItem>
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
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-serif text-primary mb-2">Polizze</h1>
          <p className="text-muted-foreground">Monitora il portafoglio e gestisci le nuove emissioni.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm bg-muted/40 border rounded-md px-3 py-2 flex-wrap">
            <Settings2 className="w-4 h-4 text-muted-foreground" />
            <label htmlFor="threshold-input" className="text-muted-foreground">In scadenza entro</label>
            <div className="flex items-center gap-1">
              {[
                { label: "7 gg", value: 7 },
                { label: "14 gg", value: 14 },
                { label: "30 gg", value: 30 },
                { label: "60 gg", value: 60 },
                { label: "90 gg", value: 90 },
              ].map((preset) => (
                <Button
                  key={preset.value}
                  type="button"
                  size="sm"
                  variant={threshold === preset.value ? "default" : "outline"}
                  className="h-8 px-2 text-xs"
                  onClick={() => setExpiryThresholdDays(preset.value)}
                  data-testid={`button-threshold-${preset.value}`}
                >
                  {preset.label}
                </Button>
              ))}
            </div>
            <div className="flex items-center gap-1 pl-2 ml-1 border-l">
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
                className="w-16 h-8"
                data-testid="input-threshold"
              />
              <span className="text-muted-foreground">giorni</span>
            </div>
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
      </div>

      <Dialog open={!!editingPolicy} onOpenChange={(open) => { if (!open) setEditingPolicy(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Modifica polizza</DialogTitle>
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

      <div className="space-y-6">
        <div className="flex items-center gap-2 border-b pb-2">
          <ShieldAlert className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-serif font-medium">In Scadenza</h2>
          <span className="text-xs text-muted-foreground ml-2">(entro {threshold} giorni)</span>
        </div>
        
        {inScadenza.length > 0 ? (
          <div className="grid gap-4">
            {inScadenza.map(policy => (
              <Card key={policy.id} className="overflow-hidden group hover:shadow-md transition-all">
                <CardContent className="p-0 flex flex-col sm:flex-row sm:items-center">
                  <div className="p-5 flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-lg">{policy.clientName}</h3>
                      {policy.expiryDate && <UrgencyBadge date={policy.expiryDate} />}
                    </div>
                    <div className="flex items-center gap-3 text-muted-foreground text-sm">
                      <span className="bg-muted px-2 py-1 rounded-md text-foreground font-medium">{policy.policyType}</span>
                      {policy.notes && <span className="truncate max-w-xs">{policy.notes}</span>}
                    </div>
                  </div>
                  <div className="bg-muted/30 p-4 sm:p-5 flex items-center justify-end sm:border-l sm:h-full gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
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
          <div className="p-8 text-center bg-card border rounded-lg text-muted-foreground">
            Nessuna polizza in scadenza entro {threshold} giorni.
          </div>
        )}
      </div>

      <div className="space-y-6">
        <div className="flex items-center gap-2 border-b pb-2">
          <FileSignature className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-serif font-medium">Da Emettere</h2>
        </div>
        
        {daEmettere.length > 0 ? (
          <div className="grid gap-4">
            {daEmettere.map(policy => (
              <Card key={policy.id} className="overflow-hidden group hover:shadow-md transition-all border-dashed">
                <CardContent className="p-0 flex flex-col sm:flex-row sm:items-center">
                  <div className="p-5 flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-lg">{policy.clientName}</h3>
                      {policy.targetIssueDate && (
                        <div className="text-sm font-medium text-muted-foreground">
                          Prevista per: {format(new Date(policy.targetIssueDate), "d MMM yyyy", { locale: it })}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-muted-foreground text-sm">
                      <span className="bg-muted px-2 py-1 rounded-md text-foreground font-medium">{policy.policyType}</span>
                      {policy.notes && <span className="truncate max-w-xs">{policy.notes}</span>}
                    </div>
                  </div>
                  <div className="bg-muted/30 p-4 sm:p-5 flex items-center justify-end sm:border-l sm:h-full gap-2">
                    <Dialog open={issuingPolicy?.id === policy.id} onOpenChange={(open) => {
                      if (!open) setIssuingPolicy(null);
                      else setIssuingPolicy(policy);
                    }}>
                      <DialogTrigger asChild>
                        <Button variant="secondary" className="font-medium">
                          Segna emessa <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Emissione Polizza</DialogTitle>
                        </DialogHeader>
                        <Form {...issueForm}>
                          <form onSubmit={issueForm.handleSubmit(onIssueSubmit)} className="space-y-4">
                            <FormField
                              control={issueForm.control}
                              name="expiryDate"
                              render={({ field }) => (
                                <FormItem className="flex flex-col">
                                  <FormLabel>Imposta la data di scadenza finale</FormLabel>
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
                            <div className="flex justify-end pt-4">
                              <Button type="submit" disabled={!issueForm.watch("expiryDate")}>Conferma emissione</Button>
                            </div>
                          </form>
                        </Form>
                      </DialogContent>
                    </Dialog>
                    <Button variant="ghost" size="icon" onClick={() => setEditingPolicy(policy)} className="text-muted-foreground hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity" data-testid={`button-edit-policy-${policy.id}`}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => deletePolicy(policy.id)} className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-card border border-dashed rounded-lg text-muted-foreground">
            Nessuna polizza in attesa di emissione.
          </div>
        )}
      </div>

    </div>
  );
}
