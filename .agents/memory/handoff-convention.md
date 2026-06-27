---
name: HANDOFF.md convention
description: Mandatory session continuity file — must be read at start and updated at end of every session.
---

## Rule
At the **start** of every session: read `HANDOFF.md` to understand what was done previously and what is pending.
At the **end** of every session: append a new `### Session N — YYYY-MM-DD` block to the Session Log section in `HANDOFF.md` documenting what was done and what is pending next.

**Why:** The user imports the repo fresh each time (cold start). Without this file, every session starts blind. The user explicitly made this mandatory on 2025-06-27 and said they should not need to ask again.

**How to apply:**
- Do this without being asked — it is always required.
- The block should include: status at start, what was done, and pending/next steps.
- Keep entries concise but complete enough for a cold-start agent to orient itself.
- `HANDOFF.md` lives in the project root.
