-- Cross-sector energy data foundation. Additive only; does not migrate the legacy billing tables.
-- Apply with Supabase CLI after reviewing the target project and RLS policies.

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) between 1 and 160),
  created_by uuid not null default auth.uid() references auth.users(id) on delete restrict,
  created_at timestamptz not null default now()
);

create table if not exists public.organization_members (
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('owner', 'admin', 'operator', 'viewer')),
  created_at timestamptz not null default now(),
  primary key (organization_id, user_id)
);

create or replace function public.is_org_member(target_organization_id uuid)
returns boolean
language sql stable security definer
set search_path = pg_catalog, public
set row_security = off
as $$
  select exists (
    select 1 from public.organization_members membership
    where membership.organization_id = target_organization_id
      and membership.user_id = auth.uid()
  );
$$;

create or replace function public.has_org_role(target_organization_id uuid, allowed_roles text[])
returns boolean
language sql stable security definer
set search_path = pg_catalog, public
set row_security = off
as $$
  select exists (
    select 1 from public.organization_members membership
    where membership.organization_id = target_organization_id
      and membership.user_id = auth.uid()
      and membership.role = any(allowed_roles)
  );
$$;

grant execute on function public.is_org_member(uuid) to authenticated;
grant execute on function public.has_org_role(uuid, text[]) to authenticated;

create or replace function public.add_organization_creator_as_owner()
returns trigger
language plpgsql security definer
set search_path = pg_catalog, public
set row_security = off
as $$
begin
  if new.created_by is not null then
    insert into public.organization_members (organization_id, user_id, role)
    values (new.id, new.created_by, 'owner')
    on conflict (organization_id, user_id) do nothing;
  end if;
  return new;
end;
$$;

drop trigger if exists organization_creator_membership on public.organizations;
create trigger organization_creator_membership
after insert on public.organizations
for each row execute function public.add_organization_creator_as_owner();

create table if not exists public.sites (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null check (length(trim(name)) between 1 and 160),
  sector text not null check (sector in ('home', 'office', 'industrial')),
  timezone text not null default 'UTC',
  currency text not null default 'INR' check (currency ~ '^[A-Z]{3}$'),
  floor_area_m2 numeric(14, 3) check (floor_area_m2 is null or floor_area_m2 > 0),
  occupancy numeric(14, 3) check (occupancy is null or occupancy >= 0),
  created_at timestamptz not null default now(),
  unique (id, organization_id)
);

create table if not exists public.areas (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  site_id uuid not null,
  name text not null check (length(trim(name)) between 1 and 160),
  area_type text,
  created_at timestamptz not null default now(),
  unique (id, site_id, organization_id),
  foreign key (site_id, organization_id) references public.sites(id, organization_id) on delete cascade
);

create table if not exists public.assets (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  site_id uuid not null,
  area_id uuid,
  name text not null check (length(trim(name)) between 1 and 160),
  asset_type text not null,
  operating_context jsonb not null default '{}'::jsonb check (jsonb_typeof(operating_context) = 'object'),
  created_at timestamptz not null default now(),
  unique (id, site_id, organization_id),
  foreign key (site_id, organization_id) references public.sites(id, organization_id) on delete cascade,
  foreign key (area_id, site_id, organization_id) references public.areas(id, site_id, organization_id) on delete restrict
);

create table if not exists public.meters (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  site_id uuid not null,
  asset_id uuid,
  external_id text,
  name text not null check (length(trim(name)) between 1 and 160),
  measurement_kind text not null check (measurement_kind in ('interval_energy', 'cumulative_energy', 'power', 'voltage', 'current')),
  canonical_unit text not null check (canonical_unit in ('kWh', 'W', 'V', 'A')),
  status text not null default 'unknown' check (status in ('online', 'stale', 'offline', 'unknown')),
  created_at timestamptz not null default now(),
  unique (id, site_id, organization_id),
  foreign key (site_id, organization_id) references public.sites(id, organization_id) on delete cascade,
  foreign key (asset_id, site_id, organization_id) references public.assets(id, site_id, organization_id) on delete restrict
);

