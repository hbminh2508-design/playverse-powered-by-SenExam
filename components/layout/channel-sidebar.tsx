'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Server, Channel } from '@/types/database';
import { useAuth } from '@/lib/context/auth-context';
import { VoiceStatusBar } from '@/components/voice/voice-status-bar';
import {
  Hash,
  Volume2,
  ChevronDown,
  Plus,
  Settings,
  Mic,
  MicOff,
  Headphones,
  UserPlus,
  LogOut,
  X,
} from 'lucide-react';

interface ChannelSidebarProps {
  server: Server;
  channels: Channel[];
  activeChannelId: string;
  activeVoiceChannel?: Channel | null;
  onOpenCreateChannel: () => void;
  onOpenInvite: () => void;
  onOpenUserSettings: () => void;
  onDisconnectVoice?: () => void;
}

export function ChannelSidebar({
  server,
  channels,
  activeChannelId,
  activeVoiceChannel,
  onOpenCreateChannel,
  onOpenInvite,
  onOpenUserSettings,
  onDisconnectVoice,
}: ChannelSidebarProps) {
  const { profile } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isDeafened, setIsDeafened] = useState(false);

  const textChannels = channels.filter((c) => c.type === 'text');
  const voiceChannels = channels.filter((c) => c.type === 'voice');

  const statusColorMap = {
    online: 'bg-[#23a55a]',
    idle: 'bg-[#f0b232]',
    dnd: 'bg-[#f23f43]',
    offline: 'bg-[#80848e]',
  };

  return (
    <aside className="w-60 bg-[#2b2d31] flex flex-col h-full border-r border-[#1f2023]/40 select-none overflow-x-hidden">
      {/* Server Header Dropdown */}
      <div className="relative shrink-0">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="w-full h-12 px-4 flex items-center justify-between font-semibold text-white border-b border-[#1f2023] hover:bg-[#35373c] transition cursor-pointer"
        >
          <span className="truncate">{server.name}</span>
          {dropdownOpen ? <X size={18} /> : <ChevronDown size={18} />}
        </button>

        {/* Dropdown Menu */}
        {dropdownOpen && (
          <div className="absolute top-13 left-2 right-2 bg-[#111214] rounded-md p-1.5 shadow-2xl z-50 flex flex-col gap-1 text-sm border border-[#232428]">
            <button
              onClick={() => {
                setDropdownOpen(false);
                onOpenInvite();
              }}
              className="flex items-center justify-between px-2.5 py-2 rounded text-[#949ba4] hover:bg-[#5865f2] hover:text-white transition cursor-pointer"
            >
              <span>Mời mọi người</span>
              <UserPlus size={16} />
            </button>
            <button
              onClick={() => {
                setDropdownOpen(false);
                onOpenCreateChannel();
              }}
              className="flex items-center justify-between px-2.5 py-2 rounded text-[#949ba4] hover:bg-[#5865f2] hover:text-white transition cursor-pointer"
            >
              <span>Tạo kênh</span>
              <Plus size={16} />
            </button>
            <div className="h-[1px] bg-[#232428] my-1" />
            <button
              onClick={() => {
                setDropdownOpen(false);
              }}
              className="flex items-center justify-between px-2.5 py-2 rounded text-[#f23f43] hover:bg-[#f23f43] hover:text-white transition cursor-pointer"
            >
              <span>Rời máy chủ</span>
              <LogOut size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Channels List - Cuộn dọc mượt mà, triệt tiêu hoàn toàn cuộn ngang */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-3 space-y-4">
        {/* Text Channels Category */}
        <div>
          <div className="flex items-center justify-between px-2 text-[11px] font-bold text-[#949ba4] tracking-wider uppercase group">
            <span>Kênh Chat Văn Bản</span>
            <button
              onClick={onOpenCreateChannel}
              className="opacity-0 group-hover:opacity-100 hover:text-white transition cursor-pointer"
              title="Tạo kênh văn bản"
            >
              <Plus size={14} />
            </button>
          </div>
          <div className="mt-1 space-y-0.5">
            {textChannels.map((ch) => {
              const isActive = ch.id === activeChannelId;
              return (
                <Link
                  key={ch.id}
                  href={`/channels/${server.id}/${ch.id}`}
                  className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition ${
                    isActive
                      ? 'bg-[#404249] text-white font-medium'
                      : 'text-[#949ba4] hover:bg-[#35373c] hover:text-[#dbdee1]'
                  }`}
                >
                  <Hash size={18} className="text-[#80848e] shrink-0" />
                  <span className="truncate">{ch.name}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Voice Channels Category */}
        <div>
          <div className="flex items-center justify-between px-2 text-[11px] font-bold text-[#949ba4] tracking-wider uppercase group">
            <span>Kênh Đàm Thoại & Video</span>
            <button
              onClick={onOpenCreateChannel}
              className="opacity-0 group-hover:opacity-100 hover:text-white transition cursor-pointer"
              title="Tạo kênh thoại"
            >
              <Plus size={14} />
            </button>
          </div>
          <div className="mt-1 space-y-0.5">
            {voiceChannels.map((ch) => {
              const isActive = ch.id === activeChannelId;
              return (
                <Link
                  key={ch.id}
                  href={`/channels/${server.id}/${ch.id}`}
                  className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-sm cursor-pointer transition ${
                    isActive
                      ? 'bg-[#404249] text-[#23a55a] font-medium'
                      : 'text-[#949ba4] hover:bg-[#35373c] hover:text-[#dbdee1]'
                  }`}
                >
                  <Volume2 size={18} className={`shrink-0 ${isActive ? 'text-[#23a55a]' : 'text-[#80848e]'}`} />
                  <span className="truncate">{ch.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Voice Connection Status Bar (Hiển thị khi đang trong kênh thoại) */}
      {activeVoiceChannel && onDisconnectVoice && (
        <VoiceStatusBar
          channel={activeVoiceChannel}
          server={server}
          onDisconnect={onDisconnectVoice}
        />
      )}

      {/* User Status Bar Bottom */}
      <div className="h-14 bg-[#232428] px-2 flex items-center justify-between gap-1 select-none shrink-0 border-t border-[#1f2023]/60">
        <div
          onClick={onOpenUserSettings}
          className="flex items-center gap-2 p-1 rounded-md hover:bg-[#35373c] transition cursor-pointer flex-1 min-w-0"
        >
          {/* User Avatar + Status Dot */}
          <div className="relative shrink-0">
            <img
              src={profile?.avatar_url || 'https://api.dicebear.com/7.x/bottts/svg?seed=playverse'}
              alt="Avatar"
              className="w-8 h-8 rounded-full bg-[#1e1f22] object-cover"
            />
            <div
              className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-[#232428] ${
                statusColorMap[profile?.status || 'online']
              }`}
            />
          </div>
          {/* User Name & Status */}
          <div className="flex flex-col min-w-0 leading-tight">
            <span className="text-sm font-semibold text-white truncate">
              {profile?.display_name || profile?.username || 'PlayVerse User'}
            </span>
            <span className="text-[11px] text-[#949ba4] truncate">
              {profile?.custom_status || `#${profile?.username || '0001'}`}
            </span>
          </div>
        </div>

        {/* Action Buttons: Mic, Headset, Settings */}
        <div className="flex items-center gap-0.5 text-[#b5bac1] shrink-0">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`p-1.5 rounded hover:bg-[#35373c] hover:text-white transition cursor-pointer ${
              isMuted ? 'text-[#f23f43]' : ''
            }`}
            title={isMuted ? 'Bật micro' : 'Tắt micro'}
          >
            {isMuted ? <MicOff size={18} /> : <Mic size={18} />}
          </button>
          <button
            onClick={() => setIsDeafened(!isDeafened)}
            className={`p-1.5 rounded hover:bg-[#35373c] hover:text-white transition cursor-pointer ${
              isDeafened ? 'text-[#f23f43]' : ''
            }`}
            title={isDeafened ? 'Bật âm thanh' : 'Tắt âm thanh'}
          >
            <Headphones size={18} />
          </button>
          <button
            onClick={onOpenUserSettings}
            className="p-1.5 rounded hover:bg-[#35373c] hover:text-white transition cursor-pointer"
            title="Cài đặt người dùng"
          >
            <Settings size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
}
