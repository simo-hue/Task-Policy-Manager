import React, { useState, useEffect } from "react";
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
import { CalendarIcon, Plus, Trash2, Pencil, AlertOctagon, ArrowRight, Check, ChevronDown, MessageSquare } from "lucide-react";
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
  openDate: z.date().optional(),
  notes: z.string().optional(),
  status: z.enum(["liquidato", "incaricato", "visita_medico_legale", "da_aprire", "aperto"]).optional(),
});

type ClaimFormValues = z.infer<typeof claimSchema>;

export function Sinistri() {
  const { claims, addClaim, updateClaim, deleteClaim } = useClaims();
  const activeClaims = claims
    .filter(c => c.status !== "liquidato")
    .sort((a, b) => {
      const statusOrder: Record<string, number> = { da_aprire: 1, aperto: 2, incaricato: 3, visita_medico_legale: 4 };
      const statusA = statusOrder[a.status || "incaricato"] || 99;
      const statusB = statusOrder[b.status || "incaricato"] || 99;
      if (statusA !== statusB) return statusA - statusB;

      if (!a.openDate && !b.openDate) return 0;
      if (!a.openDate) return 1;
      if (!b.openDate) return -1;
      return new Date(a.openDate).getTime() - new Date(b.openDate).getTime();
    });


  const renderInteractiveBadge = (claim: Claim) => {
    const currentStatus = claim.status || "incaricato";

    const statusConfig = {
      da_aprire: {
        label: "Da aprire",
        className: "bg-violet-500/10 text-violet-600 border-violet-500/20 hover:bg-violet-500/20",
        dotColor: "bg-violet-500"
      },
      aperto: {
        label: "Aperto",
        className: "bg-blue-500/10 text-blue-600 border-blue-500/20 hover:bg-blue-500/20",
        dotColor: "bg-blue-500"
      },
      incaricato: {
        label: "Incaricato il perito",
        className: "bg-amber-500/10 text-amber-600 border-amber-500/20 hover:bg-amber-500/20",
        dotColor: "bg-amber-500"
      },
      visita_medico_legale: {
        label: "Visita Medico Legale",
        className: "bg-rose-500/10 text-rose-600 border-rose-500/20 hover:bg-rose-500/20",
        dotColor: "bg-rose-500"
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
            onClick={() => {
              const patch: any = { status: "da_aprire", openDate: null };
              updateClaim(claim.id, patch);
            }}
            className="flex items-center justify-between cursor-pointer rounded-md px-2 py-1.5 text-xs hover:bg-accent focus:bg-accent"
          >
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-violet-500 shrink-0" />
              <span>Da aprire</span>
            </div>
            {currentStatus === "da_aprire" && <Check className="w-3.5 h-3.5 text-primary shrink-0" />}
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => {
              const patch: any = { status: "aperto" };
              if (currentStatus === "da_aprire" && !claim.openDate) {
                patch.openDate = format(new Date(), "yyyy-MM-dd");
              }
              updateClaim(claim.id, patch);
            }}
            className="flex items-center justify-between cursor-pointer rounded-md px-2 py-1.5 text-xs hover:bg-accent focus:bg-accent"
          >
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0" />
              <span>Aperto</span>
            </div>
            {currentStatus === "aperto" && <Check className="w-3.5 h-3.5 text-primary shrink-0" />}
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => {
              const patch: any = { status: "incaricato" };
              if (currentStatus === "da_aprire" && !claim.openDate) {
                patch.openDate = format(new Date(), "yyyy-MM-dd");
              }
              updateClaim(claim.id, patch);
            }}
            className="flex items-center justify-between cursor-pointer rounded-md px-2 py-1.5 text-xs hover:bg-accent focus:bg-accent"
          >
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
              <span>Incaricato il perito</span>
            </div>
            {currentStatus === "incaricato" && <Check className="w-3.5 h-3.5 text-primary shrink-0" />}
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => {
              const patch: any = { status: "visita_medico_legale" };
              if (currentStatus === "da_aprire" && !claim.openDate) {
                patch.openDate = format(new Date(), "yyyy-MM-dd");
              }
              updateClaim(claim.id, patch);
            }}
            className="flex items-center justify-between cursor-pointer rounded-md px-2 py-1.5 text-xs hover:bg-accent focus:bg-accent"
          >
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
              <span>Visita Medico Legale</span>
            </div>
            {currentStatus === "visita_medico_legale" && <Check className="w-3.5 h-3.5 text-primary shrink-0" />}
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

  const [editingClaim, setEditingClaim] = useState<Claim | null>(null);
  const [liquidatingClaim, setLiquidatingClaim] = useState<Claim | null>(null);
  const [deletingClaim, setDeletingClaim] = useState<Claim | null>(null);
  const [editingNoteClaim, setEditingNoteClaim] = useState<Claim | null>(null);
  const [quickDate, setQuickDate] = useState<Date | undefined>(new Date());
  const [quickRamo, setQuickRamo] = useState<string>("");
  const [quickStatus, setQuickStatus] = useState<Claim["status"]>("da_aprire");
  const [quickDatePopoverOpen, setQuickDatePopoverOpen] = useState(false);
  const [editDatePopoverOpen, setEditDatePopoverOpen] = useState(false);
  const [selectedRamo, setSelectedRamo] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<Claim["status"] | null>(null);

  const uniqueRami = Array.from(new Set(activeClaims.map(c => c.ramo))).sort();
  const effectiveSelectedRamo = selectedRamo && uniqueRami.includes(selectedRamo) ? selectedRamo : (uniqueRami[0] || null);
  
  const filteredClaims = activeClaims.filter(c => {
    const matchRamo = effectiveSelectedRamo ? c.ramo === effectiveSelectedRamo : true;
    const matchStatus = selectedStatus === null ? true : c.status === selectedStatus;
    return matchRamo && matchStatus;
  });

  const statusOptions: { value: Claim["status"], label: string }[] = [
    { value: "da_aprire", label: "Da aprire" },
    { value: "aperto", label: "Aperto" },
    { value: "incaricato", label: "Incaricato perito" },
    { value: "visita_medico_legale", label: "Visita Medico Legale" }
  ];

  const editForm = useForm<ClaimFormValues>({
    resolver: zodResolver(claimSchema),
    defaultValues: { clientName: "", ramo: "", notes: "", status: "da_aprire" },
  });

  useEffect(() => {
    if (editingClaim) {
      editForm.reset({
        clientName: editingClaim.clientName,
        ramo: editingClaim.ramo,
        openDate: editingClaim.openDate ? parseLocalDate(editingClaim.openDate) : undefined,
        notes: editingClaim.notes ?? "",
        status: editingClaim.status ?? "da_aprire",
      });
    }
  }, [editingClaim, editForm]);

  const renderQuickAdd = () => (
    <div className="fixed md:static bottom-[calc(48px+env(safe-area-inset-bottom))] md:bottom-auto left-0 right-0 px-4 md:px-0 z-40 pt-6 pb-0 md:py-0 bg-gradient-to-t from-background via-background/95 to-transparent md:bg-none pointer-events-none md:pointer-events-auto">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const target = e.target as HTMLFormElement;
          const nameInput = target.elements.namedItem("quickName") as HTMLInputElement;
          const clientName = nameInput.value.trim();
          const notesInput = target.elements.namedItem("quickNotes") as HTMLInputElement;
          const notes = notesInput.value.trim();

          const isDaAprire = quickStatus === "da_aprire";
          if (clientName && quickRamo && (isDaAprire || quickDate)) {
            addClaim({
              clientName,
              ramo: quickRamo,
              status: quickStatus || "da_aprire",
              openDate: isDaAprire ? undefined : (quickDate ? format(quickDate, 'yyyy-MM-dd') : undefined),
              notes: notes || ""
            });
            nameInput.value = "";
            notesInput.value = "";
            setQuickRamo("");
            setQuickDate(new Date());
            setQuickStatus("da_aprire");
          }
        }}
        className="pointer-events-auto flex flex-col md:flex-row gap-2 bg-card/95 md:bg-card backdrop-blur-md md:backdrop-blur-none p-2 rounded-2xl border border-border/60 shadow-elevated md:shadow-sm transition-all max-w-7xl mx-auto"
      >
        <div className="flex gap-1.5 w-full md:w-auto md:flex-1">
          <div className="flex-1 relative">
            <Plus className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              name="quickName"
              placeholder="Nome cliente..."
              className="pl-8 h-10 border-0 bg-secondary/50 focus-visible:ring-1 focus-visible:ring-primary/30 rounded-xl w-full"
              autoComplete="off"
              required
            />
          </div>
          <Button
            type="submit"
            size="sm"
            className="md:hidden font-medium shrink-0 h-10 px-4 rounded-xl"
            disabled={quickStatus === "da_aprire" ? !quickRamo : (!quickDate || !quickRamo)}
          >
            Salva
          </Button>
        </div>

        <div className="grid grid-cols-2 md:flex gap-1.5 w-full md:w-auto">
          <Select value={quickStatus} onValueChange={(val: any) => setQuickStatus(val)}>
            <SelectTrigger className="h-10 md:w-[130px] border-0 bg-secondary/50 focus:ring-1 focus:ring-primary/30 rounded-xl text-xs sm:text-sm font-medium w-full">
              <SelectValue placeholder="Stato" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="da_aprire">Da aprire</SelectItem>
              <SelectItem value="aperto">Aperto</SelectItem>
              <SelectItem value="incaricato">Incaricato</SelectItem>
              <SelectItem value="visita_medico_legale">Visita Medica</SelectItem>
            </SelectContent>
          </Select>

          {quickStatus === "da_aprire" ? (
            <Button disabled variant="outline" className="h-10 w-full md:w-[120px] px-3 bg-secondary/50 border-0 text-xs sm:text-sm rounded-xl justify-start font-normal opacity-50">
              <CalendarIcon className="mr-2 h-3.5 w-3.5 shrink-0" />
              <span className="truncate">Da definire</span>
            </Button>
          ) : (
            <Popover open={quickDatePopoverOpen} onOpenChange={setQuickDatePopoverOpen}>
              <PopoverTrigger asChild>
                <Button variant={"secondary"} className={cn("h-10 w-full md:w-[120px] px-3 bg-secondary/50 font-normal border-0 text-xs sm:text-sm rounded-xl justify-start", !quickDate && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-3.5 w-3.5 opacity-50 shrink-0" />
                  <span className="truncate">{quickDate ? format(quickDate, "d MMM", { locale: it }) : "Data"}</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 border-none bg-transparent shadow-none" align="start">
                <Calendar
                  mode="single"
                  selected={quickDate}
                  onSelect={(date) => {
                    setQuickDate(date);
                    setQuickDatePopoverOpen(false);
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          )}
        </div>

        <div className="flex gap-1.5 w-full md:w-auto md:flex-1">
          <div className="relative shrink-0">
            <Select value={quickRamo} onValueChange={setQuickRamo}>
              <SelectTrigger className="h-10 w-[105px] md:w-[130px] border-0 bg-secondary/50 focus:ring-1 focus:ring-primary/30 rounded-xl text-xs sm:text-sm font-medium">
                <SelectValue placeholder="Ramo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="RC Auto">RC Auto</SelectItem>
                <SelectItem value="Infortuni">Infortuni</SelectItem>
                <SelectItem value="Vita">Vita</SelectItem>
                <SelectItem value="Incendio">Incendio</SelectItem>
                <SelectItem value="Furto">Furto</SelectItem>
                <SelectItem value="Responsabilità Civile">RC</SelectItem>
                <SelectItem value="Tutela Legale">Tutela Legale</SelectItem>
                <SelectItem value="Salute e Malattia">Malattia</SelectItem>
                <SelectItem value="Fideiussioni e Cauzioni">Cauzioni</SelectItem>
                <SelectItem value="Altri Danni ai Beni">Altri Danni</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="relative flex-1">
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
          disabled={quickStatus === "da_aprire" ? !quickRamo : (!quickDate || !quickRamo)}
        >
          Aggiungi
        </Button>
      </form>
    </div>
  );

  function onEditSubmit(values: ClaimFormValues) {
    if (!editingClaim) return;
    const isDaAprire = values.status === "da_aprire";
    const wasDaAprire = editingClaim.status === "da_aprire";
    let newOpenDate = editingClaim.openDate;

    if (isDaAprire) {
      newOpenDate = undefined;
    } else if (values.openDate) {
      newOpenDate = format(values.openDate, "yyyy-MM-dd");
    } else if (wasDaAprire) {
      newOpenDate = format(new Date(), "yyyy-MM-dd");
    }

    updateClaim(editingClaim.id, {
      clientName: values.clientName,
      ramo: values.ramo,
      openDate: newOpenDate,
      notes: values.notes ?? "",
      status: values.status || "da_aprire",
    });
    setEditingClaim(null);
  }

  const renderClaimFormFields = (f: typeof editForm) => {
    const status = f.watch("status");
    return (
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
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona ramo" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="RC Auto">RC Auto</SelectItem>
                  <SelectItem value="Infortuni">Infortuni</SelectItem>
                  <SelectItem value="Vita">Vita</SelectItem>
                  <SelectItem value="Incendio">Incendio</SelectItem>
                  <SelectItem value="Furto">Furto</SelectItem>
                  <SelectItem value="Responsabilità Civile">Responsabilità Civile</SelectItem>
                  <SelectItem value="Tutela Legale">Tutela Legale</SelectItem>
                  <SelectItem value="Salute e Malattia">Salute e Malattia</SelectItem>
                  <SelectItem value="Fideiussioni e Cauzioni">Fideiussioni e Cauzioni</SelectItem>
                  <SelectItem value="Altri Danni ai Beni">Altri Danni ai Beni</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        {status !== "da_aprire" && (
          <FormField
            control={f.control}
            name="openDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Data di Apertura *</FormLabel>
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
                        setEditDatePopoverOpen(false);
                      }}
                      disabled={() => false}
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
                  <SelectItem value="aperto">Aperto</SelectItem>
                  <SelectItem value="incaricato">Incaricato perito</SelectItem>
                  <SelectItem value="visita_medico_legale">Visita Medico Legale</SelectItem>
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
  };

  return (
    <div className="space-y-6 sm:space-y-12 pb-32 md:pb-0 relative min-h-[calc(100vh-6rem)] flex flex-col">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="min-w-0">
          <div className="text-xs uppercase tracking-[0.18em] text-gold/90 font-semibold mb-2">Sinistri</div>
          <h1 className="text-2xl sm:text-4xl font-serif font-semibold text-primary mb-1 sm:mb-2 tracking-tight">Gestione Sinistri</h1>
          <p className="text-muted-foreground text-sm sm:text-base">Visualizza ed inserisci i sinistri aperti del portafoglio clienti.</p>
        </div>
      </div>

      {renderQuickAdd()}

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

      <div className="space-y-4 flex-1">
        {uniqueRami.length > 0 && (
          <div className="flex justify-center w-full mb-3">
            <div className="relative p-1.5 inline-flex flex-wrap justify-center gap-1.5 items-center bg-muted/30 backdrop-blur-lg border border-border/50 rounded-2xl shadow-inner">
            {uniqueRami.map((ramo) => {
              const isSelected = effectiveSelectedRamo === ramo;
              return (
                <button
                  key={ramo}
                  onClick={() => setSelectedRamo(ramo)}
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
                  {ramo}
                </button>
              );
            })}
            </div>
          </div>
        )}

        {uniqueRami.length > 0 && (
          <div className="flex justify-center w-full mb-6">
            <div className="relative p-1 inline-flex flex-wrap justify-center gap-1 items-center bg-muted/20 backdrop-blur-md border border-border/40 rounded-xl shadow-sm">
              {statusOptions.map((status) => {
                const isSelected = selectedStatus === status.value;
                const claimsForRamo = effectiveSelectedRamo ? activeClaims.filter(c => c.ramo === effectiveSelectedRamo) : activeClaims;
                const count = claimsForRamo.filter(c => c.status === status.value).length;
                const isEmpty = count === 0;

                return (
                  <button
                    key={status.value}
                    onClick={() => setSelectedStatus(isSelected ? null : status.value)}
                    className={cn(
                      "relative px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-300 ease-out outline-none select-none",
                      isSelected
                        ? "text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-background/40",
                      isEmpty && !isSelected && "opacity-40 hover:opacity-60 saturate-50"
                    )}
                  >
                    {isSelected && (
                      <span className="absolute inset-0 bg-background border border-border/80 rounded-lg shadow-sm -z-10" />
                    )}
                    {status.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {filteredClaims.length > 0 ? (
          <div className="grid gap-3">
            {filteredClaims.map((claim, index) => {
              const statusLabels: Record<string, string> = {
                da_aprire: "DA APRIRE",
                aperto: "APERTO",
                incaricato: "INCARICATO PERITO",
                visita_medico_legale: "VISITA MEDICO LEGALE",
                liquidato: "LIQUIDATO"
              };
              
              const currentStatus = claim.status || "incaricato";
              const currentStatusLabel = statusLabels[currentStatus] || "INCARICATO PERITO";
              const currentDateKey = claim.openDate ? format(parseLocalDate(claim.openDate), "d MMMM yyyy", { locale: it }).toUpperCase() : "DA DEFINIRE";
              
              const groupKey = `${currentStatusLabel} - ${currentDateKey}`;
              
              let showSeparator = false;
              if (index === 0) {
                showSeparator = true;
              } else {
                const prevClaim = filteredClaims[index - 1];
                const prevStatus = prevClaim.status || "incaricato";
                const prevStatusLabel = statusLabels[prevStatus] || "INCARICATO PERITO";
                const prevDateKey = prevClaim.openDate ? format(parseLocalDate(prevClaim.openDate), "d MMMM yyyy", { locale: it }).toUpperCase() : "DA DEFINIRE";
                const prevGroupKey = `${prevStatusLabel} - ${prevDateKey}`;
                showSeparator = groupKey !== prevGroupKey;
              }

              return (
                <React.Fragment key={claim.id}>
                  {showSeparator && (
                    <div className={cn("relative flex items-center pb-2", index !== 0 && "pt-6")}>
                      <div className="flex-grow border-t border-border/60"></div>
                      <span className="mx-4 text-xs font-semibold tracking-[0.18em] text-primary/80 uppercase text-center">
                        {groupKey}
                      </span>
                      <div className="flex-grow border-t border-border/60"></div>
                    </div>
                  )}
                  <Card className="overflow-hidden group shadow-soft hover:shadow-card hover:border-primary/30 transition-all">
                    <CardContent className="p-0 flex flex-col sm:flex-row sm:items-center">
                      <div className="p-3 sm:p-5 flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-3 mb-2 flex-wrap">
                          <h3 className="font-semibold text-base sm:text-lg flex items-center gap-2 flex-wrap min-w-0">
                            <AlertOctagon className="w-4 h-4 text-destructive shrink-0" />
                            <span className="truncate max-w-[180px] sm:max-w-xs">{claim.clientName}</span>
                            {renderInteractiveBadge(claim)}
                          </h3>
                        </div>
                    {claim.notes && (
                      <div className="flex items-center gap-3 text-muted-foreground text-sm flex-wrap">
                        <span className="truncate max-w-xl text-xs sm:text-sm">{claim.notes}</span>
                      </div>
                    )}
                  </div>
                  <div className="px-3 sm:px-5 pb-3 sm:py-5 flex items-center justify-end sm:border-l sm:h-full gap-1.5 sm:gap-2 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-within:opacity-100 transition-opacity flex-wrap">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="font-medium text-xs gap-1.5 h-8 hover:bg-emerald-500/10 hover:text-emerald-600 hover:border-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                      onClick={() => setLiquidatingClaim(claim)}
                    >
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      Segna liquidato
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn("hover:text-primary", claim.notes ? "text-primary" : "text-muted-foreground")}
                      onClick={() => setEditingNoteClaim(claim)}
                      title="Aggiungi o modifica nota"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setEditingClaim(claim)} className="text-muted-foreground hover:text-primary" data-testid={`button-edit-claim-${claim.id}`}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setDeletingClaim(claim)} className="text-muted-foreground hover:text-destructive">
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
                  deleteClaim(liquidatingClaim.id);
                  setLiquidatingClaim(null);
                }
              }}
            >
              Conferma
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deletingClaim} onOpenChange={(open) => { if (!open) setDeletingClaim(null); }}>
        <DialogContent className="max-w-md border-border/80 shadow-elevated">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl font-semibold text-destructive mb-1 flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-destructive" />
              Conferma Eliminazione
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-sm leading-relaxed">
              Sei sicuro di voler eliminare definitivamente il sinistro di <strong className="text-foreground">{deletingClaim?.clientName}</strong>? Questa azione è irreversibile.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 pt-5">
            <Button variant="outline" onClick={() => setDeletingClaim(null)}>
              Annulla
            </Button>
            <Button
              variant="destructive"
              className="font-medium shadow-soft border-0 transition-colors"
              onClick={() => {
                if (deletingClaim) {
                  deleteClaim(deletingClaim.id);
                  setDeletingClaim(null);
                }
              }}
            >
              Elimina
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingNoteClaim} onOpenChange={(open) => { if (!open) setEditingNoteClaim(null); }}>
        <DialogContent className="max-w-md border-border/80 shadow-elevated">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl font-semibold text-primary mb-1 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" />
              Note Sinistro
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            if (editingNoteClaim) {
              const formData = new FormData(e.currentTarget);
              const notes = formData.get("notes") as string;
              updateClaim(editingNoteClaim.id, { notes: notes || "" });
              setEditingNoteClaim(null);
            }
          }}>
            <div className="pt-4 pb-6">
              <Textarea
                name="notes"
                defaultValue={editingNoteClaim?.notes || ""}
                placeholder="Scrivi qui i tuoi appunti, dettagli o numeri di telefono..."
                className="min-h-[120px] resize-y"
                autoFocus
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setEditingNoteClaim(null)}>
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
