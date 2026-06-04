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

### [2026-05-22 11:09]: Modifica Cromatica Badge "Regolare"
* *Details*: Aggiornato il colore del badge per lo stato cassa "Regolare" in tutte le polizze (Personali e Agenzia). Il vecchio grigio-blu (`slate-500`) è stato sostituito con un azzurro-celeste più vivido e chiaro (`sky-500`) per renderlo molto più visibile a colpo d'occhio.
* *Tech Notes*:
  - Modificati i file `src/pages/polizze-personali.tsx` e `src/pages/polizze-agenzia.tsx`.
  - Aggiornato l'oggetto `cassaConfig.regolare.className` e `dotColor` sostituendo tutte le occorrenze di `slate-500` e `slate-600` con `sky-500` e `sky-600`.
  - Aggiornato il colore del pallino di stato nel menu a tendina corrispondente in entrambi i file.

### [2026-05-22 11:11]: Riorganizzazione Box Dashboard
* *Details*: Sostituito il box "Urgenze" nella dashboard con "Polizze Agenzia" e rinominato il box "Polizze" in "Polizze Personali". I due box delle polizze sono stati affiancati per una migliore organizzazione visiva.
* *Tech Notes*:
  - Modificato il file `src/pages/dashboard.tsx`.
  - Ricalcolato il conteggio per le polizze personali `personali.filter(...)` e agenzia `agenzia.filter(...)` nei rispettivi box, escludendo le polizze pagate.
  - Sostituito e riordinato l'array `statCards` per mostrare nell'ordine: Attività, Polizze Personali, Polizze Agenzia, Sinistri.

### [2026-05-22 11:13]: Pulizia Barra Inserimento Rapido
* *Details*: Rimosso il selettore "Stato Cassa" dalla barra di inserimento rapido quando ci si trova nel tab "Da emettere", poiché una polizza non ancora emessa non ha motivo di avere uno stato cassa immediato.
* *Tech Notes*:
  - Modificata la funzione `renderQuickAdd` in `src/pages/polizze-personali.tsx` e `src/pages/polizze-agenzia.tsx`.
  - Applicato il rendering condizionale `{defaultStatus === "emessa" && (...)}` attorno al componente `<Select>` di `quickCassa` e al relativo separatore `div`.

### [2026-05-22 11:15]: Rimozione Badge Cassa da Lista "Da Emettere"
* *Details*: Nascosto del tutto il badge indicatore dello "Stato cassa" dalle polizze presenti nel tab "Da emettere".
* *Tech Notes*:
  - Modificati `src/pages/polizze-personali.tsx` e `src/pages/polizze-agenzia.tsx`.
  - Rimossa la chiamata a `{renderCassaBadge(policy)}` all'interno del ciclo `daEmettere.map()`. Il badge viene ora renderizzato esclusivamente all'interno del tab "In scadenza".

### [2026-05-22 11:18]: Modifica Comportamento "Segna Emessa"
* *Details*: Le polizze "Da emettere", quando contrassegnate come emesse tramite l'apposito bottone col check verde, vengono ora eliminate definitivamente dal database invece di essere semplicemente aggiornate. Questo tratta la lista "Da emettere" come una vera e propria to-do list, archivindo la voce una volta evasa la pratica, per evitare che rimanga "orfana" (invisibile ma conteggiata nelle statistiche in caso di assenza della data di scadenza).
* *Tech Notes*:
  - Modificato il componente `<Dialog>` legato allo stato `issuingPolicy` in `src/pages/polizze-personali.tsx` e `src/pages/polizze-agenzia.tsx`.
  - Aggiornato il testo esplicativo del Dialog (`DialogDescription`) per avvertire l'utente che l'azione eliminerà il record dal database.
  - Sostituita la funzione `updatePolicy(..., { status: "emessa" })` con `deletePolicy(...)` nell'handler di conferma.

### [2026-05-22 11:23]: Campo Note Rapido nella Barra di Inserimento
* *Details*: Aggiunta la possibilità di inserire immediatamente delle "Note" opzionali direttamente dalla barra di aggiunta rapida, senza dover più creare l'elemento e poi usare il pulsante di modifica. La funzionalità è stata estesa a tutte le sezioni principali del gestionale.
* *Tech Notes*:
  - Modificata la barra form (`renderQuickAdd` / inline form) nei file `src/pages/polizze-personali.tsx`, `src/pages/polizze-agenzia.tsx`, `src/pages/sinistri.tsx` e `src/pages/attivita.tsx`.
  - Inserito un nuovo campo di input testuale (nome: `quickNotes`) prima del bottone di submit in tutti i form.
  - Aggiornati gli handler di submit per estrarre il valore di `quickNotes`, aggiungerlo al payload (`notes: notes || undefined`) e resettare il campo a fine operazione.

### [2026-05-22 11:28]: Aggiunta / Modifica Rapida Note sulle Card
* *Details*: Aggiunto un nuovo pulsante specifico ("Aggiungi/Modifica nota") su ciascuna card esistente nelle sezioni Polizze Personali, Polizze Agenzia, Sinistri e Attività. Cliccando su di esso si apre un piccolo popup mirato esclusivamente alla modifica delle note per quell'elemento, senza dover aprire l'intero modulo di modifica generale.
* *Tech Notes*:
  - Aggiunti stati locali per gestire l'apertura del dialog (es. `editingNotePolicy`, `editingNoteClaim`, `editingNoteTask`).
  - Importata l'icona `MessageSquare` da lucide-react. Il bottone si illumina del colore primario se la nota è già presente.
  - Inserito in calce ad ogni pagina un componente `<Dialog>` compatto con un `<Textarea>` pre-popolato con le note correnti (`defaultValue`).
  - L'invio del form chiama la rispettiva funzione di aggiornamento (`updatePolicy`, `updateClaim`, `updateTask`) limitandosi ad aggiornare esclusivamente il campo `notes`.

### [2026-05-22 11:30]: Riscrittura Completa README
* *Details*: Riscritto e modernizzato il file `README.md` principale del progetto. Il nuovo documento ora riflette accuratamente le capacità attuali del gestionale, focalizzandosi sull'utilizzo per agenti assicurativi e spiegando dettagliatamente le novità (Firebase, Sinistri, Polizze divise, Quick Add).
* *Tech Notes*:
  - Aggiornate le istruzioni di configurazione ambientale (`.env.local` e Firebase).
  - Rimossi i vecchi riferimenti all'utilizzo esclusivo del `localStorage`.

### [2026-05-22 11:32]: Differenziazione Colori Tag Polizze in Dashboard
* *Details*: Differenziato il colore e aggiornato il testo dei badge (tag) per distinguere a colpo d'occhio le polizze "PERSONALI" da quelle "AGENZIA" nell'elenco delle prossime scadenze sulla dashboard principale.
* *Tech Notes*:
  - Modificato `dashboard.tsx` sostituendo la classe statica `text-gold bg-gold/10` con uno stile condizionale basato su `p.scope`.
  - Utilizzato `text-sky-600 bg-sky-500/10` per le polizze Personali e `text-violet-600 bg-violet-500/10` per le polizze Agenzia (con varianti dark mode).

### [2026-05-22 11:34]: Rimozione Pulsanti "Quick Add" dalla Dashboard
* *Details*: Rimossi definitivamente i tre pulsanti in alto a destra ("Nuova attività", "Nuova p. personale", "Nuova p. agenzia") dalla vista Dashboard per mantenere un design più pulito e spingere l'utilizzo esclusivo delle barre di "Quick Add" interne alle specifiche schermate.
* *Tech Notes*:
  - Rimosso blocco di codice contenente `<div className="flex gap-2 flex-wrap">` e i tre bottoni `<Link>` dal layout principale di `dashboard.tsx`.

### [2026-05-22 11:43]: Ottimizzazione PWA e Layout Mobile
* *Details*: L'applicazione è stata trasformata in una Progressive Web App (PWA) completa ed è stato ottimizzato il layout per offrire un'esperienza utente nativa sui dispositivi mobili.
* *Tech Notes*:
  - Installato e configurato `vite-plugin-pwa` nel file `vite.config.ts` per gestire la registrazione del service worker (autoUpdate) e la generazione del manifest.
  - Aggiornato `index.html` aggiungendo i meta tag `theme-color`, `apple-touch-icon` e la viewport configurata con `viewport-fit=cover` e `user-scalable=no`.
  - Modificato profondamente il file `src/components/layout/shell.tsx`: su schermi mobile la sidebar viene ora nascosta e sostituita da una barra di navigazione fissa sul fondo (Bottom Navigation Bar) e una top bar, integrando le `safe-area-inset` per i dispositivi moderni.
  - Aggiunte ottimizzazioni UI in `src/index.css` per i dispositivi touch (`overscroll-behavior-y: none;` e `-webkit-tap-highlight-color: transparent;`).

