#!/usr/bin/env bash
set -euo pipefail

arch_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
root_dir="$(cd -- "$arch_dir/../.." && pwd)"
cd -- "$root_dir"

[[ -f src/main.tsx && -f src-tauri/src/lib.rs ]] || fail 'Application sources are missing.'

# Arch package versions cannot contain hyphens.
version="1.1.0"
pkgver="${version//-/_}"

target=x86_64-unknown-linux-gnu
target_dir="$(cargo metadata --manifest-path src-tauri/Cargo.toml --no-deps --format-version 1 | node -pe 'JSON.parse(require("fs").readFileSync(0, "utf8")).target_directory')"

printf 'Building IcyFinance %s…\n' "$version"
pnpm tauri build --no-bundle --target "$target"
binary="$target_dir/$target/release/icyfinance"
[[ -x $binary ]] || fail "Build output not found: $binary"

# Remove only this run's staging directory; retain previous packages.
stage="$(mktemp -d "$arch_dir/.build.XXXXXX")"
trap 'rm -rf -- "$stage"' EXIT
trap 'exit 130' INT
trap 'exit 143' TERM
install -m755 "$binary" "$stage/icyfinance"
install -m644 "$arch_dir/icyfinance.desktop" "$stage/icyfinance.desktop"
install -m644 "$root_dir/src-tauri/icons/128x128@2x.png" "$stage/icyfinance.png"
sed "s/^pkgver=.*/pkgver=$pkgver/" "$arch_dir/PKGBUILD" > "$stage/PKGBUILD"
cd -- "$stage"
makepkg --geninteg >> PKGBUILD
PKGDEST="$arch_dir" makepkg --force --clean
printf '\nPackage output:\n'
PKGDEST="$arch_dir" makepkg --packagelist
