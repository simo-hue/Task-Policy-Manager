# Repository Documentation

## Change Log

### [2026-05-21 21:33]: UI Renaming & Simplified Policy Emission Logic
* *Details*: Renamed various Italian labels to better align with business needs (e.g. "Attività" to "Da Fare", "Attività in ritardo" to "In Sospeso", threshold-based deadlines to "Scadenze senza nessun timeframe", and "Da emettere" to "Sinistri"). Modified the "Segna emessa" emission flow on the policies page to directly mark a policy as issued and archive it (making it disappear) via a simple confirmation popup without asking for an expiry date.
* *Tech Notes*:
  - Modified `shell.tsx` (sidebar nav labels).
  - Modified `dashboard.tsx` (statCard titles, hints).
  - Modified `attivita.tsx` (heading titles).
  - Modified `polizze.tsx` (tabs, forms, dropdown items, empty states, and replacing the expiration date picker with a direct `updatePolicy` confirmation dialog). Removed obsolete `issueSchema`, `issueForm`, and `onIssueSubmit` declarations.

### [2026-05-21 21:36]: Duplicazione Fisica delle Polizze (Personali e Agenzia)
* *Details*: Duplicated the unified policy management page into two physically separate pages (Polizze Personali and Polizze Agenzia) to allow future independent customizations. Rewrote the policy store to export separate hook modules (`usePoliciesPersonali` and `usePoliciesAgenzia`), persisting to separate local storage keys (`gestionale.policies.personali.v1` and `gestionale.policies.agenzia.v1`). Updated the dashboard to aggregate operational stats from both stores and dynamically route the upcoming policy links to the correct sub-page based on scope.
* *Tech Notes*:
  - Modified `policies-store.ts` to export two distinct react hooks (`usePoliciesPersonali` and `usePoliciesAgenzia`).
  - Created `polizze-personali.tsx` utilizing `usePoliciesPersonali` store.
  - Created `polizze-agenzia.tsx` utilizing `usePoliciesAgenzia` store.
  - Removed old unified `polizze.tsx` file.
  - Modified `shell.tsx` to display separate navigation items for "Polizze Personali" and "Polizze Agenzia".
  - Modified `App.tsx` routes to map both new components.
  - Modified `dashboard.tsx` to aggregate policies list and dynamically tag scope, enabling context-aware navigation and separate quick actions.

### [2026-05-21 21:38]: Badge "Da Mettere a cassa" nelle Polizze Personali
* *Details*: Added a toggleable "Da Mettere a cassa" (To be cashiered) attribute specifically for personal policies. Added form integration in the creation/edit forms and rendered a beautiful badge near the client name in both "In Scadenza" and "Sinistri" tabs.
* *Tech Notes*:
  - Modified `policies-store.ts` to include optional `daMettereACassa` in the `Policy` interface.
  - Modified `polizze-personali.tsx` to include `daMettereACassa` in the form validation schema, reset the form state correctly, add the checkbox in the policy form fields (prior to the notes field), and render a customized `<Badge>` next to the client's name in both list elements.
  - Added necessary `Badge` import from `@/components/ui/badge` to resolve TypeScript build errors.

### [2026-05-21 21:40]: Nuova Pagina Gestione Sinistri
* *Details*: Created a dedicated "Sinistri" (Claims) module in the application with fully fledged claim management features, including a list displaying the client's name, date of opening, and line of business (ramo), alongside full CRUD support.
* *Tech Notes*:
  - Created `claims-store.ts` in `src/lib/` using standard localStorage hooks (`gestionale.claims.v1`).
  - Created `sinistri.tsx` in `src/pages/` featuring interactive dialog creation/edit forms, Zod schema validations, popover date pickers, and claim management cards.
  - Registered route `/sinistri` in `App.tsx` and updated the primary layout/sidebar in `shell.tsx` to display a navigation entry with `AlertOctagon` icon.

