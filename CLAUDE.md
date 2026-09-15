# IcyFinance — project context for Claude

## What this app is

IcyFinance is a local-first personal finance and envelope-budgeting desktop app.
It is built with React and TypeScript for the UI and Tauri/Rust for the desktop
shell and SQLite persistence.

Users create their own accounts, categories, targets, transactions, transfers,
recurring schedules, and monthly assignments. The overview, budget totals,
account balances, target progress, and reports are calculated from the current
budget document; they are not fixed dashboard values.

New users start with an empty budget. The fictional sample budget is available
only through Settings → Load sample budget.

## Runtime and data flow

```text
Tauri app
  └─ React entrypoint (src/main.tsx)
      └─ TanStack Router
          └─ root route
              ├─ BudgetProvider: loads/saves the BudgetDocument
              ├─ WorkspaceProvider: current month, dialogs, navigation helpers
              └─ AppLayout: header, page outlet, footer, errors/status
```

1. `BudgetProvider` calls the Tauri `load_budget` command when the app starts.
2. If no row exists, it creates an empty document and saves it immediately.
3. The document is held in React state. Feature hooks call `useWorkspace()` and
   update the document through `BudgetProvider`.
4. Every committed change is validated and queued for an atomic SQLite save.
5. `src/lib/budget.ts` contains the domain calculations used by the screens.

The saved document is JSON stored in one SQLite row:

- Database file: `icyfinance.sqlite3`
- Table: `icyfinance_documents`
- Row id: `primary`
- Linux default path: `~/.local/share/com.kxviel.icyfinance/icyfinance.sqlite3`

The SQLite file is local and unencrypted. Do not add network synchronization or
external financial-data access without an explicit product decision.

## Core data model

`src/lib/budget-types.ts` defines `BudgetDocument` and its nested types:

- `accounts`: checking, savings, cash, or tracking accounts with opening balances
- `categories`: envelope categories grouped for the budget; optional targets
- `allocations`: money assigned to a category for a specific month
- `transactions`: income, expenses, transfers, splits, cleared/reconciled flags
- `schedules`: recurring or one-time planned transactions
- `schemaVersion`, `id`, `name`, `currency`, and `updatedAt`: document metadata

Amounts are integer cents. Formatting and parsing are handled by
`src/lib/money.ts`; do not use floating-point arithmetic for stored money.

Important behavior:

- Scheduled transactions do not affect balances until the user clicks **Post**.
- Income with no category goes to **Ready to assign**.
- Transfers are stored once and interpreted across source/destination accounts.
- Tracking-account activity stays outside envelope budgeting.
- Reconciled transactions are protected from edits that would invalidate them.

## Routes and pages

Each file in `src/routes/` is a thin TanStack Router route that renders a page:

- `src/routes/__root.tsx`: global providers, layout, error and not-found handling
- `src/routes/index.tsx`: redirects `/` to `/overview`
- `src/routes/overview.tsx`: Overview route
- `src/routes/budget.tsx`: Budget route
- `src/routes/transactions.tsx`: Transactions route
- `src/routes/accounts.tsx`: Accounts and recurring schedules route
- `src/routes/targets.tsx`: Targets route
- `src/routes/reports.tsx`: Reports route
- `src/routes/settings.tsx`: Settings route
- `src/routeTree.gen.ts`: generated route tree; do not hand-edit

Page components in `src/pages/` compose feature hooks and UI components:

- `Overview.tsx`: dashboard stats, recent transactions, account balances, targets
- `Budget.tsx`: monthly category assignments and envelope balances
- `Transactions.tsx`: transaction register, filters, import, and editing
- `Accounts.tsx`: account management, schedules, posting, and reconciliation
- `Targets.tsx`: category target management and progress
- `Reports.tsx`: reporting views and time-based summaries
- `Settings.tsx`: budget profile, storage status, backups, import, reset/sample data

## State and hooks

### Providers

- `src/components/budget-provider.tsx`: document loading, validation, save queue,
  dirty state, undo history, retry behavior, and Tauri close-save handling
- `src/components/workspace-provider.tsx`: exposes the active month, transaction
  dialog state, and workspace helpers on top of the budget store
- `src/components/theme-provider.tsx`: dark/light/system theme persistence

### Feature hooks

- `use-overview.ts`: derives overview summary, recent transactions, and featured targets
- `use-budget.ts`: category filtering, editing, moving money, and assignments
- `use-transactions.ts`: register filtering, clearing, reconciliation, import, and deletion
- `use-transaction-editor.ts`: transaction form state and validation
- `use-accounts.ts`: account lists, schedules, posting, closing, and reconciliation dialogs
- `use-account-editor.ts`: account form state
- `use-schedule-editor.ts`: recurring transaction form state
- `use-targets.ts`: target list/filter/editor state
- `use-category-editor.ts`: category and target form state
- `use-reports.ts`: report calculations and export actions
- `use-settings.ts`: profile, database status, backups, imports, and replacements
- `use-reconcile-dialog.ts`: reconcile workflow and adjustment transaction handling
- `use-workspace.ts`: access to `WorkspaceProvider`

## Domain and persistence libraries

- `src/lib/budget.ts`: core accounting rules, summaries, balances, targets,
  assignments, transaction updates/deletes, and posting schedules
