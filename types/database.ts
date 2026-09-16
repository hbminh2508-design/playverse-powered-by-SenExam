export type UserStatus = 'online' | 'idle' | 'dnd' | 'offline';
export type MemberRole = 'owner' | 'admin' | 'moderator' | 'member';
export type ChannelType = 'text' | 'voice';

export interface Profile {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  status: UserStatus;
  custom_status: string | null;
  created_at: string;
  updated_at: string;
}

export interface Server {
  id: string;
  name: string;
  icon_url: string | null;
  invite_code: string;
  owner_id: string;
  created_at: string;
}

export interface ServerMember {
  id: string;
  server_id: string;
  profile_id: string;
  role: MemberRole;
  joined_at: string;
  profile?: Profile;
}

export interface Channel {
  id: string;
  server_id: string;
  name: string;
  type: ChannelType;
  topic: string | null;
  created_at: string;
}

export interface MessageAttachment {
  name: string;
  url: string;
  type: string;
  size: number;
}

export interface Message {
  id: string;
  channel_id: string;
  profile_id: string;
  content: string;
  attachments: MessageAttachment[];
  reply_to_id: string | null;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
  profile?: Profile;
}
