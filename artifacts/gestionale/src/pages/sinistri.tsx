import { useState, useEffect } from "react";
import { useClaims, Claim } from "@/lib/claims-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { CalendarIcon, Plus, Trash2, Pencil, AlertOctagon, ArrowRight, Check, ChevronDown } from "lucide-react";
import { cn, parseLocalDate } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

const claimSchema = z.object({
  clientName: z.string().min(1, "Il nome cliente è obbligatorio"),
  ramo: z.string().min(1, "Il ramo è obbligatorio"),
  openDate: z.date({
    required_error: "La data di apertura è obbligatoria",
  }),
  notes: z.string().optional(),
  status: z.enum(["liquidato", "incaricato", "non_liquidato", "da_aprire"]).optional(),
});

type ClaimFormValues = z.infer<typeof claimSchema>;

export function Sinistri() {
  const { claims, addClaim, updateClaim, deleteClaim } = useClaims();
  const activeClaims = claims.filter(c => c.status !== "liquidato");

  const renderInteractiveBadge = (claim: Claim) => {
    const currentStatus = claim.status || "incaricato";

    const statusConfig = {
      da_aprire: {
        label: "Da aprire",
        className: "bg-violet-500/10 text-violet-600 border-violet-500/20 hover:bg-violet-500/20",
        dotColor: "bg-violet-500"
      },
      incaricato: {
        label: "Incaricato il perito",
        className: "bg-amber-500/10 text-amber-600 border-amber-500/20 hover:bg-amber-500/20",
        dotColor: "bg-amber-500"
      },
      non_liquidato: {
        label: "Non liquidato",
        className: "bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20",
        dotColor: "bg-destructive"
      },
      liquidato: {
        label: "Liquidato",
        className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/20",
        dotColor: "bg-emerald-500"
      }
    };

    const current = statusConfig[currentStatus] || statusConfig.incaricato;

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
            Cambia Stato Sinistro
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="my-1" />
          
          <DropdownMenuItem
            onClick={() => updateClaim(claim.id, { status: "da_aprire" })}
            className="flex items-center justify-between cursor-pointer rounded-md px-2 py-1.5 text-xs hover:bg-accent focus:bg-accent"
          >
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-violet-500 shrink-0" />
              <span>Da aprire</span>
            </div>
            {currentStatus === "da_aprire" && <Check className="w-3.5 h-3.5 text-primary shrink-0" />}
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => updateClaim(claim.id, { status: "incaricato" })}
            className="flex items-center justify-between cursor-pointer rounded-md px-2 py-1.5 text-xs hover:bg-accent focus:bg-accent"
          >
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
              <span>Incaricato il perito</span>
            </div>
            {currentStatus === "incaricato" && <Check className="w-3.5 h-3.5 text-primary shrink-0" />}
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => updateClaim(claim.id, { status: "non_liquidato" })}
            className="flex items-center justify-between cursor-pointer rounded-md px-2 py-1.5 text-xs hover:bg-accent focus:bg-accent"
          >
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-destructive shrink-0" />
              <span>Non liquidato</span>
            </div>
            {currentStatus === "non_liquidato" && <Check className="w-3.5 h-3.5 text-primary shrink-0" />}
          </DropdownMenuItem>

          <DropdownMenuSeparator className="my-1" />

          <DropdownMenuItem
            onClick={() => setLiquidatingClaim(claim)}
            className="flex items-center justify-between cursor-pointer text-emerald-600 dark:text-emerald-400 rounded-md px-2 py-1.5 text-xs hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 focus:bg-emerald-50/50 focus:text-emerald-700"
          >
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
              <span className="font-semibold">Liquidato (Archivia)</span>
            </div>
            {currentStatus === "liquidato" && <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingClaim, setEditingClaim] = useState<Claim | null>(null);
  const [liquidatingClaim, setLiquidatingClaim] = useState<Claim | null>(null);

  const form = useForm<ClaimFormValues>({
    resolver: zodResolver(claimSchema),
    defaultValues: { clientName: "", ramo: "", notes: "", status: "incaricato" },
  });

  const editForm = useForm<ClaimFormValues>({
    resolver: zodResolver(claimSchema),
    defaultValues: { clientName: "", ramo: "", notes: "", status: "incaricato" },
  });

  useEffect(() => {
    if (editingClaim) {
      editForm.reset({
        clientName: editingClaim.clientName,
        ramo: editingClaim.ramo,
        openDate: parseLocalDate(editingClaim.openDate),
        notes: editingClaim.notes ?? "",
        status: editingClaim.status ?? "incaricato",
      });
    }
  }, [editingClaim, editForm]);

  function onSubmit(values: ClaimFormValues) {
    addClaim({
      clientName: values.clientName,
      ramo: values.ramo,
      openDate: format(values.openDate, "yyyy-MM-dd"),
      notes: values.notes || undefined,
      status: values.status || "incaricato",
    });
    setIsAddOpen(false);
    form.reset({ clientName: "", ramo: "", notes: "", status: "incaricato" });
  }

  function onEditSubmit(values: ClaimFormValues) {
    if (!editingClaim) return;
    updateClaim(editingClaim.id, {
      clientName: values.clientName,
      ramo: values.ramo,
      openDate: format(values.openDate, "yyyy-MM-dd"),
      notes: values.notes || undefined,
      status: values.status || "incaricato",
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
              <div className="relative">
                <Input placeholder="Es. RC Auto, Infortuni, Vita..." list="claim-ramo-types" {...field} />
                <datalist id="claim-ramo-types">
                  <option value="RC Auto" />
                  <option value="Infortuni" />
                  <option value="Vita" />
                  <option value="Incendio e Scoppio" />
                  <option value="Responsabilità Civile" />
                  <option value="Tutela Legale" />
                  <option value="Salute e Malattia" />
                  <option value="Fideiussioni e Cauzioni" />
                  <option value="Altri Danni ai Beni" />
                </datalist>
              </div>
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
        name="status"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Stato Sinistro</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona stato" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="da_aprire">Da aprire</SelectItem>
                <SelectItem value="liquidato">Liquidato</SelectItem>
                <SelectItem value="incaricato">Incaricato il perito</SelectItem>
                <SelectItem value="non_liquidato">Non liquidato</SelectItem>
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
        {activeClaims.length > 0 ? (
          <div className="grid gap-3">
            {activeClaims.map((claim) => (
              <Card key={claim.id} className="overflow-hidden group shadow-soft hover:shadow-card hover:border-primary/30 transition-all">
                <CardContent className="p-0 flex flex-col sm:flex-row sm:items-center">
                  <div className="p-5 flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-3 mb-2 flex-wrap">
                      <h3 className="font-semibold text-base sm:text-lg flex items-center gap-2 flex-wrap min-w-0">
                        <AlertOctagon className="w-4 h-4 text-destructive shrink-0" />
                        <span className="truncate">{claim.clientName}</span>
                        {renderInteractiveBadge(claim)}
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
                  <div className="px-4 sm:px-5 pb-4 sm:py-5 flex items-center justify-end sm:border-l sm:h-full gap-2 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-within:opacity-100 transition-opacity">
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      className="font-medium text-xs gap-1.5 h-8 hover:bg-emerald-500/10 hover:text-emerald-600 hover:border-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                      onClick={() => setLiquidatingClaim(claim)}
                    >
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      Segna liquidato
                    </Button>

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
            Nessun sinistro attivo a sistema.
          </div>
        )}
      </div>

      <Dialog open={!!liquidatingClaim} onOpenChange={(open) => { if (!open) setLiquidatingClaim(null); }}>
        <DialogContent className="max-w-md border-border/80 shadow-elevated">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl font-semibold text-primary mb-1 flex items-center gap-2">
              <Check className="w-5 h-5 text-emerald-500" />
              Conferma Liquidazione
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-sm leading-relaxed">
              Sei sicuro di voler segnare il sinistro di <strong className="text-foreground">{liquidatingClaim?.clientName}</strong> come liquidato? Verrà archiviato e rimosso dall'elenco.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 pt-5">
            <Button variant="outline" onClick={() => setLiquidatingClaim(null)}>
              Annulla
            </Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-soft border-0 transition-colors"
              onClick={() => {
                if (liquidatingClaim) {
                  updateClaim(liquidatingClaim.id, { status: "liquidato" });
                  setLiquidatingClaim(null);
                }
              }}
            >
              Conferma
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
