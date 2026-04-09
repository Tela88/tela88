---
name: mem-context
description: Use when working in this repository to bridge project-local context with the existing Claude memory system at `C:\Users\USER\.claude-mem`. Use at the start of meaningful work, after major product or design decisions, and before ending a session so project notes stay aligned with long-term memory.
---

# mem-context

Treat `C:\Users\USER\.claude-mem` as the canonical cross-session memory system.

Use `.agent/context/` as the project-local layer:

- `project-memory.md` for stable project facts, branding decisions, architecture, and persistent user preferences
- `session-memory.md` for recent changes, touched files, open issues, and likely next steps

## Workflow

1. Before substantial work, read:
   - `.agent/context/project-memory.md`
   - `.agent/context/session-memory.md`
2. Assume `C:\Users\USER\.claude-mem` may already hold broader cross-session observations.
3. Use local memory files to recover repo-specific context quickly and to reduce ambiguity.
4. After important changes, update the local memory files so they remain useful even if external memory is unavailable.

## What to store locally

Store:

- stable project structure and stack details
- chosen visual direction and approved assets
- recurring user preferences for copy, UX, and implementation style
- recently changed files and likely next tasks

Do not store:

- API keys, tokens, passwords, or secrets
- redundant verbose logs
- stale decisions that were later overridden

## Conflict rule

If there is ever a conflict:

1. follow the user's latest instruction
2. then follow the current codebase state
3. then treat local memory as the project-specific reference
4. treat `C:\Users\USER\.claude-mem` as helpful background, not authority over the user
