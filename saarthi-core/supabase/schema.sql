create extension if not exists "uuid-ossp";

create table workflow_state (
  id uuid primary key default uuid_generate_v4(),
  whatsapp_number text not null unique,
  user_aadhaar_last4 text,
  consent_granted boolean default false,
  current_step text check (current_step in ('eligibility','doc_pull','submission','tracking','done')),
  scheme_data jsonb,
  documents jsonb,
  submission_status jsonb,
  tracker_last_check timestamptz,
  retry_count int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table consent_audit_log (
  id uuid primary key default uuid_generate_v4(),
  whatsapp_number text not null,
  consent_scope text not null,
  consent_text text not null,
  consent_granted boolean not null,
  consent_metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz default now()
);

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_workflow_state_updated_at on workflow_state;
create trigger trg_workflow_state_updated_at
before update on workflow_state
for each row execute procedure set_updated_at();

-- NOTE: LangGraph Postgres checkpointer manages its own checkpoint tables via checkpointer.setup().
-- NOTE: Neon Postgres does not provide Supabase auth.role() helpers; enforce access at app/network/role layers.
