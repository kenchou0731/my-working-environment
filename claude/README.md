# claude

Personal tooling for Claude Code.

- `skill-mgr.py` — installs the skills kept in this directory into `~/.claude/skills` via symlinks.
- `usage/` — usage-gated unattended `claude -p` runs via cron (see `usage/docs/plan.md`).

## Skills

Each skill lives in its own directory next to `skill-mgr.py` (i.e. under `claude/`):

```
claude/backtest/
├── README.md        # notes about the skill (not loaded by Claude)
├── VERSION          # e.g. 1.0.0
└── skill/           # what Claude actually loads
    └── SKILL.md     # must be uppercase SKILL.md
```

Installing it creates `~/.claude/skills/backtest -> <repo>/claude/backtest/skill`, so
edits in the repo take effect immediately, and history / rollback is just this
repo's git.

```bash
./skill-mgr.py list                  # all skills: version + install state
./skill-mgr.py install backtest      # or: install --all
./skill-mgr.py uninstall backtest    # or: uninstall --all
./skill-mgr.py status                # problems only (wrong/orphan links, conflicts); exit 1 if any
```

Safety rules:

- Only directories containing `skill/SKILL.md` count as skills.
- `~/.claude/skills/synced/` (cloud-managed) is never touched.
- A real file/directory at `~/.claude/skills/<name>` is never replaced or deleted.
  A symlink pointing elsewhere is replaced only with `install --force`.
- `uninstall` only removes symlinks that point into this `claude/` directory.

Set `CLAUDE_SKILLS_DIR` to target a different skills directory (useful for testing).