### [2026-05-21 21:41]: Abilitazione Piattaforma macOS ed Avvio Server
* *Details*: Enabled the download of macOS specific binary modules (`darwin-arm64` and `darwin-x64`) for local development, and launched the Vite development server using environment parameters on port `5173`.
* *Tech Notes*:
  - Modified `pnpm-workspace.yaml` overrides to comment out the exclusions for `@rollup/rollup-darwin-*`, `@esbuild/darwin-*`, `lightningcss-darwin-*`, `@tailwindcss/oxide-darwin-*`, and `@expo/ngrok-bin-darwin-*`.
  - Re-installed dependencies with `pnpm install --ignore-scripts` to bypass Replit specific user-agent restrictions.
  - Started Vite server using `PORT=5173 BASE_PATH=/ npx vite --config vite.config.ts --host 0.0.0.0` in the `artifacts/gestionale` directory.
  - Created `comandi_avvio.md` detailing these commands.


### [2026-05-21 21:46]: Ripristino Etichetta "Da emettere" nelle Polizze
* *Details*: Restored the "Da emettere" (To be issued) terminology on both "Polizze Personali" and "Polizze Agenzia" pages, replacing "Sinistri" to avoid confusion now that a dedicated "Sinistri" (Claims) module page has been introduced.
* *Tech Notes*:
  - Modified `polizze-personali.tsx` to revert the tab trigger label, form dropdown option, and empty state message to "Da emettere" / "Nessuna polizza da emettere."
  - Modified `polizze-agenzia.tsx` to revert the tab trigger label, form dropdown option, and empty state message to "Da emettere" / "Nessuna polizza da emettere."

### [2026-05-21 21:48]: Stato e Badge per i Sinistri
* *Details*: Added an interactive state assignment system for client claims, allowing adjusters to mark claims as "Liquidato", "Incaricato il perito", or "Non liquidato" with color-coded badges indicating claim lifecycle status.
* *Tech Notes*:
  - Modified `claims-store.ts` to support the new optional `status` attribute and pre-configured initial claims with statuses.
  - Modified `sinistri.tsx` to integrate Zod enum, default react-hook-form values, Select components from `@/components/ui/select`, and elegant HSL-derived Tailwind color badges for list items.

### [2026-05-21 21:50]: Collegamento e Integrazione Box Sinistri in Dashboard
* *Details*: Connected the "Sinistri" stat card widget on the main dashboard directly to the dedicated claims management page (`/sinistri`), and modified it to show the count of actual active claims instead of draft policies.
* *Tech Notes*:
  - Modified `dashboard.tsx` to import `useClaims` and retrieve the claims count.
  - Re-mapped the "Sinistri" statistic card (`statCards`) with `href: "/sinistri"`, `value: claims.length`, `icon: AlertOctagon`, and updated description hint to `"sinistri aperti"`.

### [2026-05-21 21:51]: Aggiunta Stato "Da aprire" ai Sinistri
* *Details*: Added a fourth status option "Da aprire" (To be opened) to the claims module. It displays as a grey slate badge next to the client name, is fully selectable inside creation/edit dialogs, and includes a representative initial mock claim.
* *Tech Notes*:
  - Modified `claims-store.ts` to add `'da_aprire'` to the `status` type definition and configured a third initial mock claim.
  - Modified `sinistri.tsx` to add `"da_aprire"` to the Zod validation schema, insert it as the first SelectItem option, and render a dedicated `<Badge>` with slate tones.

### [2026-05-21 21:52]: Archiviazione Sinistri tramite Stato "Liquidato"
* *Details*: Enabled claims to be marked as "Liquidato" directly from their card in the "Sinistri" page. When confirmed, claims are archived/hidden from the active lists to keep the active workspace clean, similar to the tasks workflow. Updated both the claim list rendering and the main dashboard counts to display only active (non-settled) claims.
* *Tech Notes*:
  - Modified `sinistri.tsx` to render only active claims (`status !== "liquidato"`). Added a quick-action "Segna liquidato" button inside each claim card with a modal confirmation dialog that updates the claim's status in LocalStorage.
  - Modified `dashboard.tsx` to filter out settled claims from the dashboard statistical counts, ensuring consistency across all visual metric panels.