create table if not exists public.source_adapters (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  site_id uuid not null,
  meter_id uuid,
  adapter_type text not null,
  schema_version integer not null default 1 check (schema_version > 0),
  status text not null default 'configured' check (status in ('configured', 'connected', 'stale', 'disabled')),
  configuration jsonb not null default '{}'::jsonb check (jsonb_typeof(configuration) = 'object'),
  created_at timestamptz not null default now(),
  unique (id, organization_id),
  foreign key (site_id, organization_id) references public.sites(id, organization_id) on delete cascade,
  foreign key (meter_id, site_id, organization_id) references public.meters(id, site_id, organization_id) on delete restrict
);

create table if not exists public.measurements (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  site_id uuid not null,
  meter_id uuid not null,
  adapter_id uuid,
  event_id text not null,
  schema_version integer not null check (schema_version > 0),
  measured_at timestamptz not null,
  received_at timestamptz not null default now(),
  value numeric(24, 9) not null,
  unit text not null check (unit in ('Wh', 'kWh', 'W', 'kW', 'V', 'A')),
  kind text not null check (kind in ('interval_energy', 'cumulative_energy', 'power', 'voltage', 'current')),
  interval_start timestamptz,
  interval_end timestamptz,
  quality text not null check (quality in ('valid', 'suspect', 'invalid', 'quarantined')),
  sequence_id bigint,
  source_record_ref text,
  provenance jsonb not null default '{}'::jsonb check (jsonb_typeof(provenance) = 'object'),
  created_at timestamptz not null default now(),
  unique (organization_id, event_id),
  foreign key (site_id, organization_id) references public.sites(id, organization_id) on delete cascade,
  foreign key (meter_id, site_id, organization_id) references public.meters(id, site_id, organization_id) on delete cascade,
  foreign key (adapter_id, organization_id) references public.source_adapters(id, organization_id) on delete restrict,
  check ((kind = 'interval_energy' and interval_start is not null and interval_end > interval_start) or kind <> 'interval_energy'),
  check (kind <> 'cumulative_energy' or value >= 0)
);

create index if not exists measurements_site_time_idx on public.measurements (organization_id, site_id, measured_at desc);
create index if not exists measurements_meter_time_idx on public.measurements (meter_id, measured_at desc);
create index if not exists measurements_quality_idx on public.measurements (organization_id, quality, measured_at desc);

create table if not exists public.tariffs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  site_id uuid,
  name text not null check (length(trim(name)) between 1 and 160),
  version text not null,
  currency text not null check (currency ~ '^[A-Z]{3}$'),
  timezone text not null,
  effective_from timestamptz not null,
  effective_to timestamptz,
  components jsonb not null check (jsonb_typeof(components) = 'array'),
  created_at timestamptz not null default now(),
  unique (id, organization_id),
  unique (organization_id, site_id, version),
  foreign key (site_id, organization_id) references public.sites(id, organization_id) on delete cascade,
  check (effective_to is null or effective_to > effective_from)
);

create table if not exists public.billing_runs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  site_id uuid not null,
  tariff_id uuid not null,
  period_start timestamptz not null,
  period_end timestamptz not null,
  calculation_version text not null,
  result_kind text not null default 'estimate' check (result_kind in ('estimate', 'authoritative')),
  status text not null check (status in ('complete', 'incomplete', 'rejected')),
  energy_kwh numeric(20, 6),
  total_amount numeric(20, 2),
  currency text not null check (currency ~ '^[A-Z]{3}$'),
  reading_count integer not null default 0 check (reading_count >= 0),
  explanation jsonb not null default '{}'::jsonb check (jsonb_typeof(explanation) = 'object'),
  created_at timestamptz not null default now(),
  foreign key (site_id, organization_id) references public.sites(id, organization_id) on delete cascade,
  foreign key (tariff_id, organization_id) references public.tariffs(id, organization_id) on delete restrict,
  check (period_end > period_start),
  check (status <> 'complete' or (energy_kwh is not null and total_amount is not null))
);

