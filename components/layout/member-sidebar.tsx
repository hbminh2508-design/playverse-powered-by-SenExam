'use client';

import React from 'react';
import { ServerMember } from '@/types/database';
import { Crown, ShieldCheck } from 'lucide-react';

interface MemberSidebarProps {
  members: ServerMember[];
}

export function MemberSidebar({ members }: MemberSidebarProps) {
  const onlineMembers = members.filter(
    (m) => (m.profile?.status || 'online') !== 'offline'
  );
  const offlineMembers = members.filter(
    (m) => (m.profile?.status || 'online') === 'offline'
  );

  const statusColorMap = {
    online: 'bg-[#23a55a]',
    idle: 'bg-[#f0b232]',
    dnd: 'bg-[#f23f43]',
    offline: 'bg-[#80848e]',
  };

  return (
    <aside className="w-60 bg-[#2b2d31] flex flex-col h-full border-l border-[#1f2023]/40 overflow-y-auto px-3 py-4 select-none shrink-0 hidden lg:flex">
      {/* Online Section */}
      <div className="mb-4">
        <h3 className="text-xs font-bold text-[#949ba4] tracking-wider uppercase mb-1 px-1">
          Trực Tuyến — {onlineMembers.length}
        </h3>
        <div className="space-y-1">
          {onlineMembers.map((member) => {
            const profile = member.profile;
            return (
              <div
                key={member.id}
                className="flex items-center gap-3 px-2 py-1.5 rounded-md hover:bg-[#35373c] transition cursor-pointer group"
              >
                {/* Avatar + Status */}
                <div className="relative shrink-0">
                  <img
                    src={
                      profile?.avatar_url ||
                      `https://api.dicebear.com/7.x/bottts/svg?seed=${member.profile_id}`
                    }
                    alt="Avatar"
                    className="w-8 h-8 rounded-full bg-[#1e1f22] object-cover"
                  />
                  <div
                    className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-[#2b2d31] ${
                      statusColorMap[profile?.status || 'online']
                    }`}
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <span
                      className={`text-sm font-medium truncate ${
                        member.role === 'owner'
                          ? 'text-[#f0b232]'
                          : member.role === 'admin'
                          ? 'text-[#5865f2]'
                          : 'text-[#dbdee1] group-hover:text-white'
                      }`}
                    >
                      {profile?.display_name || profile?.username || 'Thành viên'}
                    </span>
                    {member.role === 'owner' && (
                      <Crown size={14} className="text-[#f0b232] shrink-0" />
                    )}
                    {member.role === 'admin' && (
                      <ShieldCheck size={14} className="text-[#5865f2] shrink-0" />
                    )}
                  </div>
                  {profile?.custom_status && (
                    <div className="text-[11px] text-[#949ba4] truncate">
                      {profile.custom_status}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Offline Section */}
      {offlineMembers.length > 0 && (
        <div>
          <h3 className="text-xs font-bold text-[#949ba4] tracking-wider uppercase mb-1 px-1">
            Ngoại Tuyến — {offlineMembers.length}
          </h3>
          <div className="space-y-1 opacity-70 hover:opacity-100 transition">
            {offlineMembers.map((member) => {
              const profile = member.profile;
              return (
                <div
                  key={member.id}
                  className="flex items-center gap-3 px-2 py-1.5 rounded-md hover:bg-[#35373c] transition cursor-pointer group"
                >
                  <div className="relative shrink-0">
                    <img
                      src={
                        profile?.avatar_url ||
                        `https://api.dicebear.com/7.x/bottts/svg?seed=${member.profile_id}`
                      }
                      alt="Avatar"
                      className="w-8 h-8 rounded-full bg-[#1e1f22] grayscale object-cover"
                    />
                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-[#2b2d31] bg-[#80848e]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium text-[#949ba4] truncate block">
                      {profile?.display_name || profile?.username || 'Thành viên'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </aside>
  );
}