### [2026-05-21 21:54]: Assegnazione Rapida e Diretta dei Badge di Stato dei Sinistri
* *Details*: Replaced static claim status badges in the `sinistri.tsx` list with an elegant, interactive dropdown menu triggering system. Adjusters can now click directly on any claim's status badge to instantly update its status without having to open the edit dialog, maximizing efficiency and providing a fluid, modern user experience. Selecting "Liquidato" from the dropdown opens a confirmation prompt to prevent accidental archiving.
* *Tech Notes*:
  - Modified `sinistri.tsx` to import Radix-based `DropdownMenu` components and the Lucide `ChevronDown` icon.
  - Implemented the `renderInteractiveBadge` helper inside `Sinistri` which wraps the status badge in a `DropdownMenuTrigger` (with pointer cursor, hover effects, scale animations, and a small downward indicator icon).
  - Wired `DropdownMenuItem` select options for all four claims lifecycle states to directly invoke the `updateClaim` state handler.

### [2026-05-21 21:57]: Risoluzione Taglio Netto del Layout sui Badge (Truncate/Flex Conflict)
* *Details*: Fixed a layout truncation bug causing interactive status badges to get cut off on the left (e.g. only displaying "TO" instead of "INCARICATO IL PERITO"). The layout issue stemmed from combining the `truncate` class (which enforces `overflow: hidden` and `white-space: nowrap`) directly on the `<h3>` flex container, forcing the entire row to truncate brutally. Fixed this by isolating the `truncate` style onto the client name `<span>` itself and allowing the flex header to calculate dimensions and flex/wrap properly. Applied this exact layout fix to both the Claims page (`sinistri.tsx`) and the Personal Policies page (`polizze-personali.tsx`) list components.
* *Tech Notes*:
  - Modified `sinistri.tsx` (removed `truncate` from the list card `<h3>` and applied it to the client name span).
  - Modified `polizze-personali.tsx` (removed `truncate` from both in-scadenza and da-emettere lists `<h3>` and isolated it onto the respective client name spans).

### [2026-05-21 22:00]: Suggerimenti Rapidi per Tipi di Polizza e Rami dei Sinistri
* *Details*: Added client-side dropdown suggestions (using native HTML `<datalist>`) for policy types ("tipo di polizza") on both personal and agency policy management screens, and for the claim category/line of business ("Ramo") on the claims management screen. This eliminates the need for manual text-only typing for common categories while maintaining custom text input support.
* *Tech Notes*:
  - Modified `polizze-personali.tsx` to bind a datalist containing common personal policy types ("RC Auto Personale", "Infortuni Personale", "Casa e Fabbricato", "Vita", "Salute e Sanitaria", "Tutela Legale", "Viaggio", "Fideiussione") to the policyType input field.
  - Modified `polizze-agenzia.tsx` to bind a datalist containing common corporate/commercial policy types ("RC Professionale Agenzia", "RC Professionale Medici", "RC Professionale Avvocati", "Multirischi Impresa", "Fideiussione", "RC Auto Flotte", "Tutela Legale Business", "D&O (Directors & Officers)", "Cyber Risk", "Incendio e Scoppio Capannone") to the policyType input field.
  - Modified `sinistri.tsx` to bind a datalist containing common insurance branches ("RC Auto", "Infortuni", "Vita", "Incendio e Scoppio", "Responsabilità Civile", "Tutela Legale", "Salute e Malattia", "Fideiussioni e Cauzioni", "Altri Danni ai Beni") to the Ramo input field.

### [2026-05-21 22:02]: Personalizzazione Dialog Conferma Liquidazione Sinistro
* *Details*: Unified and customized the claims liquidation confirmation experience. Replaced the generic browser `window.confirm` alert triggered by clicking the interactive badge in the dropdown menu with a unified, state-driven, beautiful Radix Dialog matching the premium dark/light HSL theme of the application. Also replaced the localized dialogs on the claim cards with simple trigger actions to leverage this same centralized premium overlay.
* *Tech Notes*:
  - Modified `sinistri.tsx` to add `liquidatingClaim` react state.
  - Re-mapped the "Liquidato (Archivia)" dropdown menu item selection to set the `liquidatingClaim` state instead of calling `window.confirm`.
  - Refactored the "Segna liquidato" secondary action buttons on the claim cards to trigger the state-driven modal directly instead of nesting dialog overlays.
  - Implemented the central `<Dialog>` confirmation element at the layout level in `sinistri.tsx` styled to match the dark/light premium aesthetic with a green/emerald theme key.

