---
name: codex-review
description: Get a second opinion from OpenAI's Codex CLI on the current diff or a set of files — an adversarial review pass that runs alongside Claude's own review. Use when the user asks for a "codex review", "second opinion", "adversarial review", or wants Claude and Codex to cross-check each other's work.
---

# Codex adversarial review

This skill shells out to OpenAI's `codex` CLI to get an independent review of code
Claude just wrote or is about to change. Claude and Codex do not share context or
training, so disagreements between them are a useful signal, not noise.

## Prerequisites (check these first, don't assume)

1. `codex` CLI installed and on PATH: `command -v codex`
   - If missing, tell the user to install it (see OpenAI's own Codex CLI docs for
     the current install command — it has changed package names before, so don't
     hardcode one here without verifying against `codex --version` after install).
2. `OPENAI_API_KEY` (or whatever auth `codex` expects) set in the environment:
   `codex --version` will fail loudly if auth isn't configured — read the error,
   don't guess at a fix.

If either check fails, stop and tell the user exactly what's missing. Do not
fabricate a passing review.

## Running a review

Non-interactive mode (`codex exec`) is what makes this scriptable — it takes a
prompt, runs once, and exits, instead of opening a REPL.

For a diff review:

```bash
git diff HEAD | codex exec --full-auto "Review this diff for correctness bugs, \
security issues (injection, auth, secrets), and anything that would fail in \
production. Be specific: file, line, the exact failure scenario. Skip style nits."
```

For a specific file or directory:

```bash
codex exec --full-auto "Review $PATH for correctness and security issues. \
Be specific about failure scenarios, skip style nits." --cd "$(dirname "$PATH")"
```

Adjust flags to whatever the installed `codex` version actually supports —
run `codex exec --help` once per session to confirm flag names before relying
on them, since CLI flags can change between releases.

## Reporting back

- Relay Codex's findings verbatim-ish, but filter out anything that's clearly a
  style preference rather than a correctness/security issue — that's Claude's
  own `/code-review` skill's job, not this one.
- When Claude and Codex disagree on whether something is a bug, say so
  explicitly rather than silently picking a side — that disagreement is the
  point of running both.
- Never let a Codex finding get pushed or committed without Claude's own
  judgment on it first. Codex is a second opinion, not an authority.
