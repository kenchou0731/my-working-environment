# my-working-environment

My personal working environment: container images, dotfiles, and helper scripts.

## Layout

```
.
├── Dockerfiles/   # container images (podman / docker)
├── claude/        # Claude Code tooling: skill manager, usage-gated cron runs
├── configs/       # dotfiles: tmux, vim, git
└── scripts/       # helper scripts
```

### Dockerfiles

| Directory | Description |
|---|---|
| `workspace/{deb9,deb11,deb12,node}` | Personal development images (see `Dockerfiles/workspace/README.md` for releases) |
| `deb-pkg-builder/deb11/{amd64-native,armhf-cross}` | Debian package build environments |
| `golang/` | Go development image |
| `bbgo/` | Image for bbgo |

Build / push / run instructions: `Dockerfiles/README.md`.

### claude

| Path | Description |
|---|---|
| `skill-mgr.py` | Install skills kept under `claude/<name>/skill/` into `~/.claude/skills` via symlinks |
| `usage/` | Run `claude -p` from cron only when usage headroom allows (see `claude/usage/docs/plan.md`) |

Details: `claude/README.md`.

### configs

| File | Install to |
|---|---|
| `tmux.conf` | `/etc/tmux` |
| `dot_vimrc` | `~/.vimrc` |
| `gitconfig` | `~/.gitconfig` or `/etc/gitconfig` |

### scripts

| Script | Description |
|---|---|
| `zzz-container` | Manage podman containers: `lsi`, `ls`, `new <name> <image>`, `login <name>` (bash completion in `bash-completion/`) |
| `gtree` | Show `git log` as a graph |
| `lint-check` | Find the `.changes` file for lintian checks |
| `rm-all-deb-artifacts` | Remove `*.deb`, `*.changes`, `*.buildinfo` in the current directory |
| `get-my-public-ip` | Print this host's public IP via OpenDNS |
| `ntp-sync` | Sync time with `time.stdtime.gov.tw` |