### [2026-05-21 22:08]: Gestione Badge Cassa Interattivi e Archiviazione Polizze Personali
* *Details*: Ported the interactive claim badge status switcher and archiving mechanism from claims (`sinistri.tsx`) to personal policies (`polizze-personali.tsx`). Users can now change a policy's cashiering/payment status directly from the card using an HSL-themed inline dropdown menu. Setting a policy to "Pagata" triggers a premium, custom Radix confirmation Dialog and archives it (removing it from active views).
* *Tech Notes*:
  - Modified `polizze-personali.tsx` to bind `renderCassaBadge` dropdown trigger to policy cards in "In scadenza" and "Da emettere" tabs.
  - Replaced the checkbox for `daMettereACassa` with a `<Select>` element for `cassaStato` within the creation/edit forms.
  - Integrated a layout-level custom emerald confirmation `<Dialog>` controlled by `payingPolicy` state.
  - Updated `dashboard.tsx` to filter out policies with `cassaStato === 'pagata'` from active aggregated stats to ensure data cohesion.

### [2026-05-21 22:10]: Allineamento Completo Stato Cassa e Badge Interattivi su Polizze Agenzia
* *Details*: Ported the interactive `cassaStato` dropdown badge and forms mechanism to the agency policies page (`polizze-agenzia.tsx`). This completely mirrors the premium user experience of personal policies, allowing agents to directly change corporate/agency cashier states via click, rendering elegant color-coded badges, and leveraging layout-level Radix confirmation dialogs for quick-archiving of paid records.
* *Tech Notes*:
  - Modified `polizze-agenzia.tsx` to import `ChevronDown` and `Badge`, and the full set of `@/components/ui/dropdown-menu` subcomponents.
  - Extended `policySchema` and default React hook form values to support `daMettereACassa` and `cassaStato` values.
  - Implemented the `renderCassaBadge` dropdown switcher helper inside the component and rendered it in card headers next to the client's name for both list categories.
  - Integrated a new `<Select>` dropdown for `cassaStato` in the policy forms, replacing any missing/manual cash state tracking with native validations.


### [2026-05-22 09:56]: Migrazione a Firebase (Auth + Firestore)
* *Details*: L'app è stata migrata da un database puramente locale (`localStorage`) a Firebase (Authentication + Firestore) per consentire la sincronizzazione cross-device e la persistenza sicura dei dati in cloud (gratuita per sempre).
* *Tech Notes*:
  - Installato package `firebase`.
  - Creato `src/lib/firebase.ts` per inizializzazione SDK tramite variabili d'ambiente.
  - Implementato hook `useAuth` in `src/hooks/use-auth.ts` per tracciare `onAuthStateChanged`.
  - Creata pagina di `/login` usando componenti UI.
  - Aggiornato `App.tsx` con un `ProtectedRoute` e rimozione dell'accesso globale: ora l'app ridireziona automaticamente a `/login` se `user` è null.
  - Riscritti tutti gli store (`tasks-store.ts`, `policies-store.ts`, `claims-store.ts`) sostituendo `useLocalStorage` con hook reattivi basati su `onSnapshot` di Firestore.
  - I documenti Firestore ora vengono vincolati all'ID dell'utente loggato (`userId`), garantendo l'isolamento dei dati e l'assoluta sicurezza.

### [2026-05-22 10:05]: Fix Errori Undefined su Firestore
* *Details*: Corretto un crash in cui Firebase bloccava il salvataggio dei documenti se contenevano campi opzionali non compilati (con valore `undefined`).
* *Tech Notes*:
  - Creata utility `cleanFirestoreData` in `src/lib/utils.ts` che rimuove iterativamente tutte le chiavi `undefined` da un oggetto prima di inviarlo al server.
  - Aggiornati i metodi `addDoc` e `updateDoc` in `tasks-store.ts`, `policies-store.ts` e `claims-store.ts` per pulire automaticamente il payload tramite la nuova utility.