create table if not exists public.insights (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  site_id uuid not null,
  asset_id uuid,
  source_type text not null check (source_type in ('rule', 'model')),
  rule_or_model_version text not null,
  status text not null default 'open' check (status in ('open', 'accepted', 'rejected', 'investigating', 'deferred', 'closed')),
  window_start timestamptz not null,
  window_end timestamptz not null,
  confidence numeric(5, 4) check (confidence is null or confidence between 0 and 1),
  evidence jsonb not null check (jsonb_typeof(evidence) = 'object'),
  created_at timestamptz not null default now(),
  foreign key (site_id, organization_id) references public.sites(id, organization_id) on delete cascade,
  foreign key (asset_id, site_id, organization_id) references public.assets(id, site_id, organization_id) on delete restrict,
  check (window_end > window_start)
);

create table if not exists public.interventions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  site_id uuid not null,
  insight_id uuid references public.insights(id) on delete set null,
  decision text not null check (decision in ('accepted', 'rejected', 'investigate', 'deferred')),
  action_notes text not null default '',
  before_window jsonb not null default '{}'::jsonb check (jsonb_typeof(before_window) = 'object'),
  after_window jsonb not null default '{}'::jsonb check (jsonb_typeof(after_window) = 'object'),
  result_kind text not null default 'not_verified' check (result_kind in ('measured', 'modeled', 'simulated', 'not_verified')),
  throughput_guardrail jsonb not null default '{}'::jsonb check (jsonb_typeof(throughput_guardrail) = 'object'),
  quality_guardrail jsonb not null default '{}'::jsonb check (jsonb_typeof(quality_guardrail) = 'object'),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  foreign key (site_id, organization_id) references public.sites(id, organization_id) on delete cascade
);

create index if not exists sites_org_sector_idx on public.sites (organization_id, sector);
create index if not exists assets_site_idx on public.assets (organization_id, site_id);
create index if not exists tariffs_effective_idx on public.tariffs (organization_id, site_id, effective_from desc);
create index if not exists billing_runs_site_period_idx on public.billing_runs (organization_id, site_id, period_start desc);
create index if not exists insights_site_status_idx on public.insights (organization_id, site_id, status, created_at desc);
create index if not exists interventions_site_idx on public.interventions (organization_id, site_id, created_at desc);

alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;
alter table public.sites enable row level security;
alter table public.areas enable row level security;
alter table public.assets enable row level security;
alter table public.meters enable row level security;
alter table public.source_adapters enable row level security;
alter table public.measurements enable row level security;
alter table public.tariffs enable row level security;
alter table public.billing_runs enable row level security;
alter table public.insights enable row level security;
alter table public.interventions enable row level security;

create policy organizations_select_member on public.organizations for select to authenticated using (public.is_org_member(id));
create policy organizations_insert_creator on public.organizations for insert to authenticated with check (created_by = auth.uid());
create policy organizations_update_admin on public.organizations for update to authenticated using (public.has_org_role(id, array['owner', 'admin'])) with check (public.has_org_role(id, array['owner', 'admin']));

create policy members_select_org on public.organization_members for select to authenticated using (public.is_org_member(organization_id));
create policy members_insert_admin on public.organization_members for insert to authenticated with check (public.has_org_role(organization_id, array['owner', 'admin']));
create policy members_update_admin on public.organization_members for update to authenticated using (public.has_org_role(organization_id, array['owner', 'admin'])) with check (public.has_org_role(organization_id, array['owner', 'admin']));
create policy members_delete_admin on public.organization_members for delete to authenticated using (public.has_org_role(organization_id, array['owner', 'admin']));

