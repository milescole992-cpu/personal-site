-- cms_layer_and_media.sql
-- Layer 1 to Layer 2: content_pages attach to home_sections

alter table public.content_pages
add column if not exists home_section_id uuid references public.home_sections(id) on delete set null;

create unique index if not exists content_pages_home_section_id_idx
on public.content_pages (home_section_id)
where home_section_id is not null;

-- Backfill: link pages to entries by legacy href = page_path
update public.content_pages cp
set home_section_id = hs.id
from public.home_sections hs
where cp.home_section_id is null
  and regexp_replace(hs.href, '/+$', '') = regexp_replace(cp.page_path, '/+$', '');

-- Resource media (file / inline video)
alter table public.resources
add column if not exists media_type text not null default 'none',
add column if not exists media_url text,
add column if not exists media_file_name text;

alter table public.resources
drop constraint if exists resources_media_type_check;

alter table public.resources
add constraint resources_media_type_check
check (media_type in ('none', 'file', 'video', 'link'));

-- Homepage module visibility (admin toggles)
alter table public.site_settings
add column if not exists show_homepage_featured boolean not null default true,
add column if not exists show_homepage_hot boolean not null default true,
add column if not exists show_homepage_latest boolean not null default true;

-- Supabase Storage bucket (skip this block if insert fails; create bucket in Dashboard instead)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'resource-media',
  'resource-media',
  true,
  52428800,
  array[
    'application/pdf',
    'application/zip',
    'application/x-zip-compressed',
    'text/plain',
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'video/mp4',
    'video/webm',
    'video/quicktime'
  ]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;
