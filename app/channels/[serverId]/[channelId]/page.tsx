'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { ChannelSidebar } from '@/components/layout/channel-sidebar';
import { ChatArea } from '@/components/layout/chat-area';
import { MemberSidebar } from '@/components/layout/member-sidebar';
import { VoiceRoom } from '@/components/voice/voice-room';
import { CreateChannelModal } from '@/components/modals/create-channel-modal';
import { InviteModal } from '@/components/modals/invite-modal';
import { UserSettingsModal } from '@/components/modals/user-settings-modal';
import { ServerSettingsModal } from '@/components/modals/server-settings-modal';
import { Server, Channel, Message, ServerMember, ChannelType } from '@/types/database';
import { useAuth } from '@/lib/context/auth-context';
import { createClient } from '@/lib/supabase/client';
import { useWebRTC } from '@/hooks/use-webrtc';
import { Compass, Hash } from 'lucide-react';

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
  const [loadingServer, setLoadingServer] = useState(true);

  // UI Modals State
  const [showMemberList, setShowMemberList] = useState(true);
  const [createChannelOpen, setCreateChannelOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [userSettingsOpen, setUserSettingsOpen] = useState(false);
  const [serverSettingsOpen, setServerSettingsOpen] = useState(false);

  const supabase = createClient();

  // WebRTC Hook for Voice & Video
  const isVoiceChannel = activeChannel?.type === 'voice';
  const webrtc = useWebRTC(isVoiceChannel ? activeChannel.id : null);

  // 1. Fetch Server, Channels, and Members from Supabase
  const fetchServerData = async () => {
    if (!isConfigured || !user) {
      setLoadingServer(false);
      return;
    }

    try {
      // A. Máy chủ
      const { data: serverData, error: serverErr } = await supabase
        .from('servers')
        .select('*')
        .eq('id', serverId)
        .single();

      if (serverErr || !serverData) {
        setCurrentServer(null);
        setChannels([]);
        setActiveChannel(null);
        setMembers([]);
        setLoadingServer(false);
        return;
      }

      setCurrentServer(serverData as Server);

      // B. Danh sách Kênh
      const { data: channelsData } = await supabase
        .from('channels')
        .select('*')
        .eq('server_id', serverId)
        .order('created_at', { ascending: true });

      const realChannels = (channelsData || []) as Channel[];
      setChannels(realChannels);

      let active = realChannels.find((c) => c.id === channelId);
      if (!active) {
        active = realChannels.find((c) => c.type === 'text') || realChannels[0] || null;
      }
      setActiveChannel(active);

      // C. Danh sách Thành viên
      const { data: membersData } = await supabase
        .from('server_members')
        .select('*, profile:profiles(*)')
        .eq('server_id', serverId);

      setMembers((membersData || []) as ServerMember[]);
    } catch (err) {
      console.error('Lỗi tải dữ liệu máy chủ:', err);
    } finally {
      setLoadingServer(false);
    }
  };

  useEffect(() => {
    fetchServerData();
  }, [serverId, channelId, isConfigured, user]);

  // 2. Fetch Messages and subscribe Realtime for Active Channel
  useEffect(() => {
    if (!activeChannel || activeChannel.type !== 'text' || !isConfigured || !user) return;

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*, profile:profiles(*)')
        .eq('channel_id', activeChannel.id)
        .order('created_at', { ascending: true });

      if (!error && data) {
        setMessages(data as Message[]);
      } else {
        setMessages([]);
      }
    };

    fetchMessages();

    // Supabase Realtime Subscription
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
  }, [activeChannel, isConfigured, user]);

  // 3. Action Handlers
  const handleSendMessage = async (content: string, attachments: any[] = []) => {
    if (!activeChannel || !profile || !isConfigured || !user) return;

    try {
      await supabase.from('messages').insert({
        channel_id: activeChannel.id,
        profile_id: user.id,
        content,
        attachments,
      });
    } catch (err) {
      console.error('Lỗi gửi tin nhắn Supabase:', err);
    }
  };

  const handleCreateChannel = async (name: string, type: ChannelType, topic?: string) => {
    if (!currentServer || !isConfigured || !user) return;

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
      }
    } catch (err) {
      console.error('Lỗi tạo kênh:', err);
    }
  };

  const handleDisconnectVoice = () => {
    webrtc.disconnect();
    const defaultTextChannel = channels.find((c) => c.type === 'text') || channels[0];
    if (defaultTextChannel && currentServer) {
      router.push(`/channels/${currentServer.id}/${defaultTextChannel.id}`);
    }
  };

  if (loadingServer) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#313338] text-[#949ba4]">
        Đang tải máy chủ PlayVerse...
      </div>
    );
  }

  if (!currentServer) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#313338] text-[#949ba4] p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-[#2b2d31] flex items-center justify-center mb-4 text-[#5865f2]">
          <Compass size={36} />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Chưa tìm thấy máy chủ</h2>
        <p className="text-sm max-w-md mb-6">
          Máy chủ này không tồn tại hoặc bạn chưa tham gia. Hãy tạo máy chủ mới hoặc tham gia bằng mã mời!
        </p>
        <button
          onClick={() => router.push('/channels/me')}
          className="bg-[#5865f2] hover:bg-[#4752c4] text-white px-5 py-2.5 rounded-md text-sm font-medium transition cursor-pointer"
        >
          Về Trang Chủ / Bạn Bè
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full overflow-hidden">
      {/* 1. Channel Sidebar (240px) */}
      <ChannelSidebar
        server={currentServer}
        channels={channels}
        activeChannelId={activeChannel?.id || ''}
        activeVoiceChannel={isVoiceChannel ? activeChannel : null}
        onOpenCreateChannel={() => setCreateChannelOpen(true)}
        onOpenInvite={() => setInviteOpen(true)}
        onOpenUserSettings={() => setUserSettingsOpen(true)}
        onOpenServerSettings={() => setServerSettingsOpen(true)}
        onDisconnectVoice={handleDisconnectVoice}
      />

      {/* 2. Main Stage: Voice & Video Room HOẶC Chat Area */}
      {channels.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center bg-[#313338] text-[#949ba4] p-6 text-center">
          <Hash size={48} className="text-[#80848e] mb-3" />
          <h2 className="text-lg font-bold text-white mb-1">Chưa có kênh nào trong máy chủ này</h2>
          <p className="text-xs text-[#949ba4] mb-4">Hãy tạo kênh đầu tiên để bắt đầu trò chuyện!</p>
          <button
            onClick={() => setCreateChannelOpen(true)}
            className="bg-[#5865f2] hover:bg-[#4752c4] text-white px-4 py-2 rounded-md text-xs font-semibold cursor-pointer"
          >
            Tạo kênh mới
          </button>
        </div>
      ) : isVoiceChannel && activeChannel ? (
        <VoiceRoom
          channel={activeChannel}
          participants={webrtc.participants}
          localStream={webrtc.localStream}
          isMuted={webrtc.isMuted}
          isVideoOn={webrtc.isVideoOn}
          isScreenSharing={webrtc.isScreenSharing}
          onToggleMute={webrtc.toggleMute}
          onToggleVideo={webrtc.toggleVideo}
          onToggleScreenShare={webrtc.toggleScreenShare}
          onDisconnect={handleDisconnectVoice}
        />
      ) : activeChannel ? (
        <ChatArea
          channel={activeChannel}
          messages={messages}
          onSendMessage={handleSendMessage}
          showMemberList={showMemberList}
          onToggleMemberList={() => setShowMemberList(!showMemberList)}
        />
      ) : null}

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

      <ServerSettingsModal
        isOpen={serverSettingsOpen}
        onClose={() => setServerSettingsOpen(false)}
        server={currentServer}
        channels={channels}
        members={members}
        onUpdateServer={(updated) => {
          setCurrentServer((prev) => (prev ? { ...prev, ...updated } : prev));
        }}
        onDeleteServer={() => {
          router.push('/channels/me');
        }}
        onChannelUpdated={fetchServerData}
        onMembersUpdated={fetchServerData}
      />
    </div>
  );
}
