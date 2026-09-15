---
name: commit
description: Stage and commit all pending changes in loc-app-front with an auto-incrementing "loc-N" prefix and a commit message that accurately summarizes what changed. Trigger this whenever the user runs /commit, or asks to commit their work in this project. Commits directly without asking for extra confirmation — invoking this skill IS the confirmation. Never pushes to any remote.
---

## What this does, in order

1. `git add .` at the project root to stage every pending change.
2. If `git diff --cached` is empty after staging, tell the user there is nothing to commit and stop — never create an empty commit.
3. Compute N: `git rev-list --count HEAD` (the number of commits that already exist on the branch) + 1. This is a simple always-increasing sequence, not a strict "commits made via this skill only" counter.
4. Read `git diff --cached --stat`, and open the actual diff (`git diff --cached`) for any file whose purpose isn't obvious from its name alone. Write ONE concise, specific, lowercase, imperative-mood summary line of what actually changed — never a vague "update files" or "misc changes". When several unrelated areas changed, name them: e.g. "update auth component styling, add dashboard html/scss templates".
5. Commit with: `git commit -m "loc-<N>: <summary>"`.
6. Report the resulting commit hash and full message back to the user. Do not push, do not use `--no-verify`.

## Constraints

- Never `git push`.
- Never bypass hooks (`--no-verify`) or amend prior commits.
- Only operate on the `loc-app-front` repo.
