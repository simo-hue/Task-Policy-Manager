import { useState, useEffect } from "react";
import { useClaims, Claim } from "@/lib/claims-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { CalendarIcon, Plus, Trash2, Pencil, AlertOctagon } from "lucide-react";
import { cn, parseLocalDate } from "@/lib/utils";

const claimSchema = z.object({
  clientName: z.string().min(1, "Il nome cliente è obbligatorio"),
  ramo: z.string().min(1, "Il ramo è obbligatorio"),
  openDate: z.date({
    required_error: "La data di apertura è obbligatoria",
  }),
  notes: z.string().optional(),
});

type ClaimFormValues = z.infer<typeof claimSchema>;

export function Sinistri() {
  const { claims, addClaim, updateClaim, deleteClaim } = useClaims();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingClaim, setEditingClaim] = useState<Claim | null>(null);

  const form = useForm<ClaimFormValues>({
    resolver: zodResolver(claimSchema),
    defaultValues: { clientName: "", ramo: "", notes: "" },
  });

  const editForm = useForm<ClaimFormValues>({
    resolver: zodResolver(claimSchema),
    defaultValues: { clientName: "", ramo: "", notes: "" },
  });

  useEffect(() => {
    if (editingClaim) {
      editForm.reset({
        clientName: editingClaim.clientName,
        ramo: editingClaim.ramo,
        openDate: parseLocalDate(editingClaim.openDate),
        notes: editingClaim.notes ?? "",
      });
    }
  }, [editingClaim, editForm]);

  function onSubmit(values: ClaimFormValues) {
    addClaim({
      clientName: values.clientName,
      ramo: values.ramo,
      openDate: format(values.openDate, "yyyy-MM-dd"),
      notes: values.notes || undefined,
    });
    setIsAddOpen(false);
    form.reset({ clientName: "", ramo: "", notes: "" });
  }

  function onEditSubmit(values: ClaimFormValues) {
    if (!editingClaim) return;
    updateClaim(editingClaim.id, {
      clientName: values.clientName,
      ramo: values.ramo,
      openDate: format(values.openDate, "yyyy-MM-dd"),
      notes: values.notes || undefined,
    });
    setEditingClaim(null);
  }

  const renderClaimFormFields = (f: typeof form) => (
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
        name="ramo"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Ramo</FormLabel>
            <FormControl>
              <Input placeholder="Es. RC Auto, Infortuni, Vita..." {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={f.control}
        name="openDate"
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel>Data di Apertura *</FormLabel>
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
      <FormField
        control={f.control}
        name="notes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Note / Descrizione</FormLabel>
            <FormControl>
              <Textarea placeholder="Dettagli sul sinistro..." {...field} />
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
          <div className="text-xs uppercase tracking-[0.18em] text-gold/90 font-semibold mb-2">Sinistri</div>
          <h1 className="text-3xl sm:text-4xl font-serif font-semibold text-primary mb-2 tracking-tight">Gestione Sinistri</h1>
          <p className="text-muted-foreground text-sm sm:text-base">Visualizza ed inserisci i sinistri aperti del portafoglio clienti.</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-claim">
              <Plus className="w-4 h-4 mr-2" />
              Nuovo sinistro
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Nuovo Sinistro</DialogTitle>
              <DialogDescription>Inserisci i dettagli del sinistro da aprire.</DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {renderClaimFormFields(form)}
                <div className="flex justify-end pt-4">
                  <Button type="submit">Salva sinistro</Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Dialog open={!!editingClaim} onOpenChange={(open) => { if (!open) setEditingClaim(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Modifica Sinistro</DialogTitle>
            <DialogDescription>Aggiorna le informazioni del sinistro.</DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
              {renderClaimFormFields(editForm)}
              <div className="flex justify-end pt-4">
                <Button type="submit" data-testid="button-save-edit-claim">Salva modifiche</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <div className="space-y-4">
        {claims.length > 0 ? (
          <div className="grid gap-3">
            {claims.map((claim) => (
              <Card key={claim.id} className="overflow-hidden group shadow-soft hover:shadow-card hover:border-primary/30 transition-all">
                <CardContent className="p-0 flex flex-col sm:flex-row sm:items-center">
                  <div className="p-5 flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-3 mb-2 flex-wrap">
                      <h3 className="font-semibold text-base sm:text-lg truncate flex items-center gap-2">
                        <AlertOctagon className="w-4 h-4 text-destructive shrink-0" />
                        {claim.clientName}
                      </h3>
                      <span className="inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-md bg-secondary text-secondary-foreground ring-1 ring-border whitespace-nowrap">
                        <CalendarIcon className="w-3 h-3 mr-1" />
                        Apertura: {format(parseLocalDate(claim.openDate), "d MMM yyyy", { locale: it })}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-muted-foreground text-sm flex-wrap">
                      <span className="bg-secondary px-2 py-0.5 rounded-md text-secondary-foreground font-medium text-xs">
                        {claim.ramo}
                      </span>
                      {claim.notes && <span className="truncate max-w-xl text-xs sm:text-sm">{claim.notes}</span>}
                    </div>
                  </div>
                  <div className="px-4 sm:px-5 pb-4 sm:py-5 flex items-center justify-end sm:border-l sm:h-full gap-1 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-within:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" onClick={() => setEditingClaim(claim)} className="text-muted-foreground hover:text-primary" data-testid={`button-edit-claim-${claim.id}`}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => deleteClaim(claim.id)} className="text-muted-foreground hover:text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="p-10 text-center bg-card/50 border border-dashed rounded-xl text-muted-foreground text-sm">
            Nessun sinistro inserito a sistema.
          </div>
        )}
      </div>
    </div>
  );
}