### [2026-05-22 10:14]: Eliminazione Definitiva Polizze Pagate
* *Details*: Modificato il comportamento dello stato cassa "Pagata". Ora, sezionando questo stato, la polizza viene eliminata fisicamente dal database invece di essere archiviata.
* *Tech Notes*:
  - Aggiornati i file `src/pages/polizze-personali.tsx` e `src/pages/polizze-agenzia.tsx`.
  - La logica del pulsante del badge e del modulo di modifica (`onEditSubmit`) ora chiama `deletePolicy(id)` al posto di `updatePolicy` quando `cassaStato === "pagata"`.
  - Modificati i testi UI (es. "Pagata (Elimina)" al posto di "Archivia") per avvisare l'utente.

### [2026-05-22 10:15]: Restyling Premium del DatePicker (Calendario)
* *Details*: Totalmente ridisegnato il componente del calendario per la selezione delle date (scadenze polizze, aperture sinistri). Il vecchio design appariva datato e "orribile", ora è in linea con un'interfaccia moderna e di lusso.
* *Tech Notes*:
  - Modificato `src/components/ui/calendar.tsx`.
  - Aggiunto effetto glassmorphism al container (`backdrop-blur-xl`, sfondo semitrasparente) con angoli più morbidi.
  - I pulsanti dei giorni sono ora perfettamente rotondi con un'animazione fluida di espansione (`scale-[1.12]`) all'hovering.
  - Aggiunta di ombre colorate primarie sul giorno selezionato per un look più vivido.
  - Aggiustamento tipografico: intestazione mese più decisa, giorni della settimana ridotti, uppercase e con spaziatura maggiorata (`tracking-widest`).

### [2026-05-22 10:17]: Semplificazione Gestione Attività (Eliminazione Definitiva)
* *Details*: Rimossa la vista separata per le attività completate. Ora le attività vengono eliminate definitivamente dal database quando contrassegnate come completate, in analogia al comportamento delle polizze pagate.
* *Tech Notes*:
  - Modificato `tasks-store.ts`: il metodo `completeTask` ora chiama direttamente `deleteDoc` per cancellare il record su Firestore.
  - Modificato `src/pages/attivita.tsx`: rimossi i componenti `Tabs` e l'intera logica di raggruppamento delle attività completate (`completedTasks`, `groupedCompleted`, ecc.). Resta solo una lista unica delle attività da fare.

### [2026-05-22 10:18]: Input "Quick Add" per Attività
* *Details*: Aggiunto un campo di input inline in alto alla lista delle attività che permette all'utente di digitare e premere "Invio" per creare rapidamente un'attività, senza dover aprire modali o usare il bottone in alto a destra.
* *Tech Notes*:
  - Inserito un tag `<form>` con un campo di input testuale in `src/pages/attivita.tsx`.
  - La funzione `onSubmit` di questo piccolo form chiama direttamente `addTask({ title })`.
  - Migliorata l'UX con stili moderni e focus borders dinamici.
  - Rimosso completamente il pulsante e il modale "Nuova attività" (insieme agli hook `isAddOpen` e `form` ad esso dedicati) dall'intestazione, snellendo ulteriormente il componente.

