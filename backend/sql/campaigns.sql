create extension if not exists pgcrypto;

do $$
begin
  if not exists (
    select 1
    from pg_type
    where typname = 'campaign_status'
      and typnamespace = 'public'::regnamespace
  ) then
    create type public.campaign_status as enum ('draft', 'published', 'archived', 'disabled');
  end if;
end
$$;

create table if not exists public.campaigns (
  id uuid primary key default gen_random_uuid(),
  organizer_user_id text not null,
  organizer_email text not null,
  title text not null,
  slug text not null unique,
  summary text,
  body_markdown text,
  organization_name text,
  organization_url text,
  status public.campaign_status not null default 'draft',
  status_before_disabled public.campaign_status not null default 'draft',
  published_at timestamptz,
  first_published_at timestamptz,
  archived_at timestamptz,
  disabled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint campaigns_slug_kebab_case_check check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint campaigns_slug_lowercase_check check (slug = lower(slug)),
  constraint campaigns_status_before_disabled_check check (status_before_disabled <> 'disabled'),
  constraint campaigns_first_publish_check check (
    published_at is null
    or first_published_at is not null
  )
);

create index if not exists campaigns_organizer_user_id_idx
  on public.campaigns (organizer_user_id, created_at desc);

create index if not exists campaigns_status_idx
  on public.campaigns (status, created_at desc);

create index if not exists campaigns_slug_idx
  on public.campaigns (slug);
