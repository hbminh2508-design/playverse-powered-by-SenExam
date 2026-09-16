'use client';

import React from 'react';
import { Channel, Server } from '@/types/database';
import { PhoneOff, Wifi, Volume2 } from 'lucide-react';

interface VoiceStatusBarProps {
  channel: Channel;
  server: Server;
  onDisconnect: () => void;
}

export function VoiceStatusBar({ channel, server, onDisconnect }: VoiceStatusBarProps) {
  return (
    <div className="bg-[#111214]/60 border-b border-[#1f2023] px-3 py-2 flex items-center justify-between select-none">
      <div className="flex items-center gap-2 min-w-0">
        <div className="text-[#23a55a] flex items-center shrink-0" title="RTC Đã kết nối">
          <Wifi size={16} />
        </div>
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1">
            <span className="text-xs font-bold text-[#23a55a] leading-tight truncate">
              Đã kết nối thoại
            </span>
          </div>
          <span className="text-[11px] text-[#949ba4] truncate">
            {channel.name} / {server.name}
          </span>
        </div>
      </div>

      <button
        onClick={onDisconnect}
        className="text-[#949ba4] hover:text-[#f23f43] hover:bg-[#35373c] p-1.5 rounded transition cursor-pointer shrink-0"
        title="Ngắt kết nối đàm thoại"
      >
        <PhoneOff size={16} />
      </button>
    </div>
  );
}
