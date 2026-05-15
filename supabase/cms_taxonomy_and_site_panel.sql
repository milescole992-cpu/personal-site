alter table public.site_settings
add column if not exists hero_panel_eyebrow text not null default 'RESOURCE OS',
add column if not exists hero_panel_description text not null default '围绕 AI 工具、工作流和教程沉淀可复用资源。',
add column if not exists hero_panel_stat_1_label text not null default '入口',
add column if not exists hero_panel_stat_2_label text not null default '精选',
add column if not exists hero_panel_stat_3_label text not null default '教程';

create table if not exists public.taxonomy_terms (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null,
  kind text not null check (kind in ('tag', 'category')),
  description text,
  sort_order integer not null default 100,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (kind, slug)
);

create index if not exists taxonomy_terms_kind_idx
on public.taxonomy_terms (kind);

create index if not exists taxonomy_terms_sort_order_idx
on public.taxonomy_terms (sort_order);

drop trigger if exists set_taxonomy_terms_updated_at on public.taxonomy_terms;
create trigger set_taxonomy_terms_updated_at
before update on public.taxonomy_terms
for each row execute function public.set_updated_at();

insert into public.taxonomy_terms (name, slug, kind, sort_order, is_active)
select distinct
  category,
  coalesce(nullif(trim(both '-' from lower(regexp_replace(category, '[^a-zA-Z0-9]+', '-', 'g'))), ''), md5(category)),
  'category',
  100,
  true
from public.resources
where coalesce(category, '') <> ''
on conflict (kind, slug) do nothing;

insert into public.taxonomy_terms (name, slug, kind, sort_order, is_active)
select distinct
  tag,
  coalesce(nullif(trim(both '-' from lower(regexp_replace(tag, '[^a-zA-Z0-9]+', '-', 'g'))), ''), md5(tag)),
  'tag',
  100,
  true
from public.resources, unnest(tags) as tag
where coalesce(tag, '') <> ''
on conflict (kind, slug) do nothing;
