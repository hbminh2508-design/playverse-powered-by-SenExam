-- ==============================================================================
-- PLAYVERSE - SUPABASE DATABASE INITIALIZATION SCHEMA
-- Discord-like Community Web Application
-- ==============================================================================

-- 1. EXTENSIONS
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- 2. TABLES

-- Profiles (Tài khoản người dùng liên kết với auth.users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  display_name text,
  avatar_url text,
  status text default 'online' check (status in ('online', 'idle', 'dnd', 'offline')),
  custom_status text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Servers (Máy chủ cộng đồng)
create table if not exists public.servers (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  icon_url text,
  invite_code text unique not null,
  owner_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Server Members (Thành viên tham gia server)
create table if not exists public.server_members (
  id uuid default gen_random_uuid() primary key,
  server_id uuid references public.servers(id) on delete cascade not null,
  profile_id uuid references public.profiles(id) on delete cascade not null,
  role text not null default 'member' check (role in ('owner', 'admin', 'moderator', 'member')),
  joined_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(server_id, profile_id)
);

-- Channels (Kênh chat văn bản hoặc thoại trong server)
create table if not exists public.channels (
  id uuid default gen_random_uuid() primary key,
  server_id uuid references public.servers(id) on delete cascade not null,
  name text not null,
  type text not null default 'text' check (type in ('text', 'voice')),
  topic text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Messages (Tin nhắn trong kênh)
create table if not exists public.messages (
  id uuid default gen_random_uuid() primary key,
  channel_id uuid references public.channels(id) on delete cascade not null,
  profile_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  attachments jsonb default '[]'::jsonb,
  reply_to_id uuid references public.messages(id) on delete set null,
  is_pinned boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. INDEXES FOR HIGH PERFORMANCE
create index if not exists idx_server_members_server on public.server_members(server_id);
create index if not exists idx_server_members_profile on public.server_members(profile_id);
create index if not exists idx_channels_server on public.channels(server_id);
create index if not exists idx_messages_channel on public.messages(channel_id);
create index if not exists idx_messages_created_at on public.messages(created_at desc);
create index if not exists idx_servers_invite_code on public.servers(invite_code);

-- 4. AUTOMATIC TRIGGERS & FUNCTIONS

-- A. Tự động tạo Profile khi user đăng ký Auth
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  raw_user_name text;
begin
  raw_user_name := coalesce(
    new.raw_user_meta_data->>'username',
    split_part(new.email, '@', 1)
  );

  -- Đảm bảo username không trùng lặp
  if exists (select 1 from public.profiles where username = raw_user_name) then
    raw_user_name := raw_user_name || '_' || substr(md5(random()::text), 1, 4);
  end if;

  insert into public.profiles (id, username, display_name, avatar_url)
  values (
    new.id,
    raw_user_name,
    coalesce(new.raw_user_meta_data->>'display_name', new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'avatar_url', null)
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- B. Tự động thêm Owner vào Server và tạo kênh #chung (general) khi tạo Server mới
create or replace function public.handle_new_server()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  -- Thêm người tạo thành viên với quyền owner
  insert into public.server_members (server_id, profile_id, role)
  values (new.id, new.owner_id, 'owner');

  -- Tạo kênh mặc định: chung (general)
  insert into public.channels (server_id, name, type, topic)
  values (new.id, 'chung', 'text', 'Chào mừng bạn đến với ' || new.name || '!');

  -- Tạo kênh thoại mặc định: Phòng Thoại (General Voice)
  insert into public.channels (server_id, name, type, topic)
  values (new.id, 'Phòng Thoại', 'voice', 'Kênh đàm thoại chung');

  return new;
end;
$$;

drop trigger if exists on_server_created on public.servers;
create trigger on_server_created
  after insert on public.servers
  for each row execute procedure public.handle_new_server();

-- 5. ROW LEVEL SECURITY (RLS) POLICIES

alter table public.profiles enable row level security;
alter table public.servers enable row level security;
alter table public.server_members enable row level security;
alter table public.channels enable row level security;
alter table public.messages enable row level security;

-- Profiles: Bất kỳ ai đăng nhập đều xem được profile; chỉ bản thân mới sửa được
create policy "Profiles viewable by authenticated users"
  on public.profiles for select
  using (auth.uid() is not null);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Servers: Thành viên server xem được server; người tạo server được tạo; owner sửa/xoá
create policy "Servers viewable by members or invite lookup"
  on public.servers for select
  using (
    auth.uid() is not null
  );

create policy "Authenticated users can create server"
  on public.servers for insert
  with check (auth.uid() = owner_id);

create policy "Server owner can update server"
  on public.servers for update
  using (auth.uid() = owner_id);

create policy "Server owner can delete server"
  on public.servers for delete
  using (auth.uid() = owner_id);

-- Server Members: Thành viên có thể xem danh sách thành viên
create policy "Server members viewable by members"
  on public.server_members for select
  using (auth.uid() is not null);

create policy "Users can join server as member"
  on public.server_members for insert
  with check (auth.uid() = profile_id);

create policy "Server owner or admin can update member role"
  on public.server_members for update
  using (
    exists (
      select 1 from public.server_members sm
      where sm.server_id = server_members.server_id
        and sm.profile_id = auth.uid()
        and sm.role in ('owner', 'admin')
    )
  );

create policy "Members can leave or owner/admin can kick"
  on public.server_members for delete
  using (
    auth.uid() = profile_id
    or exists (
      select 1 from public.server_members sm
      where sm.server_id = server_members.server_id
        and sm.profile_id = auth.uid()
        and sm.role in ('owner', 'admin')
    )
  );

-- Channels: Thành viên server xem được channels
create policy "Channels viewable by server members"
  on public.channels for select
  using (
    exists (
      select 1 from public.server_members
      where server_members.server_id = channels.server_id
        and server_members.profile_id = auth.uid()
    )
  );

create policy "Server owner or admin can create channels"
  on public.channels for insert
  with check (
    exists (
      select 1 from public.server_members
      where server_members.server_id = channels.server_id
        and server_members.profile_id = auth.uid()
        and server_members.role in ('owner', 'admin')
    )
  );

create policy "Server owner or admin can update channels"
  on public.channels for update
  using (
    exists (
      select 1 from public.server_members
      where server_members.server_id = channels.server_id
        and server_members.profile_id = auth.uid()
        and server_members.role in ('owner', 'admin')
    )
  );

create policy "Server owner or admin can delete channels"
  on public.channels for delete
  using (
    exists (
      select 1 from public.server_members
      where server_members.server_id = channels.server_id
        and server_members.profile_id = auth.uid()
        and server_members.role in ('owner', 'admin')
    )
  );

-- Messages: Thành viên server có thể xem và gửi tin nhắn
create policy "Messages viewable by channel server members"
  on public.messages for select
  using (
    exists (
      select 1 from public.channels c
      join public.server_members sm on sm.server_id = c.server_id
      where c.id = messages.channel_id
        and sm.profile_id = auth.uid()
    )
  );

create policy "Server members can insert messages"
  on public.messages for insert
  with check (
    auth.uid() = profile_id
    and exists (
      select 1 from public.channels c
      join public.server_members sm on sm.server_id = c.server_id
      where c.id = messages.channel_id
        and sm.profile_id = auth.uid()
    )
  );

create policy "Users can update their own messages"
  on public.messages for update
  using (auth.uid() = profile_id);

create policy "Users can delete own messages or server admins can moderate"
  on public.messages for delete
  using (
    auth.uid() = profile_id
    or exists (
      select 1 from public.channels c
      join public.server_members sm on sm.server_id = c.server_id
      where c.id = messages.channel_id
        and sm.profile_id = auth.uid()
        and sm.role in ('owner', 'admin', 'moderator')
    )
  );

-- 6. REALTIME PUBLICATION SETUP
-- Bật chế độ Realtime (WebSockets) cho các bảng cốt lõi
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.channels;
alter publication supabase_realtime add table public.server_members;
alter publication supabase_realtime add table public.profiles;

-- 7. STORAGE BUCKETS SETUP
insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true) on conflict do nothing;
insert into storage.buckets (id, name, public) values ('server-icons', 'server-icons', true) on conflict do nothing;
insert into storage.buckets (id, name, public) values ('attachments', 'attachments', true) on conflict do nothing;

create policy "Public view for avatars" on storage.objects for select using (bucket_id = 'avatars');
create policy "Authenticated users can upload avatars" on storage.objects for insert with check (bucket_id = 'avatars' and auth.uid() is not null);

create policy "Public view for server icons" on storage.objects for select using (bucket_id = 'server-icons');
create policy "Authenticated users can upload server icons" on storage.objects for insert with check (bucket_id = 'server-icons' and auth.uid() is not null);

create policy "Public view for attachments" on storage.objects for select using (bucket_id = 'attachments');
create policy "Authenticated users can upload attachments" on storage.objects for insert with check (bucket_id = 'attachments' and auth.uid() is not null);