### [2026-05-22 10:24]: Input "Quick Add" per Polizze (Personali e Agenzia)
* *Details*: Replicato il sistema di inserimento rapido anche per le polizze (sia personali che d'agenzia), rimuovendo i vecchi modali "Nuova polizza" e i relativi pulsanti, massimizzando la velocità di inserimento.
* *Tech Notes*:
  - Aggiunti form inline (`<form>`) per `polizze-personali.tsx` e `polizze-agenzia.tsx`.
  - Implementata logica intelligente: l'utente può inserire "Cliente - TipoPolizza" (es: "Mario Rossi - RCA") e lo split automatico per separatore assegnerà Nome e Tipo in automatico. In assenza di "-", il tipo è impostato su "Da definire".
  - Rimosso stato `isAddOpen`, la gestione `onSubmit` originale e l'hook `useForm` iniziale, mantenendo solo `editForm`. Risolti problemi di tipizzazione con `ReturnType<typeof useForm<PolicyFormValues>>`.

### [2026-05-22 10:28]: Miglioramento Quick Add Contestuale con Dropdown
* *Details*: Spostata la barra di Quick Add *all'interno* di ogni singola vista ("In scadenza" e "Da emettere") in modo che il sistema sappia in automatico lo stato in cui salvare la polizza. Sono stati integrati inoltre menu a tendina direttamente nella barra per selezionare il Tipo di Polizza e lo Stato della Cassa (solo Desktop/Tablet per non ingombrare da Mobile).
* *Tech Notes*:
  - Refactoring della UI: creata una funzione interna `renderQuickAdd(defaultStatus)` che restituisce il form inline sfruttando `Radix Select` (componenti di shadcn) al posto dei dropdown nativi.
  - La form adesso gestisce stati interni `quickType` e `quickCassa` per alimentare i `Select`, offrendo una combinazione di campo testuale ed elementi cliccabili, senza perdere la velocità e leggerezza raggiunta in precedenza.

### [2026-05-22 10:33]: Selettore Data in Quick Add Polizze
* *Details*: Corretto un bug per il quale l'aggiunta di una polizza nel tab "In scadenza" falliva in modo silenzioso in quanto una polizza "Emessa" richiede obbligatoriamente la data di scadenza. Aggiunto quindi un DatePicker dedicato che appare dinamicamente nella barra di Quick Add se il tab attivo è "In Scadenza".
* *Tech Notes*:
  - Introdotto stato `quickDate` in `polizze-personali.tsx` e `polizze-agenzia.tsx`.
  - La funzione `renderQuickAdd` ora mostra condizionalmente un `Popover` contenente un componente `Calendar` (già ridisegnato in chiave premium in precedenza) solo quando `defaultStatus === "emessa"`.
  - Aggiunta protezione lato UX: il pulsante "Aggiungi" si disabilita (`disabled={defaultStatus === "emessa" && !quickDate}`) finché non viene selezionata una data, impedendo salvataggi non validi su Firestore.

### [2026-05-22 10:35]: Miglioramento UX Calendario (Date Passate e Giorno Corrente)
* *Details*: Reso impossibile selezionare date antecedenti al giorno odierno in modo globale su tutti i DatePicker, in quanto non pertinenti per logiche di scadenza/rinnovo. Il giorno odierno è stato inoltre fortemente evidenziato (verde brillante con ombra luminosa) per guidare l'utente.
* *Tech Notes*:
  - Modificato `src/components/ui/calendar.tsx`: aggiunto `defaultDisabled` con logica `date < new Date(new Date().setHours(0, 0, 0, 0))` e passato come fallback.
  - Aggiornata la classe `today` nelle classNames del `DayPicker`: inserito stile `bg-emerald-500/20 text-emerald-600 font-bold border-2 border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.2)]` che rimuove l'ambiguità visiva e spicca nettamente sul resto.

### [2026-05-22 10:39]: Conferma Eliminazione Attività
* *Details*: Introdotto un popup di conferma quando l'utente clicca sul cerchietto per segnare un'attività come completata (e quindi eliminarla). Questo previene click accidentali.
* *Tech Notes*:
  - Modificato `src/pages/attivita.tsx`.
  - Il bottone per il completamento dell'attività è stato wrappato in un `AlertDialog` di shadcn. Cliccando su "Completa" nel footer del popup viene innescata la logica distruttiva su Firestore.

### [2026-05-22 10:41]: Rimozione Filtro Scadenza Polizze
* *Details*: Rimosso completamente dalla UI e dalla logica di filtering il selettore "In scadenza entro X giorni". Ora la vista "In scadenza" funge da lista completa di tutte le polizze emesse, ordinate cronologicamente, offrendo un colpo d'occhio totale senza nascondere elementi in base alla data.
* *Tech Notes*:
  - Modificati `polizze-personali.tsx` e `polizze-agenzia.tsx`.
  - Rimosso l'elemento JSX contenente gli input e i bottoni rapidi per i giorni (7, 14, 30, ecc).
  - Rimossa l'estrazione di `setExpiryThresholdDays` dall'hook `useSettings`.
  - Modificata la computed property `inScadenza` per rimuovere la clausola `.filter(p => differenceInDays(...) <= threshold)`, mantenendo solo l'ordinamento `.sort()`.

### [2026-05-22 10:46]: Quick Add per i Sinistri
* *Details*: Introdotta la comodissima barra di Quick Add anche nella pagina dei Sinistri, replicando la user experience pulita e veloce già adottata per le Polizze e le Attività.
* *Tech Notes*:
  - Modificato `src/pages/sinistri.tsx`: eliminato il bottone "Nuovo sinistro" e tutta la logica della modale associata (`isAddOpen`, `useForm`).
  - Creata la funzione `renderQuickAdd()` che gestisce l'inserimento rapido inline, supportato dagli stati locali `quickDate` e `quickStatus`.
  - I campi del Quick Add per il sinistro ora includono in un'unica riga: Nome Cliente (text input), Ramo (text input con datalist per suggerimenti), Data di Apertura (Date Picker) e Stato Sinistro (Select).
  - L'invio resetta istantaneamente i campi per agevolare l'inserimento multiplo continuo.

### [2026-05-22 10:48]: Eliminazione Sinistri Liquidati
* *Details*: Quando un sinistro viene segnato come "Liquidato", ora viene eliminato fisicamente dal database anziché rimanere nascosto o archiviato.
* *Tech Notes*:
  - Modificato `src/pages/sinistri.tsx`.
  - Sostituita l'azione `updateClaim(..., { status: 'liquidato' })` con `deleteClaim(...)` all'interno della modale di conferma liquidazione.
  - Rimossa l'opzione "Liquidato" dalle Select di inserimento e modifica, per impedire all'utente di creare un sinistro fantasma. La liquidazione è ora possibile solo tramite l'apposito bottone distruttivo (con popup di sicurezza).

### [2026-05-22 10:49]: Aggiornamento Ramo e Stato Default Sinistri
* *Details*: La selezione del "Ramo" dei sinistri è diventata un vero e proprio menu a tendina (Select), uniformandosi all'interfaccia delle polizze. Inoltre, lo stato di default per i nuovi sinistri è stato impostato su "Da aprire".
* *Tech Notes*:
  - Sostituito l'elemento `<Input list="...">` con un `<Select>` di Radix UI in `renderQuickAdd` e in `renderClaimFormFields`.
  - Lo stato locale `quickStatus`, la form logic e le costanti di reset in `src/pages/sinistri.tsx` utilizzano ora `"da_aprire"` come valore di partenza invece di `"incaricato"`.

### [2026-05-22 10:52]: Gestione Automatica Data Sinistri
* *Details*: I sinistri in stato "Da aprire" ora non richiedono più l'inserimento di una data (il calendario risulta disabilitato e mostra "Da definire"). Non appena il sinistro cambia stato, la data di apertura viene automaticamente popolata con la data corrente.
* *Tech Notes*:
  - Reso opzionale il campo `openDate` in `src/lib/claims-store.ts` e nello schema Zod di validazione in `sinistri.tsx`.
  - Inibito il Popover del calendario nella barra Quick Add e rimosso l'input date nel dialog di modifica se lo stato scelto è `da_aprire`.
  - Aggiunta logica per iniettare `format(new Date(), 'yyyy-MM-dd')` durante le transizioni di stato dal menu a tendina Badge e durante l'`onEditSubmit`.
  - Aggiornata la renderizzazione delle card affinché mostri un placeholder pulito al posto di una data invalida.

### [2026-05-22 10:56]: Ridefinizione Contatori Dashboard
* *Details*: Risolto un "falso blocco" della Dashboard in cui i contatori sembravano non aggiornarsi. Prima, infatti, venivano conteggiati solo elementi specifici (es. attività in scadenza *oggi*, o polizze già *emesse* in scadenza a breve). Ora la prima linea di schede restituisce un colpo d'occhio completo: Totale Attività, Totale Polizze, Totale Sinistri e un'unica scheda cumulativa per le "Urgenze".
* *Tech Notes*:
  - Modificate le definizioni delle `statCards` in `src/pages/dashboard.tsx`.
  - "Attività": mostra `activeTasks.length` anziché `tasksDueToday.length`.
  - "Polizze": mostra `policies.length` anziché `policiesExpiringSoon.length`.
  - "Urgenze": raggruppa dinamicamente `overdueTasks.length + policiesExpiringSoon.length` in un unico indicatore di allerta (rosso se > 0).

### [2026-05-22 10:58]: Nuovo stato Sinistri (Aperto)
* *Details*: Aggiunto un nuovo stato "Aperto" per i sinistri. Selezionandolo come primo passaggio da "Da aprire", il sistema fissa in automatico la data odierna come data di apertura. Cambiando successivamente lo stato in altre voci (es. Incaricato perito), la data di apertura precedentemente fissata viene mantenuta intatta.
* *Tech Notes*:
  - Aggiunto `"aperto"` all'enum dei tipi in `claims-store.ts` e nello schema Zod di `sinistri.tsx`.
  - Aggiunta configurazione UI per `"aperto"` in `renderInteractiveBadge` (colore badge `blue-500`).
  - La logica implementata nel precedente aggiornamento per `updateClaim` e `onEditSubmit` copre già perfettamente la persistenza immutabile della data dopo il primo popolamento automatico in uscita da `da_aprire`.

### [2026-05-22 11:00]: Quick Add Attività Potenziato
* *Details*: La barra di aggiunta rapida per le Attività include ora anche un selettore per la data di scadenza. Questo rende l'inserimento immediato molto più flessibile senza dover aprire la finestra di modifica in un secondo momento. La data è del tutto opzionale.
* *Tech Notes*:
  - Modificato `src/pages/attivita.tsx` per convertire la barra di Quick Add da un semplice `Input` ad un form in linea simile a quello dei sinistri.
  - Aggiunto lo stato `quickDate` e un `Popover` contenente il `<Calendar>`.
  - La logica di invio converte automaticamente la data se selezionata, o lascia il campo `dueDate` vuoto, azzerando correttamente gli stati post-inserimento.

### [2026-05-22 11:03]: Prevenzione Esposizione Segreti e API Keys
* *Details*: È stato eseguito un super-controllo sull'intera repository per verificare l'assenza di API keys hardcoded e file sensibili prima di un push pubblico verso GitHub.
* *Tech Notes*:
  - Verificato che `src/lib/firebase.ts` sfrutti esclusivamente variabili di ambiente (`import.meta.env.VITE_FIREBASE_API_KEY`, etc.) senza hardcode.
  - Eseguita ricerca approfondita (tramite RegExp) di pattern per chiavi segrete, token e password, escludendo dipendenze: nessun dato sensibile trovato.
  - Aggiunte al `.gitignore` di root le wildcard fondamentali per prevenire la pubblicazione accidentale (`.env`, `.env.*`, `.env.local`, ecc.), risolvendo la pre-esistente lacuna di sicurezza (il file `.env.local` locale risultava untracked e pronto ad un potenziale `git add`). Ora è in sicurezza.

### [2026-05-22 11:04]: Conferma Eliminazione Sinistri
* *Details*: Introdotto un popup di conferma quando si clicca sull'icona del cestino per eliminare un sinistro, prevenendo cancellazioni accidentali.
* *Tech Notes*:
  - Modificato `src/pages/sinistri.tsx` introducendo lo stato locale `deletingClaim`.
  - Il bottone con l'icona `Trash2` ora aggiorna lo stato anziché chiamare direttamente `deleteClaim`.
  - Integrato un `<Dialog>` di conferma dedicato, coerente col design system e colorato di rosso (`destructive`), con annesso bottone di "Elimina".

### [2026-05-22 11:06]: Estensione Popup di Conferma Eliminazione a Polizze e Attività
* *Details*: Uniformata l'esperienza utente (UX) e rafforzata la sicurezza dei dati estendendo il popup di conferma per l'eliminazione anche alle sezioni Polizze Personali, Polizze Agenzia e Attività.
* *Tech Notes*:
  - Aggiunti gli stati locali `deletingPolicy` e `deletingTask` rispettivamente nei file `polizze-personali.tsx`, `polizze-agenzia.tsx` e `attivita.tsx`.
  - Sostituita la chiamata diretta alle funzioni di delete (`deletePolicy`, `deleteTask`) sull'onClick dei bottoni cestino `Trash2` con l'attivazione dei nuovi stati.
  - Inseriti i moduli `<Dialog>` in stile Shadcn UI con la palette cromatica `destructive` alla base di ogni componente per gestire il consenso esplicito dell'utente prima della cancellazione irreversibile.
