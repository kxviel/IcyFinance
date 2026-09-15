#!/usr/bin/env bash
set -euo pipefail

usage() {
    cat <<'HELP'
Usage: pnpm arch

Build IcyFinance and create a local x86_64 Arch package in packaging/arch/.
Requires pnpm, Rust, makepkg, and Tauri's Linux build dependencies.
HELP
}

case "${1:-}" in
    -h|--help) usage; exit 0 ;;
    '') ;;
    *) usage >&2; exit 2 ;;
esac
if (( $# > 0 )); then usage >&2; exit 2; fi

fail() { printf 'Error: %s\n' "$*" >&2; exit 1; }
[[ $EUID -ne 0 ]] || fail 'Run as a regular user; makepkg cannot run as root.'
[[ $(uname -s) == Linux && $(uname -m) == x86_64 ]] || fail 'Only x86_64 Linux is supported.'
for required in node pnpm cargo makepkg rg; do
    command -v "$required" >/dev/null || fail "Required command missing: $required"
done

arch_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
root_dir="$(cd -- "$arch_dir/../.." && pwd)"
cd -- "$root_dir"
[[ -f src/main.tsx && -f src-tauri/src/lib.rs ]] || fail 'Application sources are missing.'

version="$(node -p 'require("./package.json").version')"
[[ $version =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]] || fail "Unsupported Arch package version: $version"
pkgver="$(sed -n 's/^pkgver=//p' "$arch_dir/PKGBUILD")"
[[ $version == "$pkgver" ]] || fail "PKGBUILD has $pkgver; package.json has $version. Update both versions before building."

target=x86_64-unknown-linux-gnu
metadata="$(cargo metadata --manifest-path src-tauri/Cargo.toml --no-deps --format-version 1)"
crate_version="$(printf '%s' "$metadata" | node -pe 'JSON.parse(require("fs").readFileSync(0, "utf8")).packages.find(p => p.name === "icyfinance").version')"
[[ $version == "$crate_version" ]] || fail "Cargo.toml has $crate_version; package.json has $version. Update both versions before building."
target_dir="$(printf '%s' "$metadata" | node -pe 'JSON.parse(require("fs").readFileSync(0, "utf8")).target_directory')"
printf 'Building IcyFinance %s…\n' "$version"
pnpm tauri build --no-bundle --target "$target"
binary="$target_dir/$target/release/icyfinance"
[[ -x $binary ]] || fail "Build output not found: $binary"

# These local sources let makepkg run directly from packaging/arch after this script.
install -m755 "$binary" "$arch_dir/icyfinance"
install -m644 "$root_dir/src-tauri/icons/128x128@2x.png" "$arch_dir/icyfinance.png"
cd -- "$arch_dir"
integrity="$(makepkg --geninteg sha256)"
mapfile -t sums < <(printf '%s\n' "$integrity" | rg -o '[0-9a-f]{64}')
[[ ${#sums[@]} -eq 3 ]] || fail 'Could not generate checksums for all three package sources.'
sed -i "s/^sha256sums=.*/sha256sums=('${sums[0]}' '${sums[1]}' '${sums[2]}')/" PKGBUILD
makepkg --printsrcinfo > .SRCINFO
makepkg --force --clean
printf '\nPackage output:\n'
makepkg --packagelist
