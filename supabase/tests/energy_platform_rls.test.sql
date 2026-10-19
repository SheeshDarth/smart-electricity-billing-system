begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;
select plan(27);

-- Fixed synthetic users and two isolated organizations; the entire file rolls back.
insert into auth.users (id, email) values
  ('10000000-0000-0000-0000-000000000001', 'owner-a@example.test'),
  ('10000000-0000-0000-0000-000000000002', 'admin-a@example.test'),
  ('10000000-0000-0000-0000-000000000003', 'operator-a@example.test'),
  ('10000000-0000-0000-0000-000000000004', 'viewer-a@example.test'),
  ('10000000-0000-0000-0000-000000000005', 'owner-b@example.test'),
  ('10000000-0000-0000-0000-000000000006', 'spare@example.test');

insert into public.organizations (id, name, created_by) values
  ('20000000-0000-0000-0000-000000000001', 'Tenant A', '10000000-0000-0000-0000-000000000001'),
  ('20000000-0000-0000-0000-000000000002', 'Tenant B', '10000000-0000-0000-0000-000000000005');

insert into public.organization_members (organization_id, user_id, role) values
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', 'admin'),
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000003', 'operator'),
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000004', 'viewer');

insert into public.sites (id, organization_id, name, sector) values
  ('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'Site A', 'office'),
  ('30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000002', 'Site B', 'industrial');
insert into public.areas (id, organization_id, site_id, name) values
  ('40000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 'Area A'),
  ('40000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000002', 'Area B');
insert into public.assets (id, organization_id, site_id, area_id, name, asset_type) values
  ('50000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001', 'Asset A', 'machine'),
  ('50000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000002', 'Asset B', 'building');
insert into public.meters (id, organization_id, site_id, asset_id, name, measurement_kind, canonical_unit) values
  ('60000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000001', 'Meter A', 'interval_energy', 'kWh'),
  ('60000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000002', '50000000-0000-0000-0000-000000000002', 'Meter B', 'interval_energy', 'kWh');
insert into public.source_adapters (id, organization_id, site_id, meter_id, adapter_type) values
  ('70000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', '60000000-0000-0000-0000-000000000001', 'simulation'),
  ('70000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000002', '60000000-0000-0000-0000-000000000002', 'simulation');
insert into public.measurements (id, organization_id, site_id, meter_id, adapter_id, event_id, schema_version, measured_at, value, unit, kind, interval_start, interval_end, quality) values
  ('80000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', '60000000-0000-0000-0000-000000000001', '70000000-0000-0000-0000-000000000001', 'event-a', 1, '2026-10-19T10:15:00Z', 0.5, 'kWh', 'interval_energy', '2026-10-19T10:00:00Z', '2026-10-19T10:15:00Z', 'valid'),
  ('80000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000002', '60000000-0000-0000-0000-000000000002', '70000000-0000-0000-0000-000000000002', 'event-b', 1, '2026-10-19T10:15:00Z', 0.7, 'kWh', 'interval_energy', '2026-10-19T10:00:00Z', '2026-10-19T10:15:00Z', 'valid');
insert into public.tariffs (id, organization_id, site_id, name, version, currency, timezone, effective_from, components) values
  ('90000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 'Tariff A', 'seed-a', 'INR', 'Asia/Kolkata', '2026-01-01T00:00:00Z', '[{"name":"energy","ratePerKwh":8}]'::jsonb),
  ('90000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000002', 'Tariff B', 'seed-b', 'INR', 'Asia/Kolkata', '2026-01-01T00:00:00Z', '[{"name":"energy","ratePerKwh":9}]'::jsonb);
insert into public.billing_runs (id, organization_id, site_id, tariff_id, period_start, period_end, calculation_version, status, energy_kwh, total_amount, currency, reading_count) values
  ('a0000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', '90000000-0000-0000-0000-000000000001', '2026-10-19T10:00:00Z', '2026-10-19T10:15:00Z', 'test-v1', 'complete', 0.5, 4, 'INR', 1),
  ('a0000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000002', '90000000-0000-0000-0000-000000000002', '2026-10-19T10:00:00Z', '2026-10-19T10:15:00Z', 'test-v1', 'complete', 0.7, 6.3, 'INR', 1);
insert into public.insights (id, organization_id, site_id, source_type, rule_or_model_version, window_start, window_end, evidence) values
  ('b0000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 'rule', 'test-v1', '2026-10-19T10:00:00Z', '2026-10-19T10:15:00Z', '{"synthetic":true}'::jsonb),
  ('b0000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000002', 'rule', 'test-v1', '2026-10-19T10:00:00Z', '2026-10-19T10:15:00Z', '{"synthetic":true}'::jsonb);
insert into public.interventions (id, organization_id, site_id, insight_id, decision, result_kind, created_by) values
  ('c0000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'accepted', 'simulated', '10000000-0000-0000-0000-000000000001'),
  ('c0000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000002', 'accepted', 'simulated', '10000000-0000-0000-0000-000000000005');

select ok(
  (select count(*) = 12 from pg_class c join pg_namespace n on n.oid = c.relnamespace
   where n.nspname = 'public' and c.relkind = 'r' and c.relrowsecurity
     and c.relname = any (array['organizations','organization_members','sites','areas','assets','meters','source_adapters','measurements','tariffs','billing_runs','insights','interventions'])),
  'RLS is enabled on all 12 energy platform tables'
);

set local role anon;
select throws_ok('select * from public.organizations', '42501', null, 'anon cannot read organizations');
reset role;
set local role authenticated;
set local request.jwt.claim.sub = '10000000-0000-0000-0000-000000000001';
set local request.jwt.claims = '{"sub":"10000000-0000-0000-0000-000000000001","role":"authenticated"}';
select ok(
  (select count(*) = 1 from public.organizations)
  and (select count(*) = 4 from public.organization_members)
  and (select count(*) = 1 from public.sites)
  and (select count(*) = 1 from public.areas)
  and (select count(*) = 1 from public.assets)
  and (select count(*) = 1 from public.meters)
  and (select count(*) = 1 from public.source_adapters)
  and (select count(*) = 1 from public.measurements)
  and (select count(*) = 1 from public.tariffs)
  and (select count(*) = 1 from public.billing_runs)
  and (select count(*) = 1 from public.insights)
  and (select count(*) = 1 from public.interventions),
  'owner A sees every tenant A table and no tenant B rows'
);

set local request.jwt.claim.sub = '10000000-0000-0000-0000-000000000002';
set local request.jwt.claims = '{"sub":"10000000-0000-0000-0000-000000000002","role":"authenticated"}';
select ok(
  (select count(*) = 1 from public.organizations)
  and (select count(*) = 4 from public.organization_members)
  and (select count(*) = 1 from public.sites)
  and (select count(*) = 1 from public.areas)
  and (select count(*) = 1 from public.assets)
  and (select count(*) = 1 from public.meters)
  and (select count(*) = 1 from public.source_adapters)
  and (select count(*) = 1 from public.measurements)
  and (select count(*) = 1 from public.tariffs)
  and (select count(*) = 1 from public.billing_runs)
  and (select count(*) = 1 from public.insights)
  and (select count(*) = 1 from public.interventions),
  'admin A sees every tenant A table and no tenant B rows'
);

set local request.jwt.claim.sub = '10000000-0000-0000-0000-000000000003';
set local request.jwt.claims = '{"sub":"10000000-0000-0000-0000-000000000003","role":"authenticated"}';
select ok(
  (select count(*) = 1 from public.organizations)
  and (select count(*) = 4 from public.organization_members)
  and (select count(*) = 1 from public.sites)
  and (select count(*) = 1 from public.areas)
  and (select count(*) = 1 from public.assets)
  and (select count(*) = 1 from public.meters)
  and (select count(*) = 1 from public.source_adapters)
  and (select count(*) = 1 from public.measurements)
  and (select count(*) = 1 from public.tariffs)
  and (select count(*) = 1 from public.billing_runs)
  and (select count(*) = 1 from public.insights)
  and (select count(*) = 1 from public.interventions),
  'operator A sees every tenant A table and no tenant B rows'
);

set local request.jwt.claim.sub = '10000000-0000-0000-0000-000000000004';
set local request.jwt.claims = '{"sub":"10000000-0000-0000-0000-000000000004","role":"authenticated"}';
select ok(
  (select count(*) = 1 from public.organizations)
  and (select count(*) = 4 from public.organization_members)
  and (select count(*) = 1 from public.sites)
  and (select count(*) = 1 from public.areas)
  and (select count(*) = 1 from public.assets)
  and (select count(*) = 1 from public.meters)
  and (select count(*) = 1 from public.source_adapters)
  and (select count(*) = 1 from public.measurements)
  and (select count(*) = 1 from public.tariffs)
  and (select count(*) = 1 from public.billing_runs)
  and (select count(*) = 1 from public.insights)
  and (select count(*) = 1 from public.interventions),
  'viewer A sees every tenant A table and no tenant B rows'
);
select throws_ok($$insert into public.sites (organization_id, name, sector) values ('20000000-0000-0000-0000-000000000001', 'Viewer forbidden', 'home')$$, '42501', null, 'viewer cannot create sites');
select throws_ok($$insert into public.measurements (organization_id, site_id, meter_id, event_id, schema_version, measured_at, value, unit, kind, interval_start, interval_end, quality) values ('20000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', '60000000-0000-0000-0000-000000000001', 'viewer-forbidden', 1, '2026-10-19T10:30:00Z', 0.1, 'kWh', 'interval_energy', '2026-10-19T10:15:00Z', '2026-10-19T10:30:00Z', 'valid')$$, '42501', null, 'viewer cannot insert measurements');
select throws_ok($$insert into public.tariffs (organization_id, site_id, name, version, currency, timezone, effective_from, components) values ('20000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 'Viewer tariff', 'viewer-forbidden', 'INR', 'Asia/Kolkata', '2026-01-01T00:00:00Z', '[]'::jsonb)$$, '42501', null, 'viewer cannot create tariffs');
select throws_ok($$insert into public.organization_members (organization_id, user_id, role) values ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000006', 'viewer')$$, '42501', null, 'viewer cannot add organization members');
update public.sites set name = 'Viewer changed site' where id = '30000000-0000-0000-0000-000000000001';
select is((select count(*)::integer from public.sites where id = '30000000-0000-0000-0000-000000000001' and name = 'Site A'), 1, 'viewer cannot update site configuration');

set local request.jwt.claim.sub = '10000000-0000-0000-0000-000000000003';
set local request.jwt.claims = '{"sub":"10000000-0000-0000-0000-000000000003","role":"authenticated"}';
select lives_ok($$insert into public.sites (organization_id, name, sector) values ('20000000-0000-0000-0000-000000000001', 'Operator test site', 'office')$$, 'operator can create a site in their organization');
select lives_ok($$insert into public.measurements (organization_id, site_id, meter_id, adapter_id, event_id, schema_version, measured_at, value, unit, kind, interval_start, interval_end, quality) values ('20000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', '60000000-0000-0000-0000-000000000001', '70000000-0000-0000-0000-000000000001', 'operator-event', 1, '2026-10-19T10:30:00Z', 0.1, 'kWh', 'interval_energy', '2026-10-19T10:15:00Z', '2026-10-19T10:30:00Z', 'valid')$$, 'operator can append a measurement');
select lives_ok($$insert into public.billing_runs (organization_id, site_id, tariff_id, period_start, period_end, calculation_version, status, energy_kwh, total_amount, currency, reading_count) values ('20000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', '90000000-0000-0000-0000-000000000001', '2026-10-19T10:00:00Z', '2026-10-19T10:30:00Z', 'test-v1', 'complete', 0.6, 4.8, 'INR', 2)$$, 'operator can record a billing estimate');
select lives_ok($$insert into public.insights (organization_id, site_id, source_type, rule_or_model_version, window_start, window_end, evidence) values ('20000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 'rule', 'test-v1', '2026-10-19T10:00:00Z', '2026-10-19T10:30:00Z', '{"synthetic":true}'::jsonb)$$, 'operator can record an insight');
select lives_ok($$insert into public.interventions (organization_id, site_id, insight_id, decision, result_kind) values ('20000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'investigate', 'simulated')$$, 'operator can record an intervention');
select throws_ok($$insert into public.tariffs (organization_id, site_id, name, version, currency, timezone, effective_from, components) values ('20000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 'Operator tariff', 'operator-forbidden', 'INR', 'Asia/Kolkata', '2026-01-01T00:00:00Z', '[]'::jsonb)$$, '42501', null, 'operator cannot change tariff configuration');
select throws_ok($$insert into public.organization_members (organization_id, user_id, role) values ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000006', 'viewer')$$, '42501', null, 'operator cannot change organization membership');

set local request.jwt.claim.sub = '10000000-0000-0000-0000-000000000002';
set local request.jwt.claims = '{"sub":"10000000-0000-0000-0000-000000000002","role":"authenticated"}';
select lives_ok($$insert into public.tariffs (organization_id, site_id, name, version, currency, timezone, effective_from, components) values ('20000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 'Admin tariff', 'admin-test', 'INR', 'Asia/Kolkata', '2026-01-01T00:00:00Z', '[{"name":"energy","ratePerKwh":10}]'::jsonb)$$, 'admin can add tariff configuration');
select lives_ok($$insert into public.organization_members (organization_id, user_id, role) values ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000006', 'viewer')$$, 'admin can add a viewer member');
select throws_ok($$update public.organization_members set role = 'owner' where organization_id = '20000000-0000-0000-0000-000000000001' and user_id = '10000000-0000-0000-0000-000000000006'$$, '42501', null, 'admin cannot promote a member to owner');

set local request.jwt.claim.sub = '10000000-0000-0000-0000-000000000001';
set local request.jwt.claims = '{"sub":"10000000-0000-0000-0000-000000000001","role":"authenticated"}';
update public.organization_members set role = 'admin' where organization_id = '20000000-0000-0000-0000-000000000001' and user_id = '10000000-0000-0000-0000-000000000001';
delete from public.organization_members where organization_id = '20000000-0000-0000-0000-000000000001' and user_id = '10000000-0000-0000-0000-000000000001';
select is((select role from public.organization_members where organization_id = '20000000-0000-0000-0000-000000000001' and user_id = '10000000-0000-0000-0000-000000000001'), 'owner', 'owner cannot demote or remove the final owner');
select lives_ok($$insert into public.organizations (name) values ('Owner-created test organization')$$, 'authenticated owner can create an organization');
select is((select count(*)::integer from public.organizations o join public.organization_members m on m.organization_id = o.id where o.name = 'Owner-created test organization' and m.user_id = '10000000-0000-0000-0000-000000000001' and m.role = 'owner'), 1, 'organization creator is automatically an owner');
delete from public.organization_members where organization_id = '20000000-0000-0000-0000-000000000001' and user_id = '10000000-0000-0000-0000-000000000004';
select is((select count(*)::integer from public.organization_members where organization_id = '20000000-0000-0000-0000-000000000001' and user_id = '10000000-0000-0000-0000-000000000004'), 0, 'owner can remove a viewer member');

set local request.jwt.claim.sub = '10000000-0000-0000-0000-000000000004';
set local request.jwt.claims = '{"sub":"10000000-0000-0000-0000-000000000004","role":"authenticated"}';
select is((select count(*)::integer from public.organizations), 0, 'removed viewer loses organization access');

set local request.jwt.claim.sub = '10000000-0000-0000-0000-000000000005';
set local request.jwt.claims = '{"sub":"10000000-0000-0000-0000-000000000005","role":"authenticated"}';
select throws_ok($$insert into public.sites (organization_id, name, sector) values ('20000000-0000-0000-0000-000000000001', 'Cross-tenant forbidden', 'office')$$, '42501', null, 'tenant B user cannot create a site in tenant A');

select * from finish();
rollback;
