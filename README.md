# IcyFinance

A local-first desktop app for envelope budgeting. Track accounts and transactions,
assign money to categories, manage recurring payments and targets, and review
spending reports. Built with Tauri, React, TypeScript, and embedded SQLite.

New budgets start empty. Set the budget name and currency in Settings before
adding money; the initial currency is EUR. Existing budgets load as saved.

## Development Requirements
- Node
- Rust

```bash
pnpm i --frozen-lockfile
pnpm tauri dev
```

## Arch Linux package

Build on x86_64 Arch Linux or a compatible distribution. Install `base-devel`,
`webkit2gtk-4.1`, and `librsvg`, alongside pnpm and Rust, then run as a regular user:

```bash
pnpm arch
```

The script builds the release binary without Tauri's platform bundles, checks
that `PKGBUILD` and `package.json` declare the same version, and stages the binary
and 256×256 icon beside `packaging/arch/PKGBUILD`. It generates SHA-256 source
checksums and `.SRCINFO`, then runs `makepkg` there. Previous package versions
are retained; rebuilding the same version replaces its package.

The final output prints the package path under `packaging/arch/`. Install it with:

```bash
sudo pacman -U /path/to/icyfinance-version-1-x86_64.pkg.tar.zst
```

After `pnpm arch`, you can also run `makepkg --force` directly from
`packaging/arch/`. The script must be rerun after changing the app because the
staged binary, checksums, and `.SRCINFO` must match. `pnpm arch --help` lists
requirements. The package compression follows your `makepkg` configuration.

When releasing, update the version in `package.json`, `packaging/arch/PKGBUILD`,
and `src-tauri/Cargo.toml`. The script checks all three before building.

This is a local package. An AUR submission also needs a reachable upstream
source or release URL; the current GitHub URLs are unavailable. Until there is
one, `.SRCINFO` is useful for local validation but the package is not ready to
publish to AUR.

For other native package formats, run `pnpm tauri build` on the target operating
system. Tauri writes bundles under its Cargo target directory, normally
`src-tauri/target/release/bundle/`.

## Storage and closing

SQLite is bundled; no database server or separate SQLite installation is needed.
The app stores `icyfinance.sqlite3` in Tauri's per-user local application data
directory. Settings shows the actual path and can check database integrity.
The default Linux location is:

```text
~/.local/share/com.kxviel.icyfinance/icyfinance.sqlite3
```

Edits are saved automatically in order, using atomic SQLite writes. Closing the
window normally waits for pending saves. If saving fails, the window stays open
and offers a retry. Unsaved form fields must be submitted before closing.
Force-killing the process, terminating the webview, or losing power bypasses the
close handler; edits that have not reached SQLite can be lost.

Settings can export and import JSON backups. Replacing or resetting a budget
exports the current version first. Resetting preserves the selected currency.
Backups and the database contain unencrypted financial data.

## Checks

```bash
pnpm exec tsc -b --pretty false
pnpm lint
pnpm exec biome check .
pnpm test
pnpm build
cargo fmt --manifest-path src-tauri/Cargo.toml --check
cargo clippy --manifest-path src-tauri/Cargo.toml -- -D warnings
```

Domain regression tests use Node’s built-in test runner (Node 22.18+), with no
additional test framework. Fixtures exist only under `tests/`; tests never open
the desktop database.
