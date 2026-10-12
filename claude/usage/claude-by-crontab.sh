#!/bin/bash

# Cron entry point: runs one unattended `claude -p` research loop in this repo,
# gated on usage headroom via ~/.claude/bin/usage-check.js.
#
# Absolute paths are used throughout (node, claude) since cron's PATH won't
# include ~/.local/bin.
set -euo pipefail

# Directory this script lives in, resolved from argv[0] rather than assumed.
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

if ! /usr/bin/node ~/.claude/bin/usage-check.js; then
    echo "Skipping this cycle: usage headroom not available yet." >&2
    exit 0
fi

cd "$SCRIPT_DIR"

PROMPT='Follow CLAUDE.md exactly. Read strategies/state.json first, then either continue the active strategy or start a new one as instructed, complete one full research loop (backtest, report, git commit, Discord notify), then stop.'

/home/mbean/.local/bin/claude -p "$PROMPT" --output-format stream-json --verbose \
  | /usr/bin/node ~/.claude/bin/stream-parser.js
