'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { ChannelSidebar } from '@/components/layout/channel-sidebar';
import { ChatArea } from '@/components/layout/chat-area';
import { MemberSidebar } from '@/components/layout/member-sidebar';
import { CreateChannelModal } from '@/components/modals/create-channel-modal';
import { InviteModal } from '@/components/modals/invite-modal';
import { UserSettingsModal } from '@/components/modals/user-settings-modal';
import { Server, Channel, Message, ServerMember, ChannelType } from '@/types/database';
import { useAuth } from '@/lib/context/auth-context';
import { createClient } from '@/lib/supabase/client';
import {
  DEMO_SERVERS,
  DEMO_CHANNELS,
  DEMO_MEMBERS,
  DEMO_MESSAGES,
} from '@/lib/demo-data';

interface PageProps {
  params: Promise<{
    serverId: string;
    channelId: string;
  }>;
}

export default function ServerChannelPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const { serverId, channelId } = resolvedParams;

  const { user, profile, isConfigured } = useAuth();
  const router = useRouter();

  // State
  const [currentServer, setCurrentServer] = useState<Server | null>(null);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [activeChannel, setActiveChannel] = useState<Channel | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [members, setMembers] = useState<ServerMember[]>([]);

  // UI Modals State
  const [showMemberList, setShowMemberList] = useState(true);
  const [createChannelOpen, setCreateChannelOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [userSettingsOpen, setUserSettingsOpen] = useState(false);

  const supabase = createClient();

  // 1. Load Server & Channels
  useEffect(() => {
    const loadServerData = async () => {
      // Find server
      let s = DEMO_SERVERS.find((srv) => srv.id === serverId);

      if (isConfigured && !s) {
        const { data } = await supabase
          .from('servers')
          .select('*')
          .eq('id', serverId)
          .single();
        if (data) s = data as Server;
      }

      if (!s) {
        // Fallback default server
        s = DEMO_SERVERS[0];
      }
      setCurrentServer(s);

      // Find channels
      let chs = DEMO_CHANNELS[serverId] || DEMO_CHANNELS['server-playverse'];

      if (isConfigured) {
        const { data } = await supabase
          .from('channels')
          .select('*')
          .eq('server_id', serverId)
          .order('created_at', { ascending: true });

        if (data && data.length > 0) {
          chs = data as Channel[];
        }
      }

      setChannels(chs);

      // Determine active channel
      let active = chs.find((c) => c.id === channelId);
      if (!active) {
        active = chs.find((c) => c.type === 'text') || chs[0];
      }
      setActiveChannel(active || null);

      // Load Members
      let mems = DEMO_MEMBERS[serverId] || DEMO_MEMBERS['server-playverse'];
      if (isConfigured) {
        const { data } = await supabase
          .from('server_members')
          .select('*, profile:profiles(*)')
          .eq('server_id', serverId);

        if (data && data.length > 0) {
          mems = data as ServerMember[];
        }
      }
      setMembers(mems);
    };

    loadServerData();
  }, [serverId, channelId, isConfigured]);

  // 2. Load Messages for Active Channel & Subscribe Realtime
  useEffect(() => {
    if (!activeChannel) return;

    let initialMessages = DEMO_MESSAGES[activeChannel.id] || [];

    const fetchMessages = async () => {
      if (isConfigured) {
        const { data } = await supabase
          .from('messages')
          .select('*, profile:profiles(*)')
          .eq('channel_id', activeChannel.id)
          .order('created_at', { ascending: true });

        if (data && data.length > 0) {
          setMessages(data as Message[]);
          return;
        }
      }
      setMessages(initialMessages);
    };

    fetchMessages();

    // Setup Supabase Realtime Subscription
    if (isConfigured) {
      const channelSub = supabase
        .channel(`chat:${activeChannel.id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `channel_id=eq.${activeChannel.id}`,
          },
          async (payload) => {
            // Fetch profile for the new message
            const { data: userProfile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', payload.new.profile_id)
              .single();

            const newMsg: Message = {
              ...(payload.new as Message),
              profile: userProfile || undefined,
            };

            setMessages((prev) => [...prev, newMsg]);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channelSub);
      };
    }
  }, [activeChannel, isConfigured]);

  // 3. Action Handlers
  const handleSendMessage = async (content: string, attachments: any[] = []) => {
    if (!activeChannel || !profile) return;

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      channel_id: activeChannel.id,
      profile_id: profile.id,
      content,
      attachments,
      reply_to_id: null,
      is_pinned: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      profile: profile,
    };

    if (isConfigured && user) {
      try {
        await supabase.from('messages').insert({
          channel_id: activeChannel.id,
          profile_id: user.id,
          content,
          attachments,
        });
        return;
      } catch (err) {
        console.error('Lỗi gửi tin nhắn Supabase:', err);
      }
    }

    // Demo Mode: Local update
    setMessages((prev) => [...prev, newMessage]);
  };

  const handleCreateChannel = async (name: string, type: ChannelType, topic?: string) => {
    if (!currentServer) return;

    if (isConfigured) {
      try {
        const { data, error } = await supabase
          .from('channels')
          .insert({
            server_id: currentServer.id,
            name,
            type,
            topic: topic || null,
          })
          .select()
          .single();

        if (!error && data) {
          setChannels((prev) => [...prev, data as Channel]);
          router.push(`/channels/${currentServer.id}/${data.id}`);
          return;
        }
      } catch (err) {
        console.error('Lỗi tạo kênh:', err);
      }
    }

    // Demo Mode
    const newChan: Channel = {
      id: `ch-${Date.now()}`,
      server_id: currentServer.id,
      name,
      type,
      topic: topic || null,
      created_at: new Date().toISOString(),
    };

    setChannels((prev) => [...prev, newChan]);
    setActiveChannel(newChan);
    router.push(`/channels/${currentServer.id}/${newChan.id}`);
  };

  if (!currentServer || !activeChannel) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#313338] text-[#949ba4]">
        Đang tải máy chủ PlayVerse...
      </div>
    );
  }

  return (
    <div className="flex h-full w-full overflow-hidden">
      {/* 1. Channel Sidebar (240px) */}
      <ChannelSidebar
        server={currentServer}
        channels={channels}
        activeChannelId={activeChannel.id}
        onOpenCreateChannel={() => setCreateChannelOpen(true)}
        onOpenInvite={() => setInviteOpen(true)}
        onOpenUserSettings={() => setUserSettingsOpen(true)}
      />

      {/* 2. Main Chat Area */}
      <ChatArea
        channel={activeChannel}
        messages={messages}
        onSendMessage={handleSendMessage}
        showMemberList={showMemberList}
        onToggleMemberList={() => setShowMemberList(!showMemberList)}
      />

      {/* 3. Member Sidebar Right (240px) */}
      {showMemberList && <MemberSidebar members={members} />}

      {/* Modals */}
      <CreateChannelModal
        isOpen={createChannelOpen}
        onClose={() => setCreateChannelOpen(false)}
        onCreateChannel={handleCreateChannel}
      />

      <InviteModal
        isOpen={inviteOpen}
        onClose={() => setInviteOpen(false)}
        server={currentServer}
      />

      <UserSettingsModal
        isOpen={userSettingsOpen}
        onClose={() => setUserSettingsOpen(false)}
      />
    </div>
  );
}
