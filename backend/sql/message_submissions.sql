create extension if not exists pgcrypto;

create table if not exists public.message_submissions (
  id uuid primary key default gen_random_uuid(),
  batch_id uuid not null,
  submitted_at timestamptz not null default now(),
  endpoint text not null,
  request_ip_hash text,
  bioguide_id text not null,
  recipient_name text,
  topic text,
  subject text not null,
  message_body text not null,
  subject_length integer not null,
  message_length integer not null,
  state_abbreviation text,
  district text,
  county text,
  campaign_tag text,
  campaign_uuid text,
  campaign_org_name text,
  campaign_org_url text,
  delivery_status text not null,
  delivery_url text,
  delivery_uid text,
  delivery_error text
);

create index if not exists message_submissions_submitted_at_idx
  on public.message_submissions (submitted_at desc);

create index if not exists message_submissions_batch_id_idx
  on public.message_submissions (batch_id);

create index if not exists message_submissions_bioguide_id_idx
  on public.message_submissions (bioguide_id);

create index if not exists message_submissions_delivery_status_idx
  on public.message_submissions (delivery_status);

create index if not exists message_submissions_state_district_idx
  on public.message_submissions (state_abbreviation, district);
