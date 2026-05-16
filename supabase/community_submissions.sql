alter table public.users
add column if not exists role text not null default 'user' check (role in ('user', 'admin', 'moderator', 'vip')),
add column if not exists status text not null default 'active' check (status in ('active', 'restricted', 'banned')),
add column if not exists bio text,
add column if not exists reputation integer not null default 0,
add column if not exists can_submit boolean not null default true,
add column if not exists banned_until timestamptz,
add column if not exists violation_count integer not null default 0;

alter table public.resources
add column if not exists source_submission_id uuid,
add column if not exists contributor_user_id uuid references public.users(id) on delete set null;

create table if not exists public.user_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  submission_type text not null default 'resource' check (submission_type in ('tool', 'workflow', 'tutorial', 'resource', 'prompt', 'experience')),
  title text not null,
  slug text,
  summary text not null,
  content text,
  content_json jsonb,
  category text not null default 'AI资源',
  tags text[] not null default '{}',
  resource_url text,
  cover_image_url text,
  media_type text not null default 'none' check (media_type in ('none', 'file', 'video', 'image', 'link')),
  media_url text,
  media_file_name text,
  status text not null default 'pending' check (status in ('draft', 'pending', 'approved', 'rejected', 'published', 'deleted')),
  review_status text not null default 'pending' check (review_status in ('pending', 'approved', 'rejected')),
  review_reason text,
  reviewed_by uuid references public.users(id) on delete set null,
  reviewed_at timestamptz,
  ai_review_score numeric,
  risk_level text not null default 'unknown' check (risk_level in ('unknown', 'low', 'medium', 'high')),
  published_resource_id uuid references public.resources(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.submission_assets (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.user_submissions(id) on delete cascade,
  asset_type text not null check (asset_type in ('image', 'video', 'attachment', 'cover', 'preview', 'download')),
  url text not null,
  file_name text,
  mime_type text,
  size_bytes bigint,
  sort_order integer not null default 100,
  is_public boolean not null default false,
  created_at timestamptz not null default now()
);

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'resources_source_submission_id_fkey'
  ) then
    alter table public.resources
    add constraint resources_source_submission_id_fkey
    foreign key (source_submission_id)
    references public.user_submissions(id)
    on delete set null;
  end if;
end $$;

create index if not exists users_role_idx on public.users(role);
create index if not exists users_status_idx on public.users(status);
create index if not exists user_submissions_user_id_idx on public.user_submissions(user_id);
create index if not exists user_submissions_review_status_idx on public.user_submissions(review_status);
create index if not exists user_submissions_submission_type_idx on public.user_submissions(submission_type);
create index if not exists user_submissions_created_at_idx on public.user_submissions(created_at desc);
create index if not exists resources_source_submission_id_idx on public.resources(source_submission_id);
create index if not exists resources_contributor_user_id_idx on public.resources(contributor_user_id);
create index if not exists submission_assets_submission_id_idx on public.submission_assets(submission_id);

drop trigger if exists set_user_submissions_updated_at on public.user_submissions;
create trigger set_user_submissions_updated_at
before update on public.user_submissions
for each row execute function public.set_updated_at();

alter table public.user_submissions enable row level security;
alter table public.submission_assets enable row level security;

drop policy if exists "Users can read own submissions" on public.user_submissions;
create policy "Users can read own submissions"
on public.user_submissions
for select
using (auth.uid()::text = user_id::text);

drop policy if exists "Users can create own submissions" on public.user_submissions;
create policy "Users can create own submissions"
on public.user_submissions
for insert
with check (auth.uid()::text = user_id::text);

drop policy if exists "Users can read own submission assets" on public.submission_assets;
create policy "Users can read own submission assets"
on public.submission_assets
for select
using (
  exists (
    select 1
    from public.user_submissions s
    where s.id = submission_assets.submission_id
      and auth.uid()::text = s.user_id::text
  )
);
