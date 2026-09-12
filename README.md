# IcyFinance

A local-first personal finance desktop app built with Tauri, React, TypeScript,
TanStack Router, Tailwind CSS, and shadcn/ui (Base UI, base-rhea), managed with pnpm.

## Development

Use a current Node.js LTS release, pnpm (the version pinned in package.json),
and stable Rust with the native [Tauri prerequisites](https://v2.tauri.app/start/prerequisites/)
for your operating system.

```bash
pnpm install
pnpm desktop
```

`pnpm dev` starts only the frontend. SQLite and native file exports require the
desktop app; the browser shows an explanatory screen.

## Storage and portability

SQLite is compiled into the app through rusqlite's bundled feature. Users do not
need PostgreSQL, a database server, a database password, or a separate SQLite installation.

The app creates `icyfinance.sqlite3` in Tauri's per-user local application data
directory. Settings shows the exact location and can check database integrity.
On Linux, the default is:

```text
~/.local/share/com.kxviel.icyfinance/icyfinance.sqlite3
```

The active budget is a validated JSON document in the `icyfinance_documents`
table. Saves are serialized and atomic, and save failures remain visible with a
retry action. An unreadable budget is never silently replaced.

Use Settings to export a JSON backup and import it on another device. Replacing
a budget requires exporting the current version first. Backups and the SQLite
file contain unencrypted financial data: keep them private.

Existing PostgreSQL data is not automatically migrated or deleted. To move an
older budget, export its JSON backup from the previous app and import it in Settings.

## Build and checks

```bash
pnpm typecheck
pnpm exec biome check .
pnpm build
cargo fmt --manifest-path src-tauri/Cargo.toml --check
cargo clippy --manifest-path src-tauri/Cargo.toml -- -D warnings
pnpm desktop:build
```

Build a native package for each target operating system; one binary is not
universal across Windows, macOS, and Linux. Packages are written under
`src-tauri/target/release/bundle/`. SQLite travels with each build. OS webview
and system dependencies still apply.

There are no test files, test runners, or test scripts.

## Project structure

The structure follows the referenced projects, especially SimulationHub's
Tauri/Vite conventions:

- `src/routes/` — thin TanStack file routes.
- `src/modules/<Feature>/` — feature views, colocated hooks, and helpers.
- `src/modules/Workspace/` — budget state, domain logic, validation, and the Tauri API bridge.
- `src/components/` — shared application components.
- `src/components/ui/` — editable [shadcn components](https://ui.shadcn.com/docs/components.md), using Base UI.
- `src/lib/` and `src/hooks/` — small shared utilities and hooks.
- `src/globals.css` — Tailwind entry point, theme tokens, and base styles.
- `src-tauri/src/storage.rs` — embedded SQLite storage.
- `src-tauri/src/export.rs` — native, atomic backup export.

The router plugin generates `src/routeTree.gen.ts`. Add a file in `src/routes/`
and run the dev server or build to regenerate it.