- `src/lib/budget-types.ts`: TypeScript data structures
- `src/lib/budget-validation.ts`: runtime validation and invariants for loaded/saved documents
- `src/lib/budget-seed.ts`: `createEmptyBudget()` plus opt-in fictional sample data
- `src/lib/storage.ts`: frontend bridge to Rust SQLite commands
- `src/lib/accounts.ts`: account helpers, account kinds, recurring-frequency labels,
  cleared/reconciled account state
- `src/lib/money.ts`: integer-cent parsing, validation, and currency formatting
- `src/lib/dates.ts`: dates, months, month shifting, recurring-date calculations
- `src/lib/backups.ts`: JSON backup/import preparation and export helpers
- `src/lib/transaction-csv.ts`: CSV transaction parsing and export
- `src/lib/budget-validation.ts`: validates schema, ids, amounts, dates, and references
- `src/lib/errors.ts`: consistent error-message extraction
- `src/lib/navigation.ts`: primary navigation metadata
- `src/lib/download.ts`: browser/download helper used by exports
- `src/lib/utils.ts`: shared UI utility exports

## Components

### App shell

- `app-layout.tsx`: page shell, route outlet, status/error handling, command menu
- `header.tsx`: navigation, quick transaction access, responsive menu
- `footer.tsx`: save status and undo control
- `workspace-status.tsx`: desktop/browser storage status messaging
- `workspace-error.tsx`: load/save error screen
- `command-menu.tsx`: keyboard command/search actions
- `month-picker.tsx`: active budget month selector
- `page-heading.tsx`, `section-link.tsx`, `stat.tsx`: shared page presentation
- `empty-state.tsx`, `icon-button.tsx`, `theme-toggle.tsx`: small shared UI pieces

### Feature components

- `components/accounts/`: account list/editor, schedules, recurring editor,
  reconciliation, and account dialogs
- `components/transactions/`: transaction editor and CSV import dialog
- `components/budget/`: category editor, assignment input, move-money dialog,
  and budget provider helpers
- `components/settings/`: storage status, profile, backups, reset/replacement UI

### UI primitives

`src/components/ui/` contains the reusable Base UI/shadcn-style primitives:
buttons, cards, dialogs, fields, inputs, labels, tables, toggles, selects,
checkboxes, separators, textareas, and toast/sonner support. Keep business logic
out of these primitives.

## Rust/Tauri layer

- `src-tauri/src/lib.rs`: Tauri application setup, plugins, managed storage state,
  and command registration
- `src-tauri/src/storage.rs`: SQLite connection lifecycle, schema creation,
  serialized access, JSON validation, load/save, and integrity check commands
- `src-tauri/src/export.rs`: native save-dialog export with atomic file writing
- `src-tauri/src/main.rs`: native entrypoint
- `src-tauri/build.rs`: Tauri build configuration and capability generation
- `src-tauri/capabilities/main.json`: allowed commands/capabilities for the window
- `src-tauri/tauri.conf.json`: app metadata, bundle configuration, and Tauri settings
- `src-tauri/Cargo.toml`: Rust dependencies and bundled rusqlite configuration
- `src-tauri/Cargo.lock`: locked Rust dependency versions
- `src-tauri/icons/`: application icons

Frontend-to-Rust commands:

- `load_budget`: read the primary JSON document
- `save_budget`: validate and upsert the primary JSON document
- `database_status`: run SQLite integrity check and report the file path
- `export_file`: write a user-selected native export file

The browser/Vite version does not provide SQLite storage. Use the Tauri app for
real persistence.

## Styling and generated files

- `src/globals.css`: global CSS, Tailwind theme, layout classes, and design tokens
- `components.json`: UI generator configuration
- `vite.config.ts`: Vite aliases and plugins
- `tsconfig*.json`: TypeScript project configuration
- `biome.json`: formatting and linting configuration
- `public/favicon.svg`: browser/app favicon
- `index.html`: HTML shell
- `routeTree.gen.ts`: generated by the TanStack Router plugin
- `packaging/`: Arch Linux package metadata and bundled packaging assets

Avoid manually editing generated files unless the generator cannot be run.

## Development commands

```bash
pnpm install
pnpm dev                         # Vite frontend only
pnpm tauri dev                   # desktop app with SQLite
pnpm build                       # TypeScript build plus Vite production build
pnpm exec tsc -b --pretty false  # typecheck
pnpm lint                        # Biome lint
pnpm exec biome check .          # formatting/checks
pnpm exec biome format --write . # format
pnpm arch                        # Arch package build
```

There are currently no test files or test runner. At minimum, run typecheck and
Biome checks after TypeScript changes. For storage or Rust changes, also run the
relevant Cargo formatting/check commands when the local Rust toolchain supports it.

## Change guidelines

- Keep all user data-driven values sourced from `BudgetDocument`; do not add
  dashboard fixture values or hardcoded sample records to page components.
- Preserve the empty first-run behavior. Sample data belongs only in the explicit
  sample-data action.
- Route UI through hooks and domain functions rather than duplicating accounting
  calculations in pages.
- Validate every document mutation before saving.
- Use integer cents and existing money/date helpers.
- Keep backups user-controlled and clearly communicate that local JSON/SQLite
  data contains unencrypted financial information.
- Do not delete or reset the SQLite file casually; inspect the target and preserve
  user data unless the user explicitly requests a reset.
