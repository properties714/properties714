# Cloud Memory

A small remote MCP server that gives any MCP-compatible AI assistant (Claude
today; ChatGPT, Grok, or others if/when they add remote MCP connector support
on their side) a shared, persistent memory backed by Postgres (Supabase).

Tools exposed: `remember`, `recall`, `list_memories`, `forget`.

## What's *not* included here

- **No Easypanel deploy automation.** The existing `.github/workflows/*.yml`
  only triggers a redeploy of the static site via a webhook token — it has no
  API access to create a *new* Easypanel service. Someone with access to the
  Easypanel dashboard needs to create a new app pointing at this
  `cloud-memory/` folder (or its own image) and set the env vars below.
- **No Supabase project chosen yet.** `supabase/migrations/0001_create_cloud_memory.sql`
  is ready to run, but hasn't been applied anywhere — pick which Supabase
  project backs this (a fresh one is cleanest; reusing the site's project
  works too) before deploying.
- **No client-side setup for ChatGPT/Grok.** Whether those products can add a
  custom remote MCP server, and how, is controlled by OpenAI/xAI, not by this
  repo. Point them at `https://<your-host>/mcp` with the bearer token once
  it's deployed, following whatever connector UI they currently expose.

## Deploy (manual, until someone wires up Easypanel API access)

1. In Supabase, run the migration in `supabase/migrations/0001_create_cloud_memory.sql`
   against the chosen project.
2. In Easypanel: create a new app from this repo, build context `cloud-memory/`
   (it has its own `Dockerfile`), and set:
   - `CLOUD_MEMORY_TOKEN` — generate with e.g. `openssl rand -hex 32`
   - `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` — from that Supabase project's API settings
3. Expose it on a public HTTPS URL. `GET /healthz` should return `{"ok":true}`
   with no auth; everything else requires `Authorization: Bearer <CLOUD_MEMORY_TOKEN>`.

## Connect Claude to it

Add it as a remote MCP connector (claude.ai → Settings → Connectors → Add
custom connector), pointing at `https://<your-host>/mcp` with the bearer
token. Once connected, `remember`/`recall`/etc. show up as tools in any
session that has this connector enabled — that's what makes it cross-session
memory instead of per-conversation memory.
