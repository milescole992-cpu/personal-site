alter table public.users
add column if not exists username text,
add column if not exists profile_banner_url text,
add column if not exists contribution_score integer not null default 0;

update public.users
set username = lower(regexp_replace(split_part(email, '@', 1), '[^a-zA-Z0-9_]+', '-', 'g')) || '-' || left(id::text, 6)
where username is null or username = '';

create unique index if not exists users_username_unique_idx
on public.users(lower(username))
where username is not null and username <> '';

create table if not exists public.resource_comments (
  id uuid primary key default gen_random_uuid(),
  resource_id uuid not null references public.resources(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  content text not null,
  is_deleted boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.resource_likes (
  user_id uuid not null references public.users(id) on delete cascade,
  resource_id uuid not null references public.resources(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, resource_id)
);

drop trigger if exists set_resource_comments_updated_at on public.resource_comments;
create trigger set_resource_comments_updated_at
before update on public.resource_comments
for each row execute function public.set_updated_at();

create index if not exists resource_comments_resource_id_created_idx
on public.resource_comments(resource_id, created_at desc)
where is_deleted = false;

create index if not exists resource_comments_user_id_idx
on public.resource_comments(user_id);

create index if not exists resource_likes_resource_id_idx
on public.resource_likes(resource_id);

create index if not exists resource_likes_user_id_idx
on public.resource_likes(user_id);

alter table public.resource_comments enable row level security;
alter table public.resource_likes enable row level security;

drop policy if exists "Public can read visible comments" on public.resource_comments;
create policy "Public can read visible comments"
on public.resource_comments
for select
using (is_deleted = false);

drop policy if exists "Users can create own comments" on public.resource_comments;
create policy "Users can create own comments"
on public.resource_comments
for insert
with check (auth.uid()::text = user_id::text);

drop policy if exists "Users can update own comments" on public.resource_comments;
create policy "Users can update own comments"
on public.resource_comments
for update
using (auth.uid()::text = user_id::text)
with check (auth.uid()::text = user_id::text);

drop policy if exists "Public can read likes" on public.resource_likes;
create policy "Public can read likes"
on public.resource_likes
for select
using (true);

drop policy if exists "Users can like resources" on public.resource_likes;
create policy "Users can like resources"
on public.resource_likes
for insert
with check (auth.uid()::text = user_id::text);

drop policy if exists "Users can remove own likes" on public.resource_likes;
create policy "Users can remove own likes"
on public.resource_likes
for delete
using (auth.uid()::text = user_id::text);
