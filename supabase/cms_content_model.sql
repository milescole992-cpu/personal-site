alter table public.resources
add column if not exists content text,
add column if not exists content_type_id uuid,
add column if not exists category_id uuid,
add column if not exists cover_image_url text,
add column if not exists official_url text,
add column if not exists target_audience text,
add column if not exists pros text,
add column if not exists cons text,
add column if not exists beginner_friendly_level integer default 3 check (beginner_friendly_level >= 1 and beginner_friendly_level <= 5),
add column if not exists sort_order integer not null default 100;

update public.resources
set
  official_url = coalesce(official_url, source_url),
  target_audience = coalesce(target_audience, audience)
where true;

create table if not exists public.content_types (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  icon text,
  sort_order integer not null default 100,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.content_placements (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  page_path text not null,
  placement_key text not null,
  sort_order integer not null default 100,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.content_placement_relations (
  id uuid primary key default gen_random_uuid(),
  resource_id uuid not null references public.resources(id) on delete cascade,
  placement_id uuid not null references public.content_placements(id) on delete cascade,
  sort_order integer not null default 100,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (resource_id, placement_id)
);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'resources_content_type_id_fkey'
  ) then
    alter table public.resources
    add constraint resources_content_type_id_fkey
    foreign key (content_type_id)
    references public.content_types(id)
    on delete restrict;
  end if;
end $$;

create index if not exists resources_content_type_id_idx on public.resources (content_type_id);
create index if not exists resources_sort_order_idx on public.resources (sort_order);
create index if not exists cpr_resource_id_idx on public.content_placement_relations (resource_id);
create index if not exists cpr_placement_id_idx on public.content_placement_relations (placement_id);

drop trigger if exists set_content_types_updated_at on public.content_types;
create trigger set_content_types_updated_at
before update on public.content_types
for each row execute function public.set_updated_at();

drop trigger if exists set_content_placements_updated_at on public.content_placements;
create trigger set_content_placements_updated_at
before update on public.content_placements
for each row execute function public.set_updated_at();

drop trigger if exists set_content_placement_relations_updated_at on public.content_placement_relations;
create trigger set_content_placement_relations_updated_at
before update on public.content_placement_relations
for each row execute function public.set_updated_at();

insert into public.content_types (name, slug, description, icon, sort_order, is_active) values
  ('AI资源', 'ai-resource', '通用 AI 资源、资料包、入口和资源说明。', 'Archive', 10, true),
  ('AI工具', 'ai-tool', '可访问、可对比、可长期使用的 AI 工具。', 'Wrench', 20, true),
  ('AI工作流', 'ai-workflow', '可复用的 AI 工作流、流程模板和自动化链路。', 'Workflow', 30, true),
  ('教程文章', 'tutorial', '长文教程、操作指南、工具评测和实战案例。', 'BookOpenText', 40, true),
  ('新手路线', 'roadmap', '面向新手的路径、阶段和学习路线内容。', 'Route', 50, true),
  ('TikTok AI运营', 'tiktok-ai', 'TikTok 选题、脚本、素材、运营和商业化内容。', 'Video', 60, true),
  ('工程AI应用', 'engineering-ai', '工程资料、造价、投标、项目管理和数字化应用。', 'HardHat', 70, true),
  ('SaaS产品入口', 'saas-product', '未来 SaaS 产品、MVP 和垂直工具入口。', 'Rocket', 80, true)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  icon = excluded.icon,
  sort_order = excluded.sort_order,
  is_active = excluded.is_active;

insert into public.content_placements (name, slug, description, page_path, placement_key, sort_order, is_active) values
  ('首页精选', 'home-featured', '首页精选内容区，适合放最值得先看的内容。', '/', 'home_featured', 10, true),
  ('首页热门', 'home-hot', '首页热门内容区，适合放高点击、高关注内容。', '/', 'home_hot', 20, true),
  ('首页最新', 'home-latest', '首页最新发布内容区。', '/', 'home_latest', 30, true),
  ('资源库', 'resources', '资源库列表页。', '/resources', 'resources', 40, true),
  ('AI工具页', 'tools', 'AI 工具库页面。', '/tools', 'tools', 50, true),
  ('工作流页', 'workflows', 'AI 工作流页面。', '/workflows', 'workflows', 60, true),
  ('教程页', 'tutorials', 'AI 教程内容页面。', '/tutorials', 'tutorials', 70, true),
  ('新手路线页', 'roadmap', 'AI 新手路线页面。', '/roadmap', 'roadmap', 80, true),
  ('SaaS产品区', 'saas-products', '未来 SaaS 产品和实验入口。', '/roadmap#saas', 'saas_products', 90, true)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  page_path = excluded.page_path,
  placement_key = excluded.placement_key,
  sort_order = excluded.sort_order,
  is_active = excluded.is_active;

update public.resources r
set content_type_id = ct.id
from public.content_types ct
where r.content_type_id is null
and (
  (r.resource_type = 'tool' and ct.slug = 'ai-tool')
  or (r.resource_type = 'workflow' and ct.slug = 'ai-workflow')
  or (r.resource_type = 'tutorial' and ct.slug = 'tutorial')
  or (r.resource_type not in ('tool', 'workflow', 'tutorial') and ct.slug = 'ai-resource')
);

insert into public.content_placement_relations (resource_id, placement_id, sort_order, is_active)
select r.id, p.id, r.sort_order, true
from public.resources r
join public.content_placements p on p.slug = 'resources'
on conflict (resource_id, placement_id) do nothing;

insert into public.content_placement_relations (resource_id, placement_id, sort_order, is_active)
select r.id, p.id, r.sort_order, true
from public.resources r
join public.content_placements p on p.slug = 'tools'
where r.resource_type = 'tool'
on conflict (resource_id, placement_id) do nothing;

insert into public.content_placement_relations (resource_id, placement_id, sort_order, is_active)
select r.id, p.id, r.sort_order, true
from public.resources r
join public.content_placements p on p.slug = 'home-featured'
where r.is_featured = true
on conflict (resource_id, placement_id) do nothing;

insert into public.content_placement_relations (resource_id, placement_id, sort_order, is_active)
select r.id, p.id, r.sort_order, true
from public.resources r
join public.content_placements p on p.slug = 'home-hot'
where r.is_hot = true
on conflict (resource_id, placement_id) do nothing;

insert into public.content_placement_relations (resource_id, placement_id, sort_order, is_active)
select r.id, p.id, (row_number() over (order by r.published_at desc))::integer, true
from public.resources r
join public.content_placements p on p.slug = 'home-latest'
where r.is_published = true
order by r.published_at desc
limit 6
on conflict (resource_id, placement_id) do nothing;
