alter table public.resources
add column if not exists resource_type text not null default 'resource',
add column if not exists is_featured boolean not null default false,
add column if not exists is_hot boolean not null default false,
add column if not exists is_published boolean not null default true,
add column if not exists seo_title text,
add column if not exists seo_description text;

create index if not exists resources_resource_type_idx on public.resources (resource_type);
create index if not exists resources_category_idx on public.resources (category);
create index if not exists resources_is_featured_idx on public.resources (is_featured);
create index if not exists resources_is_hot_idx on public.resources (is_hot);
create index if not exists resources_is_published_idx on public.resources (is_published);

create table if not exists public.site_settings (
  id uuid primary key default gen_random_uuid(),
  hero_title text not null default 'AI 产品实验室与资源工作台',
  hero_subtitle text not null default '海外 AI 资源筛选、AI 工具库、工程数字化与 TikTok 商业运营内容中心',
  hero_description text not null default '这里会持续沉淀可落地的 AI 工具、工作流、教程和未来 SaaS 实验入口，面向内容创作者、AI 工具玩家、副业创业者和工程数字化实践者。',
  primary_cta_text text not null default '进入 AI 资源库',
  primary_cta_href text not null default '/resources',
  secondary_cta_text text not null default '查看新手路线',
  secondary_cta_href text not null default '/roadmap',
  site_tagline text not null default 'AI + 工程数字化 + TikTok 商业运营 + SaaS 实验',
  seo_title text not null default 'AI资源工作台 | 海外AI工具筛选与AI工作流教程',
  seo_description text not null default '面向普通人、内容创作者、AI工具玩家和副业创业者的海外 AI 资源筛选、AI 工具库与 AI 工作流分享站。',
  brand_name text not null default 'AI资源工作台',
  footer_description text not null default '一个面向 AI 工具、工程数字化、TikTok 运营和未来 SaaS 产品的个人品牌内容平台。',
  homepage_featured_title text not null default '精选资源与工作流',
  homepage_featured_description text not null default '优先展示经过筛选、适合上手、能服务真实工作流的资源与内容。',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.home_sections (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  href text not null,
  icon text,
  badge text,
  sort_order integer not null default 100,
  is_active boolean not null default true,
  section_type text not null default 'homepage_entry',
  image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_site_settings_updated_at on public.site_settings;
create trigger set_site_settings_updated_at
before update on public.site_settings
for each row execute function public.set_updated_at();

drop trigger if exists set_home_sections_updated_at on public.home_sections;
create trigger set_home_sections_updated_at
before update on public.home_sections
for each row execute function public.set_updated_at();

insert into public.site_settings (
  hero_title,
  hero_subtitle,
  hero_description,
  primary_cta_text,
  primary_cta_href,
  secondary_cta_text,
  secondary_cta_href,
  site_tagline,
  seo_title,
  seo_description,
  brand_name,
  footer_description,
  homepage_featured_title,
  homepage_featured_description
)
select
  'AI 产品实验室与资源工作台',
  '海外 AI 资源筛选、AI 工具库、工程数字化与 TikTok 商业运营内容中心',
  '这里会持续沉淀可落地的 AI 工具、工作流、教程和未来 SaaS 实验入口，面向内容创作者、AI 工具玩家、副业创业者和工程数字化实践者。',
  '进入 AI 资源库',
  '/resources',
  '查看新手路线',
  '/roadmap',
  'AI + 工程数字化 + TikTok 商业运营 + SaaS 实验',
  'AI资源工作台 | 海外AI工具筛选与AI工作流教程',
  '面向普通人、内容创作者、AI工具玩家和副业创业者的海外 AI 资源筛选、AI 工具库与 AI 工作流分享站。',
  'AI资源工作台',
  '一个面向 AI 工具、工程数字化、TikTok 运营和未来 SaaS 产品的个人品牌内容平台。',
  '精选资源与工作流',
  '优先展示经过筛选、适合上手、能服务真实工作流的资源与内容。'
where not exists (select 1 from public.site_settings);

insert into public.home_sections (
  title,
  description,
  href,
  icon,
  badge,
  sort_order,
  section_type
) values
  ('AI 工具库', '按场景筛选海外 AI 工具，关注可用性、门槛、价格与替代方案。', '/tools', 'Wrench', 'Tool Library', 10, 'homepage_entry'),
  ('AI 工作流', '沉淀从选题、资料、生成、自动化到发布的可复用流程。', '/workflows', 'Workflow', 'Workflow', 20, 'homepage_entry'),
  ('AI 新手路线', '把 AI 学习路径拆成通用助手、搜索研究、知识库、创作工具和自动化几个阶段。', '/roadmap', 'Route', 'Roadmap', 30, 'homepage_entry'),
  ('AI 教程', '后续用于发布长文教程、操作指南、工具评测和实战案例。', '/tutorials', 'BookOpenText', 'Tutorial', 40, 'homepage_entry'),
  ('TikTok AI 运营', '预留 TikTok 选题、脚本、素材、账号运营与商业化内容入口。', '/tutorials?t=tiktok-ai', 'Video', 'TikTok AI', 50, 'homepage_entry'),
  ('工程 AI 应用', '预留工程资料、造价、投标、项目管理和数字化工具的 AI 应用内容。', '/tutorials?t=engineering-ai', 'HardHat', 'Engineering AI', 60, 'homepage_entry'),
  ('未来 SaaS 产品', '预留 AI 造价、投标辅助、内容自动化与垂直工具产品入口。', '/roadmap#saas', 'Rocket', 'SaaS Lab', 70, 'homepage_entry')
on conflict do nothing;

update public.resources
set
  resource_type = case
    when category in ('通用助手', 'AI搜索', '知识库', '设计创作', '图片生成', '视频创作', '音频创作', '开发资源') then 'tool'
    else resource_type
  end,
  is_featured = rating >= 5,
  is_hot = category in ('通用助手', 'AI搜索'),
  is_published = true
where true;
