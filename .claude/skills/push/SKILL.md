---
name: push
description: Safely sync loc-app-front with its GitHub remote — pull first, bail out cleanly on any merge conflict, otherwise push. Trigger this whenever the user runs /push, or asks to push/sync their work to GitHub in this project. Runs directly without asking for extra confirmation — invoking this skill IS the confirmation — but never pushes if a conflict was found.
---

## What this does, in order

1. `git status --porcelain` — if there are uncommitted changes, stop and tell the user to commit or stash first (they can use `/commit`). Pulling with a dirty working tree risks git refusing the merge or silently mixing unrelated changes.
2. Confirm a remote and upstream exist:
   - `git remote get-url origin` — if it fails, stop and tell the user there's no `origin` remote configured.
   - `git rev-parse --abbrev-ref --symbolic-full-name @{u}` — if the current branch has no upstream, that's fine for a first push: skip the pull step and go straight to `git push -u origin <current-branch>`.
3. If an upstream exists, run `git pull`.
   - If it fails with merge conflicts (git's output contains `CONFLICT`, or `git status` afterwards shows unmerged paths), **abandon**: run `git merge --abort` to restore the repo to its pre-pull state, then report to the user exactly which file(s) conflicted and stop. Do not attempt to resolve conflicts yourself and do not push.
   - If `git pull` fails for another reason (network, auth, diverged history needing rebase, etc.), report the actual error and stop — don't guess at a fix.
4. If the pull was clean (including "already up to date"), run `git push` (or `git push -u origin <branch>` if step 2 found no upstream).
5. Report the result: what was pulled (if anything), and the push outcome (new commits pushed, or "everything up to date").

## Constraints
- Never `git push --force` or `--force-with-lease`.
- Never `git merge --abort` unless a real conflict was detected — don't use it defensively.
- Never bypass hooks (`--no-verify`).
- Only operate on the `loc-app-front` repo, and only on `origin`.
