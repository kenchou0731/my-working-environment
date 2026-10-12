#!/usr/bin/env python3
"""
Skill manager: install skills from this repo into Claude Code via symlinks.

Repo layout (one directory per skill):

  <repo>/<name>/README.md        notes about the skill (not loaded by Claude)
  <repo>/<name>/VERSION          version string, e.g. 1.0.0
  <repo>/<name>/skill/SKILL.md   the actual skill; everything under skill/ is what Claude sees

Installing <name> creates:

  ~/.claude/skills/<name> -> <repo>/<name>/skill

Usage:
  skill-mgr.py list                          show every repo skill and its install state
  skill-mgr.py install <name>... | --all     create symlinks
  skill-mgr.py uninstall <name>... | --all   remove symlinks that point into this repo
  skill-mgr.py status                        report problems only; exit 1 if any

Options:
  --force   (install) replace an existing symlink that points somewhere else.
            Real files/directories are never replaced or deleted.

Set CLAUDE_SKILLS_DIR to override ~/.claude/skills.
Exit codes: 0 = ok, 1 = some operation failed / problems found, 2 = usage error.
"""
import os
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent
SKILLS_DIR = Path(os.environ.get("CLAUDE_SKILLS_DIR", Path.home() / ".claude" / "skills"))

# Names under SKILLS_DIR this tool must never touch (cloud-managed skills).
RESERVED_NAMES = {"synced"}

# Install states
NOT_INSTALLED = "not installed"
INSTALLED = "installed"
WRONG_LINK = "wrong link"      # symlink exists but points elsewhere
CONFLICT = "conflict"          # a real file/dir occupies the name


def discover_skills() -> dict[str, Path]:
    """Map skill name -> <repo>/<name>/skill for every subdir that has skill/SKILL.md."""
    skills = {}
    for d in sorted(REPO_ROOT.iterdir()):
        if d.name.startswith(".") or not d.is_dir():
            continue
        if (d / "skill" / "SKILL.md").is_file():
            skills[d.name] = d / "skill"
    return skills


def read_version(name: str) -> str:
    try:
        return (REPO_ROOT / name / "VERSION").read_text().strip() or "-"
    except OSError:
        return "-"


def link_path(name: str) -> Path:
    return SKILLS_DIR / name


def points_into_repo(link: Path) -> bool:
    target = Path(os.path.normpath(link.parent / os.readlink(link)))
    return target == REPO_ROOT or REPO_ROOT in target.parents


def install_state(name: str, target: Path) -> str:
    link = link_path(name)
    if link.is_symlink():
        return INSTALLED if link.resolve() == target.resolve() else WRONG_LINK
    if link.exists():
        return CONFLICT
    return NOT_INSTALLED


def install(name: str, target: Path, force: bool) -> bool:
    link = link_path(name)
    state = install_state(name, target)

    if state == INSTALLED:
        print(f"{name}: already installed")
        return True
    if state == CONFLICT:
        print(f"{name}: refusing, {link} is a real file/directory (remove it yourself if intended)",
              file=sys.stderr)
        return False
    if state == WRONG_LINK:
        if not force:
            print(f"{name}: refusing, {link} -> {os.readlink(link)} (use --force to replace)",
                  file=sys.stderr)
            return False
        link.unlink()

    SKILLS_DIR.mkdir(parents=True, exist_ok=True)
    link.symlink_to(target, target_is_directory=True)
    print(f"{name}: installed {link} -> {target}")
    return True


def uninstall(name: str) -> bool:
    link = link_path(name)
    if not link.is_symlink():
        if link.exists():
            print(f"{name}: refusing, {link} is not a symlink", file=sys.stderr)
            return False
        print(f"{name}: not installed")
        return True
    if not points_into_repo(link):
        print(f"{name}: refusing, {link} -> {os.readlink(link)} does not point into {REPO_ROOT}",
              file=sys.stderr)
        return False
    link.unlink()
    print(f"{name}: uninstalled")
    return True


def orphan_links(skills: dict[str, Path]) -> list[Path]:
    """Symlinks in SKILLS_DIR that point into this repo but match no current skill."""
    if not SKILLS_DIR.is_dir():
        return []
    return [
        p for p in sorted(SKILLS_DIR.iterdir())
        if p.is_symlink() and points_into_repo(p) and p.name not in skills
    ]


def cmd_list(skills: dict[str, Path]) -> int:
    if not skills:
        print(f"no skills found in {REPO_ROOT} (expected <name>/skill/SKILL.md)")
    for name, target in skills.items():
        print(f"{name:24s} {read_version(name):10s} {install_state(name, target)}")
    for p in orphan_links(skills):
        print(f"{p.name:24s} {'-':10s} orphan link -> {os.readlink(p)}")
    return 0


def cmd_status(skills: dict[str, Path]) -> int:
    problems = []
    for name, target in skills.items():
        state = install_state(name, target)
        if state == WRONG_LINK:
            problems.append(f"{name}: {link_path(name)} -> {os.readlink(link_path(name))}, expected {target}")
        elif state == CONFLICT:
            problems.append(f"{name}: {link_path(name)} is a real file/directory")
    for p in orphan_links(skills):
        problems.append(f"{p.name}: orphan link -> {os.readlink(p)} (skill no longer in repo)")
    for line in problems:
        print(line)
    if not problems:
        print("ok")
    return 1 if problems else 0


def resolve_targets(args: list[str], skills: dict[str, Path], allow_orphans: bool) -> list[str] | None:
    if "--all" in args:
        names = list(skills)
        if allow_orphans:
            names += [p.name for p in orphan_links(skills)]
        return names
    if not args:
        return None
    for name in args:
        if "/" in name or name.startswith("."):
            print(f"invalid skill name: {name}", file=sys.stderr)
            return None
        if name in RESERVED_NAMES:
            print(f"refusing: '{name}' is reserved", file=sys.stderr)
            return None
        if name not in skills and not allow_orphans:
            print(f"unknown skill: {name} (no {REPO_ROOT / name / 'skill' / 'SKILL.md'})", file=sys.stderr)
            return None
    return args


def main(argv: list[str]) -> int:
    if not argv or argv[0] in ("-h", "--help"):
        print(__doc__)
        return 0 if argv else 2

    cmd, rest = argv[0], argv[1:]
    force = "--force" in rest
    rest = [a for a in rest if a != "--force"]
    skills = discover_skills()

    if cmd == "list":
        return cmd_list(skills)
    if cmd == "status":
        return cmd_status(skills)
    if cmd == "install":
        names = resolve_targets(rest, skills, allow_orphans=False)
        if names is None:
            if not rest:
                print(__doc__)
            return 2
        ok = all([install(n, skills[n], force) for n in names])
        return 0 if ok else 1
    if cmd == "uninstall":
        names = resolve_targets(rest, skills, allow_orphans=True)
        if names is None:
            if not rest:
                print(__doc__)
            return 2
        ok = all([uninstall(n) for n in names])
        return 0 if ok else 1

    print(__doc__)
    return 2


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
