create table if not exists cloud_memory (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  value text not null,
  tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists cloud_memory_tags_idx on cloud_memory using gin (tags);

-- The server talks to Supabase with the service-role key (bypasses RLS by
-- design), but RLS is enabled anyway so no other key can touch this table
-- without an explicit policy.
alter table cloud_memory enable row level security;
