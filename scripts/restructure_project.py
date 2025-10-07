#!/usr/bin/env python3
"""Project restructuring utility for remember-pertinent-info.

This script moves everything out of src/ to the root level for maximum simplicity
and readability. No nested folders, everything at the top level.

Usage:
    python scripts/restructure_project.py           # execute
    python scripts/restructure_project.py --dry-run # preview changes

New Structure (everything at root):
    ├── app/            # Next.js app router
    ├── components/     # All UI components 
    ├── detail-modals/  # Entity detail modal components
    ├── providers/      # React context providers
    ├── utils/          # Utility functions
    └── theme/          # Theme configuration
"""
from __future__ import annotations

import argparse
import shutil
import sys
from pathlib import Path
from typing import Iterable, Tuple

ROOT = Path(__file__).resolve().parent.parent

# Move everything from src/ to root and rename entity-details to detail-modals
FILE_MOVES: Tuple[Tuple[Path, Path], ...] = (
    # Move all components to root/components
    (Path("src/components/Header.tsx"), Path("components/Header.tsx")),
    (Path("src/components/LandingPage.tsx"), Path("components/LandingPage.tsx")),
    (Path("src/components/SearchBar.tsx"), Path("components/SearchBar.tsx")),
    (Path("src/components/SearchResults.tsx"), Path("components/SearchResults.tsx")),
    (Path("src/components/EmotionRegistry.tsx"), Path("components/EmotionRegistry.tsx")),
    (Path("src/components/EntityModal.tsx"), Path("components/EntityModal.tsx")),
    # Move providers to root/providers
    (Path("src/providers/ThemeProvider.tsx"), Path("providers/ThemeProvider.tsx")),
    (Path("src/providers/ModalStackProvider.tsx"), Path("providers/ModalStackProvider.tsx")),
    # Move utils to root/utils
    (Path("src/utils/categoryColors.ts"), Path("utils/categoryColors.ts")),
    (Path("src/utils/prisma.ts"), Path("utils/prisma.ts")),
    # Move theme to root/theme
    (Path("src/theme/theme.ts"), Path("theme/theme.ts")),
)

# Directory moves - move entity-details to detail-modals at root
DIRECTORY_MOVES: Tuple[Tuple[Path, Path], ...] = (
    (Path("src/components/entity-details"), Path("detail-modals")),
    (Path("src/app"), Path("app")),  # Move app to root
    (Path("src/generated"), Path("generated")),  # Move generated to root
)

# Import path rewrites - paths stay the same, we'll update tsconfig.json instead
IMPORT_REWRITES: Tuple[Tuple[str, str], ...] = (
    # Only rename entity-details to detail-modals
    ("@/components/entity-details", "@/components"),
)

# Remove the entire src directory after moving everything out
CANDIDATE_EMPTY_DIRS: Tuple[Path, ...] = (
    Path("src"),
)

IGNORE_TOP_LEVEL_DIRS = {".next", "node_modules", ".git"}
SOURCE_EXTENSIONS = {".ts", ".tsx", ".js", ".jsx"}

#requires source path, destination path, and boolean dry run.
def move_path(src: Path, dst: Path, dry_run: bool) -> None:
    abs_src = ROOT / src #defining absolute path for source
    abs_dst = ROOT / dst #defining absolute path for destination

    if not abs_src.exists(): #warning for no existing source
        print(f"[warn] skipping missing path: {src}")
        return

    if abs_dst.exists(): #warning for no existing destination
        print(f"[warn] destination already exists, skipping move: {dst}")
        return

    if dry_run: #print statement on dry run only
        print(f"[dry-run] move {src} -> {dst}")
        return

    abs_dst.parent.mkdir(parents=True, exist_ok=True) #making directory in destination
    shutil.move(str(abs_src), str(abs_dst)) #moving contents
    print(f"[move] {src} -> {dst}") 


def process_moves(file_moves: Iterable[Tuple[Path, Path]],
                 dir_moves: Iterable[Tuple[Path, Path]],
                 dry_run: bool) -> None:
    for src, dst in file_moves:
        move_path(src, dst, dry_run)

    for src, dst in dir_moves:
        move_path(src, dst, dry_run)


def should_ignore(path: Path) -> bool:
    return any(part in IGNORE_TOP_LEVEL_DIRS for part in path.parts)


def iter_source_files() -> Iterable[Path]:
    for path in ROOT.rglob("*"):
        if path.is_file() and path.suffix in SOURCE_EXTENSIONS and not should_ignore(path):
            yield path


def rewrite_imports(replacements: Iterable[Tuple[str, str]], dry_run: bool) -> None:
    for file_path in iter_source_files():
        try:
            original = file_path.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            # Skip files we cannot decode (should not happen for source files)
            continue

        updated = original
        for old, new in replacements:
            updated = updated.replace(old, new)

        if updated != original:
            rel_path = file_path.relative_to(ROOT)
            if dry_run:
                print(f"[dry-run] rewrite imports in {rel_path}")
            else:
                file_path.write_text(updated, encoding="utf-8")
                print(f"[imports] updated {rel_path}")


def prune_empty_directories(candidates: Iterable[Path], dry_run: bool) -> None:
    for candidate in candidates:
        abs_candidate = ROOT / candidate
        if not abs_candidate.exists() or not abs_candidate.is_dir():
            continue

        # remove empty subdirectories first (bottom-up)
        for path in sorted(abs_candidate.rglob("*"), reverse=True):
            if path.is_dir() and not any(path.iterdir()):
                rel = path.relative_to(ROOT)
                if dry_run:
                    print(f"[dry-run] remove empty dir {rel}")
                else:
                    path.rmdir()
                    print(f"[prune] removed empty dir {rel}")

        # finally remove the candidate itself if empty
        if abs_candidate.exists() and abs_candidate.is_dir() and not any(abs_candidate.iterdir()):
            rel = abs_candidate.relative_to(ROOT)
            if dry_run:
                print(f"[dry-run] remove empty dir {rel}")
            else:
                abs_candidate.rmdir()
                print(f"[prune] removed empty dir {rel}")


def update_tsconfig(dry_run: bool) -> None:
    """Update tsconfig.json to point @ paths to root instead of src/"""
    tsconfig_path = ROOT / "tsconfig.json"
    if not tsconfig_path.exists():
        return

    try:
        content = tsconfig_path.read_text(encoding="utf-8")
        updated = content.replace('"@/*": ["./src/*"]', '"@/*": ["./*"]')
        
        if updated != content:
            if dry_run:
                print("[dry-run] update tsconfig.json @ paths to point to root")
            else:
                tsconfig_path.write_text(updated, encoding="utf-8")
                print("[tsconfig] updated @ paths to point to root")
    except Exception as e:
        print(f"[warn] failed to update tsconfig.json: {e}")


def main(argv: Iterable[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Restructure the project file tree and update imports.")
    parser.add_argument("--dry-run", action="store_true", help="Preview the operations without modifying the filesystem")
    args = parser.parse_args(list(argv) if argv is not None else None)

    move_path_msg = "Previewing" if args.dry_run else "Moving"
    print(f"{move_path_msg} files and directories...")
    process_moves(FILE_MOVES, DIRECTORY_MOVES, args.dry_run)

    print("Updating tsconfig.json...")
    update_tsconfig(args.dry_run)

    print("Updating import paths...")
    rewrite_imports(IMPORT_REWRITES, args.dry_run)

    print("Pruning empty directories...")
    prune_empty_directories(CANDIDATE_EMPTY_DIRS, args.dry_run)

    print("Done." if not args.dry_run else "Dry run complete.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
