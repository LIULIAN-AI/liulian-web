#!/usr/bin/env bash
# dev-linux.sh — boot the real Next.js app on a Linux host whose working copy
# lives on an NTFS / fuseblk mount (the 2026.02.07_liulian working drive).
#
# WHY this exists (card W0-01):
#   The repo's `node_modules` was first installed under Windows pnpm. Its
#   symlinks are Windows "reparse-tag" junctions that are DEAD on Linux, so a
#   plain `pnpm dev` fails with `Cannot find module .../next/dist/bin/next`.
#   On top of that, pnpm's default symlinked virtual store + hardlink import are
#   fragile on a fuseblk mount.
#
# THE FIX (reproducible, no sudo, no Docker):
#   1. Keep the pnpm content-addressable store on ext4 (under $HOME), not NTFS.
#   2. Install with `node-linker=hoisted` -> a FLAT node_modules with NO
#      symlinks (immune to the dead-junction class) and `package-import-method=
#      copy` (safe across the ext4-store -> NTFS-node_modules filesystem hop).
#   3. Run `next dev` with file-watch POLLING, because inotify is not delivered
#      reliably over fuseblk, so HMR would otherwise never fire.
#
# Idempotent: re-running only reinstalls when node_modules is missing or still
# carries dead symlinks. Safe to run from a fresh clone.
set -euo pipefail

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_DIR"

PORT="${PORT:-3000}"
STORE_DIR="${PNPM_STORE_DIR:-$HOME/.cache/liulian-web/pnpm-store}"

have_pnpm() { command -v pnpm >/dev/null 2>&1; }
if ! have_pnpm; then
  echo "ERROR: pnpm not found. Install Node 18+ and pnpm 9 first (corepack enable)." >&2
  exit 1
fi

# A node_modules is "bad" if it is absent, has no next binary, or still contains
# any dead (broken) symlink left over from the Windows install.
needs_install=0
if [ ! -e node_modules/next/dist/bin/next ]; then
  needs_install=1
elif [ -n "$(find node_modules -xtype l -print -quit 2>/dev/null)" ]; then
  echo "Detected dead symlinks in node_modules (Windows install) -> reinstalling." >&2
  needs_install=1
fi

if [ "$needs_install" -eq 1 ]; then
  echo ">> Clean reinstall (hoisted, copy, ext4 store at $STORE_DIR)"
  rm -rf node_modules
  mkdir -p "$STORE_DIR"
  pnpm install --frozen-lockfile \
    --config.node-linker=hoisted \
    --config.package-import-method=copy \
    --store-dir "$STORE_DIR"
fi

echo ">> next dev on :$PORT (file-watch polling for NTFS)"
export WATCHPACK_POLLING=true
export CHOKIDAR_USEPOLLING=true
exec node_modules/.bin/next dev -p "$PORT"
