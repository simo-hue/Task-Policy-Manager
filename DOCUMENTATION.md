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