### [2026-05-22 11:45]: Ottimizzazione Griglia Dashboard per Mobile
* *Details*: I quattro box riassuntivi della dashboard sono stati riorganizzati per occupare esattamente una griglia 2x2 sui dispositivi mobili (anziché incolonnarsi tutti su 4 righe separate), massimizzando l'utilizzo dello spazio a schermo e migliorando l'UX.
* *Tech Notes*:
  - Modificato `src/pages/dashboard.tsx` cambiando la classe `grid-cols-1 sm:grid-cols-2` in `grid-cols-2` per la griglia delle `statCards`.
  - Aggiunti stili responsive ai font (`text-xs sm:text-sm` per il titolo, `text-2xl sm:text-4xl` per il valore numerico) e alle icone per far sì che calzino perfettamente all'interno di box più piccoli su schermi ristretti.
  - Applicato `flex flex-col h-full` e `mt-auto` al valore numerico per mantenere un allineamento omogeneo qualora il titolo vada a capo.

### [2026-05-22 11:46]: Fix Layout Mobile Form Inserimento Rapido
* *Details*: Risolto un problema di overflow orizzontale (ritaglio dell'interfaccia) del form di inserimento rapido sulle polizze in scadenza sui dispositivi mobili.
* *Tech Notes*: Modificati i file `src/pages/polizze-personali.tsx` e `src/pages/polizze-agenzia.tsx` aggiornando la classe Tailwind del container dei filtri da `flex` a `flex-col sm:flex-row` per permettere un impilamento verticale corretto sugli schermi stretti, evitando così che il bottone "Aggiungi" finisse fuori dai bordi dello schermo.

### [2026-05-22 11:55]: Ottimizzazione Completa Mobile iPhone (Tutte le Pagine)
* *Details*: Eseguita un'ottimizzazione profonda e completa di ogni singola pagina dell'applicazione per garantire un'esperienza utente professionale e nativa sui dispositivi iPhone (ultimi modelli, Dynamic Island, safe areas). Le modifiche coprono 10 file e risolvono 12 categorie di problemi UX mobile.
* *Tech Notes*:
  - **CSS Globale** (`src/index.css`):
    - Aggiunta prevenzione auto-zoom input iOS (font-size: 16px su schermi < 768px per tutti i tipi di input)
    - `touch-action: manipulation` globale per eliminare il delay 300ms del double-tap zoom
    - `-webkit-text-size-adjust: 100%` per prevenire ridimensionamento testo su rotazione
    - `overscroll-behavior: none` globale (non solo asse Y)
    - `min-height: 100dvh` con fallback `100vh` per Dynamic Viewport Height
    - Aggiunta utility `.touch-target-44` per touch target minimi Apple HIG (44px)
    - **Dialog come Bottom Sheet su mobile**: tutti i `[data-radix-dialog-content]` e `[data-radix-alert-dialog-content]` vengono forzati a posizionarsi in basso con animazione slide-up, bordi arrotondati in alto, drag handle visivo, max-height 85dvh, scroll interno, safe-area padding
    - Momentum scrolling iOS (`-webkit-overflow-scrolling: touch`) su main
  - **HTML** (`index.html`): aggiunti meta tag `apple-mobile-web-app-capable`, `apple-mobile-web-app-status-bar-style` (black-translucent) e `mobile-web-app-capable`
  - **PWA Manifest** (`vite.config.ts`): aggiunti `orientation: "portrait"`, `scope: "/"`, `start_url: "/"`
  - **Shell** (`src/components/layout/shell.tsx`):
    - Bottom nav: touch target aumentati (min-w 3rem, py-2, px-3), indicatore dot attivo dorato, `active:scale-90` per feedback tattile, label bold sull'attivo, z-index a 30
    - Top bar: safe area Dynamic Island-aware con `paddingTop: env(safe-area-inset-top)`, altezza calcolata dinamicamente, backdrop-blur-xl, z-index 30
    - Main content: padding-top dinamico con inline style, padding orizzontale ridotto a `px-3` su mobile
    - Bottom padding globale aumentato a `4.5rem` per evitare occlusione dalla nav
  - **Dashboard** (`src/pages/dashboard.tsx`): H1 ridotto a `text-2xl` su mobile, spacing sezioni `space-y-6 sm:space-y-10`, padding liste `px-3 py-3 sm:px-5 sm:py-4`, link "Vedi tutte" con area touch espansa, `active:bg-muted/60`
  - **Attività** (`src/pages/attivita.tsx`):
    - **Bottoni azione sempre visibili su mobile** (rimosso `opacity-0` globale, applicato solo `sm:opacity-0 sm:group-hover:opacity-100`)
    - Filtri con scroll orizzontale e `shrink-0` per non wrappare
    - Quick Add: tutti gli input portati a `h-11`, bottone Aggiungi a `h-11`
    - Card padding `p-3 sm:p-4`
    - Header `text-2xl sm:text-4xl`, spacing `space-y-5 sm:space-y-8`
  - **Polizze Personali** (`src/pages/polizze-personali.tsx`):
    - Bottoni azione visibili su mobile (`sm:opacity-0` anziché `opacity-0`)
    - Tutti gli input/select Quick Add a `h-11`
    - Card padding `p-3 sm:p-5`, azioni `px-3 pb-3 sm:px-5 sm:py-5` con `gap-1.5 sm:gap-2` e `flex-wrap`
    - Header compatto, spacing adattivo
  - **Polizze Agenzia** (`src/pages/polizze-agenzia.tsx`): stesse identiche modifiche applicate a Personali
  - **Sinistri** (`src/pages/sinistri.tsx`): stesse modifiche: azioni visibili, touch targets h-11, card compact, header compatto
  - **Login** (`src/pages/login.tsx`): `min-h-[100dvh]`, input `h-12`, bottone `h-12 text-base font-semibold`, safe-area padding bottom

### [2026-05-22 12:28]: Aggiornamento Logo Ufficiale PWA e Icone Multi-Risoluzione
* *Details*: È stato configurato ed aggiornato il logo ufficiale e definitivo dell'applicazione in tutti i formati richiesti per la Progressive Web App (PWA) e la visualizzazione web. È stata generata una suite completa di icone ad alta risoluzione (192x192, 512x512, 180x180 per Apple) partendo dall'immagine ad alta definizione fornita dall'utente, garantendo un'interfaccia estremamente premium su tutti i dispositivi e sistemi operativi.
* *Tech Notes*:
  - Utilizzato lo strumento macOS `sips` per convertire ed effettuare il resizing perfetto del file sorgente a 1024x1024 pixel.
  - Generato `pwa-192x192.png` (192x192) in `artifacts/gestionale/public/`.
  - Generato `pwa-512x512.png` (512x512) in `artifacts/gestionale/public/`.
  - Generato `apple-touch-icon.png` (180x180 per iOS) in `artifacts/gestionale/public/`.
  - Aggiornato `favicon.svg` per includere un rendering embedded ad alta densità (base64) dell'immagine a 128x128 pixel, garantendo supporto vettoriale nativo senza perdere fedeltà visiva.
  - Eseguita compilazione di test con `PORT=5173 BASE_PATH=/ pnpm --filter @workspace/gestionale build` per verificare che la configurazione del manifest della PWA includa e compili correttamente i nuovi asset statici.

### [2026-05-22 12:34]: Fallback Resilienti per Variabili d'Ambiente Port/BasePath
* *Details*: Risolto un blocco di compilazione su piattaforme serverless/statiche (come Vercel) rendendo le variabili d'ambiente `PORT` e `BASE_PATH` opzionali durante la fase di build. Ora l'applicazione fall-backa automaticamente su valori standard (`5173` e `/`) se queste chiavi non sono passate nel runtime del compiler, consentendo deploy rapidi senza configurazioni complesse.
* *Tech Notes*:
  - Modificato `artifacts/gestionale/vite.config.ts` per impostare `process.env.PORT || "5173"` e `process.env.BASE_PATH || "/"`, eliminando le eccezioni bloccanti sollevate in precedenza in assenza di variabili d'ambiente.

### [2026-05-22 12:49]: Aggiunta Premio (Valore Numerico) alle Polizze
* *Details*: È stato aggiunto un campo "Premio" a tutte le polizze (Personali e Agenzia), permettendo l'inserimento di un valore numerico opzionale rappresentante il premio della polizza in fase di inserimento rapido.
* *Tech Notes*:
  - Modificato `src/lib/policies-store.ts`: aggiunto `premio?: number` all'interfaccia `Policy`.
  - Modificato `src/pages/polizze-personali.tsx` e `src/pages/polizze-agenzia.tsx`:
    - Aggiornato lo schema Zod (`policySchema`) con `premio: z.coerce.number().optional()`.
    - Inserito un campo `Input` di tipo `number` (step "0.01") alla destra del selettore del "Ramo" (`quickType`) all'interno della barra di Quick Add.
    - Aggiornate le funzioni di submit rapido e submit completo (`onEditSubmit`) per salvare correttamente il valore.
    - Il premio viene visualizzato nelle liste sotto forma di badge con formattazione valutaria (es: `€ 250.50`).

### [2026-05-22 14:38]: Rimozione Vincolo Data Vecchia sui Sinistri
* *Details*: Rimosso il vincolo temporale sulla selezione della data per l'apertura dei sinistri (sia in fase di Quick Add che in fase di modifica completa), consentendo all'utente di selezionare qualsiasi data nel passato per sinistri già aperti o in fase di caricamento.
* *Tech Notes*:
  - Modificato `src/pages/sinistri.tsx`: passato l'attributo `disabled={() => false}` ad entrambi i componenti `<Calendar>` (Quick Add e edit form) per sovrascrivere il comportamento predefinito di inibizione delle date passate, lasciando inalterati gli altri moduli applicativi.

### [2026-05-22 14:41]: Inserimento Ramo Personalizzato (A Mano) nei Sinistri
* *Details*: Aggiunta la possibilità per l'utente di digitare a mano un "Ramo" personalizzato libero quando aggiunge o modifica un sinistro, qualora non trovi la voce adatta nel menu a tendina. Le voci standard rimangono disponibili sotto forma di suggerimenti cliccabili.
* *Tech Notes*:
  - Modificato `src/pages/sinistri.tsx`:
    - Sostituito il componente `<Select>` di Radix UI sia nel form di "Quick Add" che nel form principale di "Modifica Sinistro" con un `<Input>` testuale collegato a un `<datalist>` contenente i rami standard.
    - Aggiornati gli stili e gli attributi in modo che l'input testuale si integri fluidamente con il resto del layout del gestionale.

### [2026-05-22 14:45]: Chiusura Automatica dei Date Picker al Click del Giorno
* *Details*: Introdotta la chiusura automatica (auto-close) globale di tutti i calendari / date picker dell'applicazione non appena l'utente clicca/seleziona un giorno specifico, eliminando la necessità di cliccare fuori dal popover per chiuderlo e migliorando notevolmente la fluidità d'uso quotidiana.
* *Tech Notes*:
  - Modificati i file `src/pages/attivita.tsx`, `src/pages/polizze-personali.tsx` e `src/pages/polizze-agenzia.tsx`.
  - Convertiti tutti i date picker (`Popover` + `Calendar`) da uncontrolled a controlled, sfruttando gli stati React locali `quickDatePopoverOpen`, `editExpiryDatePopoverOpen` (oppure `editDatePopoverOpen`) e `editTargetDatePopoverOpen`.
  - Aggiornati i callback `onSelect` all'interno dei componenti `<Calendar>` in modo da invocare la chiusura dello stato del rispettivo popover (`setOpen(false)`) contestualmente al salvataggio della data selezionata.
  - Verificato con successo che la navigazione dei mesi del calendario (pulsanti avanti/indietro) rimane intatta e non provoca chiusure accidentali del popover.

### [2026-05-22 14:48]: Risoluzione Errore quickStatus non definito nei Sinistri
* *Details*: Corretto un crash a runtime (ReferenceError) nella schermata "Sinistri" causato dalla mancata dichiarazione dello stato `quickStatus` utilizzato nella barra di inserimento rapido.
* *Tech Notes*:
  - Modificato `src/pages/sinistri.tsx` per dichiarare correttamente `const [quickStatus, setQuickStatus] = useState<string>("da_aprire")` nel componente `Sinistri`.

### [2026-05-22 14:52]: Ridenominazione placeholder Note e Uniformazione Layout Sinistri
* *Details*: Riformattata l'interfaccia delle schede dei sinistri per utilizzare lo stesso layout a riga singola compatto già introdotto per le polizze, e rinominati i placeholder di tutti i form di inserimento rapido dell'app per visualizzare coerentemente "Note" anziché "Note (opzionali)...".
* *Tech Notes*:
  - **Placeholder Note**: Ridenominati i placeholder degli input di inserimento rapido in `attivita.tsx`, `sinistri.tsx`, `polizze-personali.tsx` e `polizze-agenzia.tsx` da `"Note (opzionali)..."` a `"Note"`.
  - **Formato Sinistri a Riga Singola**: Modificato il rendering delle schede in `src/pages/sinistri.tsx`:
    - Spostato il badge del Ramo (`claim.ramo`) all'interno dell'elemento di intestazione `<h3>` a fianco del nome del cliente e del badge di stato.
    - Limitata la larghezza del nome cliente con `max-w-[180px] sm:max-w-xs truncate` per prevenire disallineamenti.
    - Spostate le note (`claim.notes`) in un blocco dedicato nella riga sottostante.
  - **Risoluzione Typecheck**: Tipizzato correttamente lo stato `quickStatus` in `sinistri.tsx` come `Claim["status"]` invece di `string` per eliminare l'errore del compilatore TypeScript.

- [22 May 2026 - 14:50]: Aggiunta Pagina Preventivi
  - *Details*: Creata una nuova sezione "Preventivi" raggiungibile dalla sidebar per gestire le richieste e le trattative dei clienti, con un layout e un design allineato al resto dell'applicazione.
  - *Tech Notes*:
    - Creato store in `src/lib/preventivi-store.ts` per Firestore (collezione `preventivi`).
    - Creata pagina UI `src/pages/preventivi.tsx` per listing e form (con stati "da_fare", "trattativa_in_corso", "fatto" e relative badge).
    - Aggiunto il path `/preventivi` su `src/App.tsx`.
    - Aggiunta la route `Preventivi` nella sidebar in `src/components/layout/shell.tsx`.

- [22 May 2026 - 14:52]: Rimozione Polizze Agenzia
  - *Details*: Rimossa completamente la funzionalità "Polizze Agenzia" come richiesto.
  - *Tech Notes*:
    - Eliminato il file `src/pages/polizze-agenzia.tsx`.
    - Rimossa la rotta associata in `src/App.tsx`.
    - Rimosso il link di navigazione dalla sidebar in `src/components/layout/shell.tsx`.
    - Rimosso l'hook `usePoliciesAgenzia` da `src/lib/policies-store.ts`.

- [22 May 2026 - 14:55]: Unificazione Pagina Preventivi
  - *Details*: Rimossi i tab di suddivisione per stato nella pagina "Preventivi". Ora tutti i preventivi sono visualizzati in un unico elenco, con la possibilità di assegnare i badge di stato direttamente da ciascuna card.
  - *Tech Notes*:
    - Rimosso il componente `Tabs` in `src/pages/preventivi.tsx`.
    - La form di Quick Add è ora univoca e posta in alto sopra alla lista di tutti i preventivi, assegnando lo stato di default "da_fare".

- [22 May 2026 - 14:57]: Aggiunta data personalizzata per i Preventivi
  - *Details*: Aggiunta la possibilità di inserire e modificare la data di creazione di un preventivo. Se non specificata in fase di creazione, verrà impostata automaticamente la data corrente.
  - *Tech Notes*:
    - Modificato `preventivi-store.ts` per permettere l'aggiornamento del campo `createdAt` e accettare date personalizzate in fase di add.
    - Aggiornata l'UI in `src/pages/preventivi.tsx` per includere un `DatePicker` nel Quick Add e nel modale di modifica.

- [22 May 2026 - 14:59]: Fix Dashboard e Sostituzione Card
  - *Details*: Risolto errore di sintassi nella Dashboard dovuto alla rimozione dell'hook `usePoliciesAgenzia`. Sostituita la card "Polizze Agenzia" con la nuova card "Preventivi" per mantenere il layout intatto e mostrare i dati rilevanti.
  - *Tech Notes*:
    - Rimosso l'import in `src/pages/dashboard.tsx` di `usePoliciesAgenzia`.
    - Rimosse le logiche di visualizzazione combinate (badge "PERSONALI" vs "AGENZIA").
    - Aggiunta importazione di `usePreventivi` e integrata la card `Preventivi` nella griglia delle statistiche principali.

- [22 May 2026 - 15:00]: Aggiornamento Filtri Attività
  - *Details*: Modificati i bottoni di filtro rapido nella pagina "Da fare". Ora sono limitati esclusivamente a: "Oggi", "Questa settimana" e "Scadute", come richiesto dall'utente.
  - *Tech Notes*:
    - Rimosse le opzioni "Tutte" e "Senza data" dall'elenco `filterButtons` in `src/pages/attivita.tsx`.
    - Modificata la tipizzazione di `QuickFilter` per includere `today` e gestire coerentemente lo stato `all` in background per permettere la deselezione dei filtri (toggle-off).

- [22 May 2026 - 15:02]: Sostituzione Input Ramo con Select
  - *Details*: Modificato il campo "Ramo" nella pagina Gestione Sinistri. Invece di un campo di testo libero con suggerimenti (datalist), è ora un menu a tendina (Select) per vincolare l'utente a scegliere tra le voci predefinite, sia nella fase di aggiunta rapida che nel modale di modifica.
  - *Tech Notes*:
    - Sostituito `<Input list="...">` e `<datalist>` con i componenti `<Select>`, `<SelectTrigger>`, `<SelectContent>` e `<SelectItem>` in `src/pages/sinistri.tsx`.

- [22 May 2026 - 15:09]: Uniformazione Stile e Azioni Preventivi a Polizze
  - *Details*: Aggiornato lo stile della lista dei preventivi per farlo corrispondere perfettamente a quello compatto e pulito delle polizze, organizzando tutto su una singola riga. Introdotte le logiche di eliminazione fisica (su base di conferma) quando un preventivo viene impostato allo stato "Fatto". Aggiunto il pulsante inline per l'inserimento/modifica rapida delle note, assieme al nuovo popup dedicato.
  - *Tech Notes*:
    - Modificato `preventivi.tsx` per rimuovere la logica che manteneva attivi i preventivi in stato "Fatto".
    - Aggiunti i popup di conferma (`Dialog`) per lo stato "Fatto" (`completingPreventivo`) e l'aggiunta rapida di note (`editingNotePreventivo`).
    - L'interfaccia UI dei preventivi condivide ora il layout a riga singola con `polizze-personali.tsx`.

### [2026-05-22 15:50]: Inserimento Data Prevista nelle Polizze Da Emettere
* *Details*: Aggiunta la possibilità di inserire la data prevista di emissione direttamente dalla barra di inserimento rapido ("Quick Add") anche per le polizze nel tab "Da emettere".
* *Tech Notes*:
  - Modificato `src/pages/polizze-personali.tsx` per mostrare il calendario nel Popover anche quando `defaultStatus === "da_emettere"`.
  - Associata la data selezionata al campo `targetIssueDate` se lo stato è "da_emettere", mantenendo `expiryDate` per le polizze "emessa".
  - Il pulsante "Aggiungi" ora richiede obbligatoriamente la data solo per le polizze in scadenza, mantenendola opzionale per quelle da emettere.

### [2026-05-22 16:32]: Aggiornamento Colore Badge Premio in Verde
* *Details*: Modificato il colore del badge del premio (prezzo) nella pagina delle polizze personali per essere visualizzato in un verde brillante (emerald), rendendo l'interfaccia più coordinata ed elegante.
* *Tech Notes*:
  - Modificato `src/pages/polizze-personali.tsx` sostituendo le classi `bg-primary/10 text-primary` con `bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20` all'interno dei cicli di visualizzazione delle card per entrambi i tab ("In scadenza" e "Da emettere").

### [2026-05-22 16:37]: Sostituzione Stato "Non liquidato" con "Visita Medico Legale"
* *Details*: Sostituito lo stato dei sinistri "Non liquidato" con lo stato "Visita Medico Legale" sia a livello grafico (etichette, badge, selettori) sia nella tipizzazione dello store (Firebase). Per il nuovo stato è stato adottato un badge con sfumature di rosa (`rose-500`) elegante e coordinato.
* *Tech Notes*:
  - Modificato `src/lib/claims-store.ts` per rimuovere `'non_liquidato'` e inserire `'visita_medico_legale'` nella definizione di tipo dello stato del `Claim`.
  - Modificato `src/pages/sinistri.tsx` per aggiornare lo schema Zod (`claimSchema`), il dizionario delle classi/colori (`statusConfig`), gli event handler del badge interattivo dropdown, e la Select del modulo di inserimento/modifica sinistro.

### [2026-05-22 16:42]: Formattazione Prezzi con Locale Italiano (Badge Premio)
* *Details*: Aggiornata la visualizzazione del badge del premio (prezzo) in tutte le occorrenze della web app per utilizzare la formattazione numerica italiana (separatore delle migliaia come punto e decimali come virgola, es. "15.000,00" invece di "15000.00").
* *Tech Notes*:
  - Modificato `src/pages/preventivi.tsx` per sostituire `.toFixed(2)` con `.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })` sul display del premio.
  - Modificato `src/pages/polizze-personali.tsx` per sostituire `.toFixed(2)` con `.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })` sul display del premio in entrambi i tab ("In scadenza" e "Da emettere").

### [2026-05-22 16:44]: Aggiornamento Globale Colore Badge Premio in Verde
* *Details*: Uniformato il colore dei badge del premio in tutte le viste del gestionale (compresi i Preventivi) impostando ovunque la tonalità verde brillante (emerald), garantendo consistenza estetica nell'intera web app.
* *Tech Notes*:
  - Modificato `src/pages/preventivi.tsx` per sostituire le classi del badge del premio (`bg-primary/10 text-primary`) con lo stile verde emerald borderato (`bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20`).

### [2026-05-22 16:50]: Risoluzione Problema Salvataggio e Cancellazione Note
* *Details*: Risolto un bug critico in cui le modifiche apportate al campo Note non venivano salvate o cancellate correttamente su Firestore. Il problema derivava dal fatto che, lasciando il campo vuoto o cancellandolo, veniva passato il valore `undefined`. L'utility di pulizia `cleanFirestoreData` rimuoveva quindi la chiave dal payload di aggiornamento inviato a `updateDoc`, con il risultato che Firestore non modificava il valore preesistente nel database. Impostando il fallback a stringa vuota `""` invece di `undefined`, il valore viene ora correttamente aggiornato e azzerato nel database.
* *Tech Notes*:
  - Modificato `src/pages/attivita.tsx` per passare `notes: values.notes ?? ""` in modifica e `notes: notes || ""` nei flussi di aggiunta rapida e aggiornamento mirato note.
  - Modificato `src/pages/preventivi.tsx` per passare `notes: values.notes ?? ""` in modifica e `notes: notes || ""` / `notesInput.value.trim() || ""` nei flussi di aggiunta rapida e popup note.
  - Modificato `src/pages/polizze-personali.tsx` per passare `notes: values.notes ?? ""` in modifica e `notes: notes || ""` nei flussi di aggiunta rapida e popup note.
  - Modificato `src/pages/sinistri.tsx` per passare `notes: values.notes ?? ""` in modifica e `notes: notes || ""` nei flussi di aggiunta rapida e popup note.

### [2026-05-22 16:52]: Semplificazione Nome Pagina Polizze Personali in Personali
* *Details*: Sostituita la stringa dell'intestazione principale "Polizze Personali" con "Personali" all'interno della pagina delle polizze personali per renderla coerente con le restanti etichette dell'applicazione (es. sidebar e dashboard).
* *Tech Notes*:
  - Modificato `src/pages/polizze-personali.tsx` per cambiare `<h1>Polizze Personali</h1>` in `<h1>Personali</h1>`.

### [2026-05-25 08:48]: Localizzazione Calendario in Italiano
* *Details*: Tradotto e localizzato il calendario in lingua italiana per tutte le viste del gestionale (inserimento e scadenze polizze, aperture sinistri, compiti e preventivi), impostando i giorni della settimana, i mesi e il primo giorno della settimana (Lunedì) secondo gli standard italiani.
* *Tech Notes*:
  - Modificato `artifacts/gestionale/src/components/ui/calendar.tsx`: importato `it` da `date-fns/locale`, associata la prop `locale={it}` al componente `DayPicker`, e aggiornata la formattazione del menu a tendina dei mesi usando il locale italiano (`it-IT`).
  - Modificato `artifacts/mockup-sandbox/src/components/ui/calendar.tsx`: eseguite le medesime modifiche per il pacchetto di mockup, importando `it` da `date-fns/locale`, aggiungendo `locale={it}` a `DayPicker` e impostando `"it-IT"` in `toLocaleString`.

### [2026-05-25 06:49]: Ordinamento Cronologico Sinistri
* *Details*: Aggiunto l'ordinamento cronologico per data di apertura (dal più vecchio al più recente) nella lista dei sinistri in `src/pages/sinistri.tsx`.

### [2026-05-25 06:51]: Ordinamento e Data Automatica Preventivi
* *Details*: Aggiunto l'ordinamento cronologico per data di emissione (dal più vecchio al più recente) nella lista dei preventivi in `src/pages/preventivi.tsx`. Ora la data viene assegnata automaticamente al momento dell'inserimento rapido se non specificata dall'utente.

### [2026-05-25 06:55]: Filtri per Ramo sui Sinistri
* *Details*: Aggiunto un selettore dinamico a `badge/pills` sotto la barra di inserimento rapido in `src/pages/sinistri.tsx`. Il selettore mostra automaticamente tutti (e solo) i rami in cui è presente almeno un sinistro attivo, permettendo di filtrare l'elenco. Rimosso il badge statico del ramo all'interno delle card dei sinistri per evitare ridondanze visive e migliorare il layout.

### [2026-05-25 08:56]: Miglioramento Estetica Date Picker
* *Details*: Aggiornato l'aspetto visivo del calendario (Date Picker) per renderlo più grande, leggibile e professionale.
* *Tech Notes*:
  - Modificato `artifacts/gestionale/src/components/ui/calendar.tsx` incrementando la dimensione delle celle (`--cell-size: 3.25rem`), l'altezza dei bottoni di navigazione, i font (titolo del mese, giorni della settimana e numeri dei giorni), oltre ad aumentare la smussatura dei bordi e la spaziatura generale.

### [2026-05-25 06:57]: Rimozione opzione Tutti in filtri sinistri
* *Details*: Rimossa la possibilità di selezionare l'opzione Tutti nei filtri dei sinistri. Ora viene automaticamente selezionato di default il primo ramo disponibile tra quelli attivi, in modo da avere sempre un contesto specifico visualizzato.

### [2026-05-25 06:59]: Ridisegno Selettore Rami Sinistri
* *Details*: Sostituito il layout a `badge/pills` del selettore dei rami dei sinistri con un componente `segmented control` dal design premium e moderno. Il nuovo componente sfrutta un contenitore in glassmorphism (backdrop-blur-lg) con angoli smussati e ombreggiature interne. Il ramo selezionato è evidenziato con uno sfondo solido tramite posizionamento assoluto negativo e ombre tenui, garantendo transizioni fluide e un'estetica all'avanguardia in linea con le interfacce iOS/macOS di ultima generazione.

### [2026-05-25 09:00]: Risoluzione Layout Giorni Calendario
* *Details*: Corretto l'allineamento e la leggibilità dei giorni della settimana nel calendario (Date Picker), risolvendo il problema dei testi sovrapposti e non incolonnati.
* *Tech Notes*:
  - Modificato `artifacts/gestionale/src/components/ui/calendar.tsx`: aggiunto il gap (`gap-1.5`) alla riga dei giorni (`weekdays`) per rispecchiare quello delle celle dei giorni, forzato la larghezza di ogni singola intestazione (`w-[--cell-size]`), e impostato l'iniziale singola (L, M, M, G, V, S, D) tramite `formatWeekdayName` per un look molto più pulito e professionale.
  - Sincronizzate le modifiche su `artifacts/mockup-sandbox/src/components/ui/calendar.tsx`.

### [2026-05-25 09:03]: Restyling Mega Premium del DatePicker
* *Details*: Implementato un nuovo design super, mega, iper professionale per il componente Date Picker, utilizzando glassmorphism, gradienti interattivi per le selezioni, ombre colorate dinamiche, bordi luminosi e animazioni morbide al passaggio del mouse e al click. I contenitori popover (Dropdown) in tutta l'app sono stati aggiornati per permettere al calendario di mostrare il proprio layout arrotondato premium senza conflitti visivi.
* *Tech Notes*:
  - Riscritto completamente `src/components/ui/calendar.tsx` con classi Tailwind avanzate (`backdrop-blur-3xl`, gradienti, pseudo-elementi per glow effect decorativi).
  - Sostituite dinamicamente le classi Tailwind in `attivita.tsx`, `polizze-personali.tsx`, `preventivi.tsx` e `sinistri.tsx` per inserire `border-none bg-transparent shadow-none` nel `PopoverContent` dedicato ai calendari.

### [2026-05-25 09:19]: Ottimizzazione Dimensioni e Allineamento DatePicker
* *Details*: Il Date Picker è stato ingrandito di oltre il doppio (le celle passano da 2.8rem a 5rem su schermi desktop) con tipografia maggiorata (testi fino a 40px) per una leggibilità e un colpo d'occhio estremo. Inoltre è stato risolto il difetto di disallineamento della griglia dei giorni della settimana, rimuovendo il flex-box forzato a favore di un perfetto table-layout nativo, così che ogni lettera corrisponda esattamente alla propria colonna numerica sottostante. Le frecce di navigazione non si sovrappongono più al mese, avendo definito un pointer-events corretto e un padding orizzontale al titolo.
* *Tech Notes*:
  - Modificato `calendar.tsx`: aumentate grandezze di cella `--cell-size`, `font-size` e raggio delle smussature.
  - Rimosso `flex` dalle righe di intestazione (`weekdays`) e settimana (`week`) ripristinando il corretto allineamento tabellare (`table-row`).
  - Aggiunto `pointer-events-none` al container di navigazione con `pointer-events-auto` sui bottoni per evitare overlap fisici con il click del mese.

### [2026-05-25 09:23]: Fix Bordo Quadrato Giorno Odierno
* *Details*: Corretto un difetto visivo in cui il giorno corrente (today) veniva evidenziato con un bordo quadrato. Il problema derivava dal fatto che react-day-picker applicava la classe direttamente alla cella della tabella (td) anziché al bottone circolare interno.
* *Tech Notes*:
  - Modificato `calendar.tsx` per rimuovere le classi estetiche dal selettore `today` di default.
  - Spostata la logica condizionale all'interno di `CalendarDayButton` intercettando `modifiers.today` e applicando un selettore custom `data-[today=true]` al componente `<Button>`, assicurando che il bordo e i glow seguano perfettamente il `rounded-full` del bottone stesso.

### [2026-05-25 09:25]: Riduzione Dimensioni DatePicker del 20%
* *Details*: Il cliente ha richiesto una lieve riduzione delle dimensioni complessive per non occupare eccessivo spazio visivo, mantenendo però l'esperienza di utilizzo premium.
* *Tech Notes*:
  - Modificate le custom properties Tailwind `--cell-size` riducendole da 5rem a 4rem (schermo desktop) e da 4.2rem a 3.4rem (mobile).
  - Scalata proporzionalmente la tipografia del calendario: il titolo del mese passa a 32px (da 40px), l'intestazione dei giorni a 14px e i numeri da cliccare a 20px (da 24px).
  - Ridotti leggermente i padding generali del contorno glass e il raggio di smussamento per mantenere le proporzioni intatte (es. radius da 3rem a 2.5rem, padding da 10 a 8).
- [2026-05-25 09:30:00]: Raggruppamento Attività per Data
  - *Details*: È stato aggiunto un separatore visivo nella pagina 'Da Fare' (`attivita.tsx`) che raggruppa le attività in base alla loro data di scadenza. Questo migliora l'organizzazione visiva mostrando la data in maiuscolo (es. 'OGGI - 25 MAGGIO 2026') al posto del precedente testo generico.
  - *Tech Notes*: Modificato `src/pages/attivita.tsx`. Aggiunto raggruppamento basato su `task.dueDate` sfruttando le date preesistenti (le attività erano già ordinate per data). Aggiunto l'uso di `React.Fragment`.

- [2026-05-25 09:34:00]: Rimozione badge data
  - *Details*: È stato rimosso il badge della data dalle singole card delle attività, in quanto ora le attività sono raggruppate visivamente per data tramite il separatore.
  - *Tech Notes*: Modificato `src/pages/attivita.tsx`, rimosso il blocco di rendering della data all'interno del `CardContent`.

- [2026-05-25 09:35:00]: Aggiornamento Stile Filtri Attività
  - *Details*: Aggiornato lo stile dei pulsanti di filtro ('Oggi', 'Questa settimana', 'Scadute') nella pagina 'Da Fare' (`attivita.tsx`) per renderlo uniforme con il selettore dei filtri per ramo presente nella pagina dei sinistri.
  - *Tech Notes*: Modificato il container dei filtri in `src/pages/attivita.tsx` per utilizzare uno stile a pillole (`rounded-xl`) con sfondo traslucido e ombreggiatura interna, rimuovendo lo stile precedente basato sui componenti standard Button.

- [2026-05-25 10:20:00]: Rinominazione 'Incendio e Scoppio' in 'Incendio'
  - *Details*: Semplificata l'interfaccia utente nella pagina dei sinistri rimuovendo 'e Scoppio' dal ramo assicurativo.
  - *Tech Notes*: Aggiornate le opzioni del componente `Select` in `src/pages/sinistri.tsx` modificando il valore e la label da 'Incendio e Scoppio' a 'Incendio'.

- [2026-05-25 10:25:00]: Aggiunta ramo 'Furto'
  - *Details*: Aggiunto il ramo 'Furto' nella pagina dei sinistri per completare le opzioni assicurative.
  - *Tech Notes*: Aggiunte le opzioni `SelectItem` per 'Furto' nei menu a tendina in `src/pages/sinistri.tsx`.

- [2026-05-25 10:50:00]: Allineamento centrale filtro rami Sinistri
  - *Details*: Centrato orizzontalmente il selettore dei filtri per i rami nella pagina dei sinistri, per migliorare il layout visivo e mantenere l'armonia con il resto della pagina.
  - *Tech Notes*: Aggiunto un container wrapper con classi Tailwind `flex justify-center w-full mb-6` attorno al contenitore dei filtri in `src/pages/sinistri.tsx`.

- [2026-05-25 10:55:00]: Aggiunta filtro stato Sinistri
  - *Details*: Aggiunto un secondo livello di filtro per lo stato del sinistro (es. 'Da aprire', 'Incaricato', ecc.) sotto al filtro dei rami, garantendo un'interfaccia utente professionale e moderna.
  - *Tech Notes*: Aggiunto lo stato `selectedStatus`, la logica di filtering in cascata e un componente UI compatto con stile a pillole in `src/pages/sinistri.tsx`.

- [2026-05-25 11:00:00]: Raggruppamento Sinistri per Stato e Data
  - *Details*: Rimosso il badge della data dalle singole card dei sinistri e introdotto un sistema di raggruppamento visivo. I sinistri sono ora ordinati prima per stato e poi per data, e raggruppati con un elegante separatore testuale in formato "STATO - DATA".
  - *Tech Notes*: Riscritto l'ordinamento in `activeClaims` per dare priorità a `statusOrder`. Modificato il loop `.map` dei claim in `sinistri.tsx` iniettando `React.Fragment` e un `div` con bordi superiori che renderizza `groupKey` come separatore visivo quando rileva un cambio rispetto all'elemento precedente.

- [2026-05-25 11:05:00]: Rimozione opzione "Tutti gli stati"
  - *Details*: Eliminato il pulsante "Tutti gli stati" dalla barra di filtro dei sinistri. I pulsanti di stato rimanenti funzionano ora come toggle (cliccando su uno stato attivo, questo viene deselezionato ripristinando la vista di tutti gli stati).
  - *Tech Notes*: Aggiornato lo stato iniziale di `selectedStatus` a `null` e modificata la funzione `onClick` per alternare `null` e il valore selezionato.

- [2026-05-25 11:10:00]: Feedback visivo stati vuoti nei Sinistri
  - *Details*: Resi meno leggibili (con opacità ridotta) i filtri di stato che non contengono alcun sinistro per il ramo attualmente selezionato. Questo migliora l'UX facendo capire a colpo d'occhio quali stati sono vuoti.
  - *Tech Notes*: Aggiunto conteggio dinamico per ogni `statusOptions` e applicate le classi Tailwind `opacity-40 saturate-50 hover:opacity-60` per attenuare visivamente i bottoni che hanno `count === 0` e non sono attualmente selezionati.

- [2026-05-25 13:45:00]: Modulo Aggiunta Attività sempre visibile (Fixed)
  - *Details*: A seguito di una revisione, il modulo di aggiunta rapida delle attività su mobile è stato modificato da `sticky` a `fixed`. Ora rimane sempre "ancorato" esattamente sopra la barra di navigazione inferiore dell'app, in sovrimpressione, garantendo che sia costantemente accessibile senza dover mai scorrere, offrendo un'esperienza 100% nativa.
  - *Tech Notes*: Modificato il layout in `attivita.tsx`. Sostituito `sticky bottom-0` con `fixed md:sticky bottom-[calc(4.5rem+env(safe-area-inset-bottom))]` calcolando dinamicamente l'altezza esatta della bottom bar mobile. Aggiunto `pb-32` al contenitore principale delle liste su mobile per garantire che l'ultima card possa scorrere completamente fino a mostrarsi sopra il form fixed senza rimanere nascosta.

- [2026-05-25 13:51:00]: Ottimizzazione UI Mobile pagina Polizze Personali
  - *Details*: Replicato il design della pagina Attività sulla pagina delle Polizze Personali con Separatori per Data. Il form di aggiunta rapida è stato riprogettato come un **Floating Action Button (FAB)** in basso a destra. Il `Dialog` (modale) che si apre dal FAB è stato poi ulteriormente **ottimizzato con un design ultra-premium**: header con gradiente e icona centrale, background dei campi ammorbidito (`bg-muted/30`) ed inserimento di icone vettoriali (`lucide-react`) all'interno di ogni singolo input (Utente, Scudo, Carta di Credito, ecc.) per una UX strabiliante.
  - *Tech Notes*: Modificato il layout in `polizze-personali.tsx`. Riscritto `renderQuickAdd` come `<Dialog>` con FAB. Ottimizzati tutti gli `Input` e `SelectTrigger` inserendo le icone assolute con `pl-9` per lo spazio, allineando l'interfaccia agli standard di usabilità più moderni. Aggiunti nuovi import per le icone `User, Shield, CreditCard, FileText, Landmark`.

- [2026-05-25 14:16:00]: Ottimizzazione Layout Aggiunta Rapida Sinistri
  - *Details*: L'architettura "Fixed Bottom Grid" ultra-compatta (collaudata con successo nella pagina Preventivi) è stata estesa anche alla pagina dei Sinistri. Su mobile, il form di aggiunta è sempre visibile in fondo, comodissimo da usare e denso di informazioni senza nessuno scroll orizzontale. Inoltre, **i selettori "Ramo" e "Stato" sono stati invertiti** per logica d'inserimento: lo Stato condivide la riga con la Data, mentre il Ramo condivide la riga con le Note, occupando ora uno spazio orizzontale calcolato al millimetro per non sprecare vuoti inutili nell'interfaccia.
  - *Tech Notes*: Riadattato `sinistri.tsx`: il container del form di aggiunta (`renderQuickAdd`) è ora in una posizione `fixed` con classe `pointer-events-none` ed interno `pointer-events-auto` per non bloccare lo scroll retrostante. La root del componente ha un `pb-32` per permettere ai sinistri di scorrere fino all'ultimo record. Il layout comprende 3 righe per il form: Nome, Stato+Data (grid), Ramo+Note (flex). La riga in flex riduce drasticamente l'ingombro del Select `Ramo` (`w-[105px]`), dedicando il resto dello spazio all'Input delle Note (`flex-1`).

- [2026-05-25 14:14:00]: Ottimizzazione Tastierino Mobile per Campi Valuta
  - *Details*: Migliorata drasticamente l'esperienza di inserimento (Data Entry) da smartphone: quando un utente seleziona il campo "Premio" in qualsiasi schermata di aggiunta/modifica (Preventivi, Polizze), si aprirà immediatamente il **tastierino numerico/valutario** nativo del telefono (con numeri giganti e supporto ai decimali) invece della classica e scomoda tastiera alfabetica completa.
  - *Tech Notes*: Modificati `preventivi.tsx` e `polizze-personali.tsx`. Aggiunto nativamente l'attributo `inputMode="decimal"` combinato al `type="number"` a tutti i tag `<Input>` destinati agli importi, per intercettare il comportamento iOS/Android e bypassare il comportamento standard dei form.

- [2026-05-25 14:12:00]: Ottimizzazione Layout Aggiunta Rapida Preventivi (Senza Scroll)
  - *Details*: Aggiornata la pagina dei Preventivi implementando un layout di aggiunta rapida fisso in basso (come in Attività) ma **estremamente ottimizzato a griglia**. Il modulo è stato riorganizzato in un blocco compatto che, su mobile, impila gli input su 3 righe perfettamente bilanciate (Nome+Tasto, Tipo+Data, Premio+Note). In questo modo tutti e 5 i campi sono immediatamente visibili e utilizzabili fin dal primo istante, senza necessitare di alcuno scroll laterale, pur occupando un'altezza minima!
  - *Tech Notes*: Modificato `preventivi.tsx`. Spostato `renderQuickAdd` fuori dal flusso normale (ora in fondo) e racchiuso nel container fixed glassmorphism. Il layout del form usa una combinazione di `flex-col`, `grid-cols-2` e `grid-cols-3` per accomodare i vari `Select`, `Popover` e `Input`. Su schermi desktop il layout collassa intelligentemente in un'unica singola riga fluida orizzontale (`md:flex-row`). Aggiunto adattamento flex al container principale della pagina per permettere lo scorrimento della lista dietro il form fisso.

- [2026-05-25 14:08:00]: Ottimizzazione Layout Aggiunta Rapida Preventivi
  - *Details*: Aggiornata la pagina dei Preventivi implementando un layout di aggiunta rapida fisso in basso (come in Attività) ma **estremamente ottimizzato per gli spazi ridotti**. Il modulo è stato riorganizzato in un blocco compatto che, su mobile, prevede una prima riga con il nome cliente e il tasto salva, seguita da una sottile barra scorrevole orizzontalmente (scroll invisibile) contenente i dettagli extra (Data, Tipo, Premio, Note). In questo modo occupa solo una frazione dello schermo mantenendo tutte le funzionalità!
  - *Tech Notes*: Modificato `preventivi.tsx`. Spostato `renderQuickAdd` fuori dal flusso normale (ora in fondo) e racchiuso nel container fixed glassmorphism. Il layout del form usa una combinazione di `flex-col` e `overflow-x-auto hide-scrollbar` per accomodare i vari `Select`, `Popover` e `Input` in una singola riga scrollabile sotto al campo "Nome Cliente". Aggiunto anche l'adattamento flex al container principale della pagina per permettere lo scorrimento della lista dietro il form fisso.


### [2026-05-25 15:53]: Rimozione Limite Data Preventivi
* *Details*: Rimossa la limitazione che impediva di selezionare una data passata (retro-datare) nel calendario dei preventivi. La data può ora essere impostata liberamente.
* *Tech Notes*:
  - Modificato `src/pages/preventivi.tsx`.
  - Aggiunta la prop `disabled={false}` ai due componenti `<Calendar>` (form di inserimento rapido e dialog di modifica) per bypassare la logica globale che disabilita le date antecedenti ad oggi.

### [2026-05-25 16:00]: Ottimizzazione Layout Quick Add su Desktop
* *Details*: Spostata la barra di aggiunta rapida (Quick Add) nella parte superiore della pagina per gli utenti Desktop in tutte le schermate (Sinistri, Preventivi, Attività). Precedentemente era fissa in basso, una scelta ottima per l'uso mobile ma scomoda su schermi ampi. Ora il layout si adatta dinamicamente in base al dispositivo utilizzato: in basso per gli smartphone, in alto (subito sotto il titolo) per i laptop.
* *Tech Notes*:
  - Modificati i file `src/pages/sinistri.tsx`, `src/pages/preventivi.tsx` e `src/pages/attivita.tsx`.
  - Le classi CSS della barra sono state aggiornate da `fixed md:sticky md:bottom-6` a `fixed md:static md:bottom-auto` in modo che il contenitore fluisca naturalmente nel DOM su desktop, rimanendo fisso in basso (`bottom-[calc(...)]`) solo su mobile.
  - Spostati i blocchi `{renderQuickAdd()}` e i rispettivi tag `<form>` subito dopo l'header testuale principale (`h1`) invece che in calce al componente.

### [2026-05-25 16:01]: Aggiunta Spaziatura Barra Inserimento Rapido su Mobile (PWA)
* *Details*: Perfezionato il posizionamento della barra di inserimento rapido sulle viste mobile (PWA) nelle schermate Sinistri, Preventivi e Attività. Inizialmente la barra presentava un gap troppo ampio che permetteva di intravedere i contenuti sottostanti, dovuto a una mancata risoluzione della funzione `calc` di Tailwind e al padding. Ora è stata incollata con precisione millimetrica.
* *Tech Notes*:
  - Modificati i wrapper in `sinistri.tsx`, `preventivi.tsx` e `attivita.tsx` per usare l'ancoraggio assoluto e garantito `bottom-[calc(64px+env(safe-area-inset-bottom))]`, corrispondente all'altezza precisa della navbar misurata in pixel, bypassando l'uso imperfetto dei `rem` in questo caso specifico.
  - Rimosso qualsiasi padding inferiore (`pb-0`) dal container per posizionare il box di input letteralmente in appoggio immediato ("immediatamente sopra") alla navigation bar, creando un'esperienza solida e continua senza fastidiosi spazi intermedi.

### [2026-05-25 16:13]: Fix Gap Bottom Sheet su Mobile
* *Details*: Abbassato l'elemento floating di 'Quick Add' (inserimento rapido) nelle pagine Sinistri e Attività in modo che si appoggi perfettamente alla barra di navigazione inferiore (Bottom Navigation) sulle PWA, rimuovendo il gap antiestetico.
* *Tech Notes*:
  - Modificato `sinistri.tsx` e `attivita.tsx` riducendo il valore di `bottom-[calc()]` da 64px a 56px per compensare correttamente le spaziature della nav bar mobile.

### [2026-05-25 16:15]: Fix Gap Bottom Sheet su Mobile (Further tweak)
* *Details*: Abbassato ulteriormente l'elemento floating di 'Quick Add' nelle pagine Sinistri, Attività e Preventivi per farlo aderire ancora meglio alla Bottom Navigation.
* *Tech Notes*:
  - Modificati i valori di `bottom-[calc()]` da 56px a 48px nei rispettivi file.

### [2026-05-25 16:18]: Ottimizzazione Premium PWA Dashboard
* *Details*: Aggiornata la UI della schermata Home (Dashboard) per massimizzare l'esperienza nativa PWA su smartphone.
* *Tech Notes*:
  - Modificato `dashboard.tsx` introducendo animazioni tattili (touch-feedback) fluide con `active:scale-[0.96]` e `active:scale-[0.98]` su tutte le card e le liste.
  - Introdotto un design 'Glassmorphism' (`bg-card/80 backdrop-blur-sm border-border/50`) coerente con i trend iOS recenti per i widget e i contenitori di lista.
  - Arrotondati gli angoli principali in stile widget (`rounded-[1.25rem]`) specifici per la visualizzazione mobile.

### [2026-05-25 16:25]: Fix Overflow Orizzontale Liste Dashboard
* *Details*: Risolto un bug visivo in cui testi lunghi nei box 'Prossime scadenze' e 'Attività urgenti' spingevano il badge della data fuori dai margini della card, causando uno strabordamento orizzontale.
* *Tech Notes*:
  - Aggiunta la classe `flex-1` ai container di testo interni (`min-w-0`) in `dashboard.tsx` per forzarli a rispettare i confini del flexbox padre e abilitare il corretto funzionamento del troncamento CSS (`truncate`).

### [2026-05-25 16:27]: Fix Definitivo Overflow PWA su Dispositivi Mobili
* *Details*: Risolto definitivamente il problema dello scroll orizzontale inatteso (pagina che 'balla' lateralmente) nella Dashboard e nell'intera PWA. La causa era la mancanza di vincoli strutturali sulle grid e sui flex-item annidati, unita all'assenza di un blocco di overflow sulla shell principale.
* *Tech Notes*:
  - Aggiunto `min-w-0` al grid container principale in `dashboard.tsx` e al root div di `SectionList`.
  - Impostato `flex-wrap` e `min-w-0 flex-1` sull'header di `SectionList` per permettere al titolo lungo di troncarsi anziché forzare l'allargamento della pagina.
  - Modificato `shell.tsx`: il tag `<main>` usa ora `overflow-x-hidden overflow-y-auto` invece del generico `overflow-auto`, rendendo letteralmente impossibile lo scorrimento orizzontale dell'intera PWA e bloccando ogni comportamento anomalo su iOS/Android.

### [2026-05-25 16:32]: Riorganizzazione Layout Desktop (Attività)
* *Details*: Spostata la barra di ricerca e i filtri rapidi SOPRA la barra di 'Aggiunta Rapida' nella pagina delle Attività.
* *Tech Notes*:
  - Modificato l'ordine nel DOM di `attivita.tsx`: il blocco di ricerca è stato anticipato rispetto al form di inserimento. Su Desktop, questo fa apparire la ricerca in cima alla lista. Su Mobile, l'inserimento rimane ancorato in basso grazie alle classi `fixed bottom-...` preesistenti.

### [2026-05-25 16:35]: Riorganizzazione Definitiva Layout Desktop (Attività)
* *Details*: Aggiornata la disposizione degli elementi nella pagina Attività per rispettare l'ordine richiesto su Desktop.
* *Tech Notes*:
  - Separati i blocchi di Ricerca, Inserimento Rapido e Filtri in nodi distinti nel DOM.
  - La Barra di Ricerca ora occupa il 100% della larghezza (`w-full`) ed è posizionata in cima.
  - La Barra di Aggiunta si trova al centro, mantenendo il layout grafico preesistente (`max-w-4xl mx-auto`).
  - Il Selettore dei Filtri si trova ora in basso, sotto l'inserimento rapido.

### [2026-05-25 16:38]: Ripristino Barra Inserimento Rapido Desktop (Polizze Personali)
* *Details*: Sostituito il FAB (Floating Action Button) circolare con la barra di inserimento in linea per la versione Desktop, mantenendo intatta l'esperienza su mobile (PWA).
* *Tech Notes*:
  - Aggiunta la classe `md:hidden` al trigger del Dialog del FAB per nasconderlo su schermi grandi.
  - Creata la funzione `renderDesktopQuickAdd` che genera un form `hidden md:block` con tutti i campi necessari per un inserimento rapido in linea.
  - Il nuovo form desktop è stato posizionato in cima ai due pannelli dei `TabsContent` ('in-scadenza' e 'da-emettere').

### [2026-05-25 19:33]: Aggiornamento Stati Preventivi
* *Details*: Aggiornati gli stati dei preventivi da 'da_fare', 'trattativa_in_corso', 'fatto' a 'da_fare', 'consegnato', 'accettato'. Lo stato 'accettato' ora comporta l'eliminazione del preventivo quando confermato.
* *Tech Notes*:
  - Modificato `src/lib/preventivi-store.ts` per aggiornare i tipi dello stato.
  - Modificato `src/pages/preventivi.tsx` per riflettere i nuovi stati nei menu a tendina, nei badge e nella logica di eliminazione/salvataggio.
  - Modificato `src/pages/dashboard.tsx` per escludere i preventivi in stato 'accettato' invece di 'fatto'.

### [2026-05-25 19:35]: Rimozione Badge Data e Aggiunta Separatori su Preventivi
* *Details*: Rimossa l'etichetta (badge) della data all'interno delle card dei preventivi. È stata invece implementata la tecnica dei "separatori di gruppo" (come sui Sinistri) che raggruppa dinamicamente i preventivi emessi nello stesso giorno sotto un'unica intestazione testuale con data in maiuscolo (es: '25 MAGGIO 2026'), pulendo ulteriormente l'interfaccia delle singole card.
* *Tech Notes*:
  - Modificato `src/pages/preventivi.tsx`: implementato `React.Fragment` e inserita la logica di calcolo di `showSeparator` e `groupKey` per renderizzare i divisori grafici tra i gruppi di date.

### [2026-05-25 19:37]: Aggiunta Filtro Stati sui Preventivi
* *Details*: Aggiunto un selettore in alto (simile a quello per i rami nei sinistri) che permette di filtrare i preventivi visibili. Mostra esclusivamente le 2 voci: 'Da Fare' e 'Consegnati'. I preventivi 'Accettati' non sono in elenco, come previsto dalle direttive precedenti. Questo filtro segmentato migliora la ricerca e la visibilità globale dei documenti da gestire.
* *Tech Notes*:
  - Modificato `src/pages/preventivi.tsx`: aggiunta variabile di stato `selectedStatus` ('da_fare' | 'consegnato') e applicato il filter() sull'array dei `preventivi`. Aggiunto componente grafico a segmenti.

### [2026-05-25 19:38]: Aumento Spaziatura Filtro Preventivi
* *Details*: Aumentato lo spazio inferiore (margin-bottom) del selettore dei filtri nella pagina dei preventivi da `mb-1` a `mb-6` per renderlo più arioso e allineato con le proporzioni del resto dell'interfaccia.

### [2026-05-25 19:40]: Fix Bug Grafico Header Mobile
* *Details*: Risolto il bug di posizionamento dell'icona della dark mode (luna/sole) nella top bar mobile. A causa di una classe `mx-auto` sfuggita, l'icona risultava innaturalmente spostata verso il centro. Rimuovendo il margine automatico, ora l'icona si allinea correttamente all'estrema destra della barra, sfruttando il `justify-between`.
* *Tech Notes*: Modificato `src/components/layout/shell.tsx`, aggiornando `ThemeToggle` per accettare `className` e isolando la classe `mx-auto` solo nella sidebar.

### [2026-05-25 19:43]: Ottimizzazione Interfaccia Card Preventivi
* *Details*: Rimossi i badge informativi sullo stato dei preventivi dalle singole card, poiché ora lo stato si deduce logicamente dal filtro principale (segment) correntemente selezionato, garantendo un'interfaccia molto più pulita. Inoltre, il pulsante principale delle card ora si adatta in modo dinamico: se si sta visualizzando 'Da Fare', diventerà 'Consegnato' e servirà a far avanzare lo stato del documento; se si è su 'Consegnati', il pulsante mostrerà 'Accettato' ed eliminerà il preventivo.
* *Tech Notes*: Modificato `src/pages/preventivi.tsx`: eliminato interamente `renderStatusBadge()` e applicato un operatore ternario al `<Button>` di accettazione/consegna, reattivo al `selectedStatus`.

### [2026-05-25 19:45]: Riposizionamento e Restyling Filtro Polizze Personali
* *Details*: Nella pagina delle polizze personali (desktop) ho eliminato i vecchi 'Tabs' nativi per la navigazione 'In scadenza' / 'Da emettere', sostituendoli con un selettore custom identico a quello elegante appena sviluppato per i preventivi.
* *Tech Notes*: Ristrutturato il layout in `src/pages/polizze-personali.tsx`. Il componente `renderDesktopQuickAdd` (la barra di inserimento rapido) è stato spostato *sopra* al nuovo selettore, mentre l'alternanza della lista è ora gestita tramite un singolo stato `selectedTab`.

### [2026-05-25 19:46]: Contatore Dinamico su Filtro Preventivi
* *Details*: Ho aggiunto il conteggio dinamico per ogni categoria all'interno del selettore della dashboard preventivi (es. 'Da Fare ( 10 )' e 'Consegnati ( 5 )'), consentendo così una visione immediata del carico di lavoro.
* *Tech Notes*: Modificato `src/pages/preventivi.tsx` per interpolare dinamicamente le label del `filterOptions` sfruttando `preventivi.filter().length`.

### [2026-05-25 19:47]: Contatore Dinamico su Filtro Attività
* *Details*: Aggiunto il conteggio dinamico dei task aperti ai filtri di ricerca rapida ('Oggi', 'Questa settimana', 'Scadute') presenti nella dashboard delle attività, mantenendo la coerenza grafica con la sezione preventivi.
* *Tech Notes*: Aggiunta la funzione `getTasksCount` nel file `src/pages/attivita.tsx`.

- [2026-05-25 19:50]: Fix preventivi counter discrepancy
  - *Details*: The dashboard counted all preventivi that were not "accettato", while the preventivi page exclusively listed and counted those with status exactly equal to "da_fare". This caused older records or records with undefined status to be missing from the list.
  - *Tech Notes*: Updated the `filteredPreventivi` and `filterOptions` logic in `preventivi.tsx` so that the "da_fare" tab acts as a fallback catching all items that are not "consegnato" and not "accettato", which mirrors the dashboard logic.

- [2026-05-25 19:51]: Allow past dates in sinistri quick add calendar
  - *Details*: Disabled the default restriction that prevented users from selecting dates before today in the Date Picker for the Sinistri quick add form.
  - *Tech Notes*: Added the `disabled={() => false}` prop to the `Calendar` component in `/artifacts/gestionale/src/pages/sinistri.tsx` to override the `defaultDisabled` logic defined in the reusable `calendar.tsx` component.

- [2026-05-26 18:00]: Aggiornamento README con Screenshot e Riorganizzazione Sezioni
  - *Details*: Aggiornato il file `README.md` principale introducendo i link relativi agli screenshot per ciascuna delle 5 pagine principali del gestionale e per la pagina di login. Riorganizzate le sezioni delle funzionalità principali per rispecchiare fedelmente la struttura attuale dell'applicazione (Dashboard, Polizze Personali, Preventivi, Sinistri, Attività) e creato il supporto alla cartella centralizzata per gli screenshot.
  - *Tech Notes*:
    - Modificato `README.md` per referenziare le immagini all'interno della cartella `docs/screenshots/`.
    - Creata la cartella fisica `docs/screenshots/` alla radice della repository.
    - Aggiornato il file `TO_SIMO_DO.md` per istruire l'utente sul corretto salvataggio manuale dei file delle immagini.


- [2026-06-04 22:47]: Filtro "Tutte" nella pagina Sinistri
  - *Details*: Aggiunto un pulsante "Tutte" nella gestione dei sinistri che permette di vedere tutti i tipi di sinistro contemporaneamente. Quando selezionato, l'elenco dei sinistri viene raggruppato esclusivamente per Tipologia di Sinistro (Ramo) ignorando i raggruppamenti per Data/Stato utilizzati nelle singole viste ramo.
  - *Tech Notes*: Modificati i criteri di ordinamento di `activeClaims` in `sinistri.tsx` per eseguire un raggruppamento per ramo quando `selectedRamo` corrisponde a "Tutte". Aggiunta opzione "Tutte" all'array dei bottoni.