create policy sites_select_org on public.sites for select to authenticated using (public.is_org_member(organization_id));
create policy sites_insert_operator on public.sites for insert to authenticated with check (public.has_org_role(organization_id, array['owner', 'admin', 'operator']));
create policy sites_update_operator on public.sites for update to authenticated using (public.has_org_role(organization_id, array['owner', 'admin', 'operator'])) with check (public.has_org_role(organization_id, array['owner', 'admin', 'operator']));
create policy sites_delete_admin on public.sites for delete to authenticated using (public.has_org_role(organization_id, array['owner', 'admin']));

create policy areas_select_org on public.areas for select to authenticated using (public.is_org_member(organization_id));
create policy areas_write_admin on public.areas for all to authenticated using (public.has_org_role(organization_id, array['owner', 'admin'])) with check (public.has_org_role(organization_id, array['owner', 'admin']));
create policy assets_select_org on public.assets for select to authenticated using (public.is_org_member(organization_id));
create policy assets_write_operator on public.assets for all to authenticated using (public.has_org_role(organization_id, array['owner', 'admin', 'operator'])) with check (public.has_org_role(organization_id, array['owner', 'admin', 'operator']));
create policy meters_select_org on public.meters for select to authenticated using (public.is_org_member(organization_id));
create policy meters_write_admin on public.meters for all to authenticated using (public.has_org_role(organization_id, array['owner', 'admin'])) with check (public.has_org_role(organization_id, array['owner', 'admin']));
create policy adapters_select_org on public.source_adapters for select to authenticated using (public.is_org_member(organization_id));
create policy adapters_write_admin on public.source_adapters for all to authenticated using (public.has_org_role(organization_id, array['owner', 'admin'])) with check (public.has_org_role(organization_id, array['owner', 'admin']));

create policy measurements_select_org on public.measurements for select to authenticated using (public.is_org_member(organization_id));
create policy measurements_insert_operator on public.measurements for insert to authenticated with check (public.has_org_role(organization_id, array['owner', 'admin', 'operator']));
create policy tariffs_select_org on public.tariffs for select to authenticated using (public.is_org_member(organization_id));
create policy tariffs_write_admin on public.tariffs for all to authenticated using (public.has_org_role(organization_id, array['owner', 'admin'])) with check (public.has_org_role(organization_id, array['owner', 'admin']));

create policy billing_runs_select_org on public.billing_runs for select to authenticated using (public.is_org_member(organization_id));
create policy billing_runs_insert_operator on public.billing_runs for insert to authenticated with check (public.has_org_role(organization_id, array['owner', 'admin', 'operator']));
create policy insights_select_org on public.insights for select to authenticated using (public.is_org_member(organization_id));
create policy insights_insert_operator on public.insights for insert to authenticated with check (public.has_org_role(organization_id, array['owner', 'admin', 'operator']));
create policy insights_update_operator on public.insights for update to authenticated using (public.has_org_role(organization_id, array['owner', 'admin', 'operator'])) with check (public.has_org_role(organization_id, array['owner', 'admin', 'operator']));
create policy interventions_select_org on public.interventions for select to authenticated using (public.is_org_member(organization_id));
create policy interventions_insert_operator on public.interventions for insert to authenticated with check (public.has_org_role(organization_id, array['owner', 'admin', 'operator']));
create policy interventions_update_operator on public.interventions for update to authenticated using (public.has_org_role(organization_id, array['owner', 'admin', 'operator'])) with check (public.has_org_role(organization_id, array['owner', 'admin', 'operator']));

grant select, insert, update, delete on public.organizations, public.organization_members, public.sites, public.areas, public.assets, public.meters, public.source_adapters, public.measurements, public.tariffs, public.billing_runs, public.insights, public.interventions to authenticated;
revoke all on public.organizations, public.organization_members, public.sites, public.areas, public.assets, public.meters, public.source_adapters, public.measurements, public.tariffs, public.billing_runs, public.insights, public.interventions from anon;

-- Measurements are append-only for authenticated users. Corrections should be represented by
-- new events with provenance and quality flags; service-role access remains server-side only.
