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
import { Server, Channel, Message, ServerMember, ChannelType } from '@/types/database';
import { useAuth } from '@/lib/context/auth-context';
import { createClient } from '@/lib/supabase/client';
import { useWebRTC } from '@/hooks/use-webrtc';
import {
  DEMO_SERVERS,
  DEMO_CHANNELS,
  DEMO_MEMBERS,
  DEMO_MESSAGES,
} from '@/lib/demo-data';
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

  const { user, profile, isConfigured, isDemoMode } = useAuth();
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

  const supabase = createClient();

  // WebRTC Hook for Voice & Video
  const isVoiceChannel = activeChannel?.type === 'voice';
  const webrtc = useWebRTC(isVoiceChannel ? activeChannel.id : null);

  // 1. Load Server & Channels
  useEffect(() => {
    const loadServerData = async () => {
      setLoadingServer(true);

      // Chế độ Demo
      if (isDemoMode) {
        let s = DEMO_SERVERS.find((srv) => srv.id === serverId) || DEMO_SERVERS[0];
        setCurrentServer(s);
        let chs = DEMO_CHANNELS[serverId] || DEMO_CHANNELS['server-playverse'] || [];
        setChannels(chs);
        let active = chs.find((c) => c.id === channelId) || chs.find((c) => c.type === 'text') || chs[0];
        setActiveChannel(active || null);
        let mems = DEMO_MEMBERS[serverId] || DEMO_MEMBERS['server-playverse'] || [];
        setMembers(mems);
        setLoadingServer(false);
        return;
      }

      // CHẾ ĐỘ THẬT (REAL SUPABASE): 100% DỮ LIỆU THẬT, KHÔNG DÙNG BẤT KỲ DEMO NÀO
      if (isConfigured && user) {
        try {
          // A. Tìm máy chủ
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

          // B. Tải các kênh thật của server này
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

          // C. Tải danh sách thành viên thật của server này
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
        return;
      }

      setLoadingServer(false);
    };

    loadServerData();
  }, [serverId, channelId, isConfigured, isDemoMode, user]);

  // 2. Load Messages for Active Channel & Subscribe Realtime (if text channel)
  useEffect(() => {
    if (!activeChannel || activeChannel.type !== 'text') return;

    const fetchMessages = async () => {
      // Chế độ Demo
      if (isDemoMode) {
        let initialMessages = DEMO_MESSAGES[activeChannel.id] || [];
        setMessages(initialMessages);
        return;
      }

      // CHẾ ĐỘ THẬT: CHỈ LẤY TIN NHẮN TỪ SUPABASE
      if (isConfigured && user) {
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
      }
    };

    fetchMessages();

    // Setup Supabase Realtime Subscription for chat
    if (isConfigured && !isDemoMode) {
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
    }
  }, [activeChannel, isConfigured, isDemoMode, user]);

  // 3. Action Handlers
  const handleSendMessage = async (content: string, attachments: any[] = []) => {
    if (!activeChannel || !profile) return;

    if (isConfigured && user && !isDemoMode) {
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
    if (isDemoMode) {
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
      setMessages((prev) => [...prev, newMessage]);
    }
  };

  const handleCreateChannel = async (name: string, type: ChannelType, topic?: string) => {
    if (!currentServer) return;

    if (isConfigured && user && !isDemoMode) {
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
    if (isDemoMode) {
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
    </div>
  );
}
