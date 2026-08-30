-- Orbit Chat database setup
-- Run this in Supabase SQL Editor before enabling database-backed chat.
-- The app uses anonymous browser-generated client IDs, so these policies are intentionally scoped
-- to the public anon role. For a public room-code chat this is the least complex free-tier setup;
-- add Supabase Auth before using it for private or sensitive conversations.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  user_id text primary key,
  username text not null check (char_length(username) between 1 and 40),
  avatar_url text,
  updated_at timestamptz not null default now()
);

create table if not exists public.rooms (
  room_code text primary key check (room_code ~ '^[0-9]{6,8}$'),
  name text,
  retention_days integer not null default 30 check (retention_days between 0 and 90),
  created_at timestamptz not null default now()
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  room_code text not null references public.rooms(room_code) on delete cascade,
  sender_id text not null,
  username text not null check (char_length(username) between 1 and 40),
  content text not null default '' check (char_length(content) <= 4000),
  kind text not null default 'text' check (kind in ('text', 'image', 'video', 'audio', 'file')),
  media_url text,
  media_name text,
  media_type text,
  media_size bigint,
  created_at timestamptz not null default now(),
  edited_at timestamptz,
  deleted_at timestamptz,
  expires_at timestamptz
);

-- Backward-compatible additions for the original prototype's messages table.
-- Existing rows remain readable; sender_id is nullable for legacy rows.
alter table public.messages add column if not exists sender_id text;
alter table public.messages add column if not exists kind text not null default 'text';
alter table public.messages add column if not exists media_url text;
alter table public.messages add column if not exists media_name text;
alter table public.messages add column if not exists media_type text;
alter table public.messages add column if not exists media_size bigint;
alter table public.messages add column if not exists edited_at timestamptz;
alter table public.messages add column if not exists deleted_at timestamptz;
alter table public.messages add column if not exists expires_at timestamptz;

create index if not exists messages_room_created_idx on public.messages(room_code, created_at);
create index if not exists messages_expires_idx on public.messages(expires_at) where expires_at is not null;
create index if not exists messages_sender_idx on public.messages(sender_id);

-- Allows the backend to clean up expired messages on join/send and via its periodic best effort pass.
create or replace function public.delete_expired_messages()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare deleted_count integer;
begin
  delete from public.messages where expires_at is not null and expires_at < now();
  get diagnostics deleted_count = row_count;
  return deleted_count;
end;
$$;

-- The backend inserts rooms lazily so a new room code works without a separate create-room screen.
create or replace function public.ensure_room(room_code_input text)
returns void
language sql
security definer
set search_path = public
as $$
  insert into public.rooms(room_code) values (room_code_input) on conflict (room_code) do nothing;
$$;

grant execute on function public.delete_expired_messages() to anon, authenticated;
grant execute on function public.ensure_room(text) to anon, authenticated;

grant select, insert, update on public.messages to anon, authenticated;
grant select, insert, update on public.profiles to anon, authenticated;
grant select, insert, update on public.rooms to anon, authenticated;

alter table public.messages enable row level security;
alter table public.profiles enable row level security;
alter table public.rooms enable row level security;

drop policy if exists "public can read messages" on public.messages;
create policy "public can read messages" on public.messages for select using (true);
drop policy if exists "public can create messages" on public.messages;
create policy "public can create messages" on public.messages for insert with check (char_length(content) <= 4000);
drop policy if exists "public can update messages" on public.messages;
create policy "public can update messages" on public.messages for update using (true) with check (true);

drop policy if exists "public can read profiles" on public.profiles;
create policy "public can read profiles" on public.profiles for select using (true);
drop policy if exists "public can upsert profiles" on public.profiles;
create policy "public can upsert profiles" on public.profiles for insert with check (char_length(username) <= 40);
drop policy if exists "public can update profiles" on public.profiles;
create policy "public can update profiles" on public.profiles for update using (true) with check (char_length(username) <= 40);

drop policy if exists "public can read rooms" on public.rooms;
create policy "public can read rooms" on public.rooms for select using (true);
drop policy if exists "public can create rooms" on public.rooms;
create policy "public can create rooms" on public.rooms for insert with check (room_code ~ '^[0-9]{6,8}$');
drop policy if exists "public can update rooms" on public.rooms;
create policy "public can update rooms" on public.rooms for update using (true) with check (room_code ~ '^[0-9]{6,8}$');

-- Add messages to Supabase Realtime once. If the table is already a member, this block can be skipped.
do $$
begin
  alter publication supabase_realtime add table public.messages;
exception when duplicate_object then
  null;
end $$;

-- Create this bucket in Storage > Buckets if it does not already exist.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'chat-media', 'chat-media', true, 12582912,
  array['image/jpeg','image/png','image/webp','image/gif','video/mp4','video/webm','video/ogg','audio/mpeg','audio/mp4','audio/ogg','audio/webm','audio/wav','audio/aac','audio/x-m4a']
)
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

-- Public room-code chat policies. Tighten these after adding Auth if the app becomes private.
drop policy if exists "chat media is publicly readable" on storage.objects;
create policy "chat media is publicly readable" on storage.objects for select using (bucket_id = 'chat-media');
drop policy if exists "chat media can be uploaded" on storage.objects;
create policy "chat media can be uploaded" on storage.objects for insert with check (bucket_id = 'chat-media');
drop policy if exists "chat media can be updated" on storage.objects;
create policy "chat media can be updated" on storage.objects for update using (bucket_id = 'chat-media');
