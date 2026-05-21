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

