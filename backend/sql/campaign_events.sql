create extension if not exists pgcrypto;

do $$
begin
  if not exists (
    select 1
    from pg_type
    where typname = 'campaign_event_type'
      and typnamespace = 'public'::regnamespace
  ) then
    create type public.campaign_event_type as enum ('page_view', 'flow_start');
  end if;
end
$$;

create table if not exists public.campaign_events (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  event_type public.campaign_event_type not null,
  metadata jsonb,
  request_ip_hash text,
  user_agent text,
  referrer text,
  created_at timestamptz not null default now()
);

create index if not exists campaign_events_campaign_id_created_at_idx
  on public.campaign_events (campaign_id, created_at desc);

create index if not exists campaign_events_campaign_id_type_idx
  on public.campaign_events (campaign_id, event_type);
