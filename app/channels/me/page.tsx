'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/context/auth-context';
import { UserSettingsModal } from '@/components/modals/user-settings-modal';
import {
  Users,
  MessageSquare,
  Compass,
  Search,
  Sparkles,
  Settings,
  Mic,
  Headphones,
  Plus,
  UserPlus,
} from 'lucide-react';
import Link from 'next/link';

export default function DirectMessagesPage() {
  const { profile, isConfigured, isDemoMode } = useAuth();
  const [activeTab, setActiveTab] = useState<'online' | 'all' | 'add'>('online');
  const [settingsOpen, setSettingsOpen] = useState(false);

  // CHỈ HIỂN THỊ DANH SÁCH DEMO KHI Ở CHẾ ĐỘ DEMO
  // Khi đăng nhập tài khoản thật -> TUYỆT ĐỐI KHÔNG HIỂN THỊ BẤT KỲ DATA DEMO NÀO
  const demoFriends = [
    {
      id: 'fr-1',
      name: 'Alex Nguyễn',
      tag: 'alex#1024',
      status: 'idle',
      activity: 'AFK ăn trưa 🍜',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex',
    },
    {
      id: 'fr-2',
      name: 'Linh Chi',
      tag: 'linhchi#2048',
      status: 'online',
      activity: 'Nghe nhạc Chill 🎧',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=linh',
    },
    {
      id: 'fr-3',
      name: 'Minh Dev',
      tag: 'minhtech#4096',
      status: 'dnd',
      activity: 'Đang fix bug, đừng tag 🛑',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=minh',
    },
  ];

  const friends = isDemoMode ? demoFriends : [];

  return (
    <div className="flex h-full w-full bg-[#313338] text-[#dbdee1] overflow-x-hidden">
      {/* Me Left Sidebar (240px) */}
      <aside className="w-60 bg-[#2b2d31] flex flex-col h-full border-r border-[#1f2023]/40 select-none shrink-0 overflow-x-hidden">
        {/* Search header */}
        <div className="h-12 border-b border-[#1f2023] px-3 flex items-center shadow-sm shrink-0">
          <button className="w-full bg-[#1e1f22] text-[#949ba4] text-xs px-2 py-1.5 rounded flex items-center justify-between hover:text-white transition">
            <span>Tìm kiếm trò chuyện</span>
            <Search size={14} />
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-2 space-y-1">
          <button
            onClick={() => setActiveTab('online')}
            className="w-full flex items-center gap-4 px-3 py-2 rounded-md bg-[#404249] text-white text-sm font-medium transition cursor-pointer"
          >
            <Users size={20} className="text-[#dbdee1]" />
            <span>Bạn bè</span>
          </button>

          <div className="pt-4 px-3 flex items-center justify-between text-[11px] font-bold text-[#949ba4] uppercase tracking-wider">
            <span>Tin nhắn trực tiếp</span>
            <button onClick={() => setActiveTab('add')} className="hover:text-white transition cursor-pointer" title="Thêm bạn">
              <Plus size={14} />
            </button>
          </div>

          <div className="space-y-0.5 mt-1">
            {friends.length === 0 ? (
              <p className="text-xs text-[#949ba4] px-3 py-2 italic">
                Chưa có tin nhắn trực tiếp nào
              </p>
            ) : (
              friends.map((f) => (
                <div
                  key={f.id}
                  className="flex items-center gap-3 px-2 py-1.5 rounded-md hover:bg-[#35373c] text-[#949ba4] hover:text-[#dbdee1] transition cursor-pointer group"
                >
                  <div className="relative shrink-0">
                    <img
                      src={f.avatar}
                      alt={f.name}
                      className="w-8 h-8 rounded-full bg-[#1e1f22] object-cover"
                    />
                    <div
                      className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-[#2b2d31] ${
                        f.status === 'online'
                          ? 'bg-[#23a55a]'
                          : f.status === 'idle'
                          ? 'bg-[#f0b232]'
                          : 'bg-[#f23f43]'
                      }`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-white truncate">{f.name}</div>
                    <div className="text-[11px] text-[#949ba4] truncate">{f.activity}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Bottom User Profile Bar */}
        <div className="h-14 bg-[#232428] px-2 flex items-center justify-between gap-1 shrink-0 border-t border-[#1f2023]/60">
          <div
            onClick={() => setSettingsOpen(true)}
            className="flex items-center gap-2 p-1 rounded-md hover:bg-[#35373c] transition cursor-pointer flex-1 min-w-0"
          >
            <img
              src={profile?.avatar_url || 'https://api.dicebear.com/7.x/bottts/svg?seed=playverse'}
              alt="Avatar"
              className="w-8 h-8 rounded-full bg-[#1e1f22] object-cover shrink-0"
            />
            <div className="flex flex-col min-w-0 leading-tight">
              <span className="text-sm font-semibold text-white truncate">
                {profile?.display_name || profile?.username || 'PlayVerse User'}
              </span>
              <span className="text-[11px] text-[#949ba4] truncate">
                {profile?.custom_status || 'Trực tuyến'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-0.5 text-[#b5bac1] shrink-0">
            <button
              onClick={() => setSettingsOpen(true)}
              className="p-1.5 rounded hover:bg-[#35373c] hover:text-white transition cursor-pointer"
              title="Cài đặt người dùng"
            >
              <Settings size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Me Content */}
      <main className="flex-1 flex flex-col h-full bg-[#313338] min-w-0 overflow-x-hidden">
        {/* Header Tabs */}
        <header className="h-12 border-b border-[#1f2023] px-6 flex items-center justify-between shadow-sm shrink-0 bg-[#2b2d31]">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-white font-semibold pr-3 border-r border-[#4e5058]/40">
              <Users size={20} className="text-[#80848e]" />
              <span>Bạn bè</span>
            </div>
            <div className="flex items-center gap-2 text-sm font-medium">
              <button
                onClick={() => setActiveTab('online')}
                className={`px-2 py-1 rounded transition cursor-pointer ${
                  activeTab === 'online'
                    ? 'bg-[#404249] text-white'
                    : 'text-[#b5bac1] hover:bg-[#35373c]'
                }`}
              >
                Trực tuyến ({friends.length})
              </button>
              <button
                onClick={() => setActiveTab('all')}
                className={`px-2 py-1 rounded transition cursor-pointer ${
                  activeTab === 'all'
                    ? 'bg-[#404249] text-white'
                    : 'text-[#b5bac1] hover:bg-[#35373c]'
                }`}
              >
                Tất cả ({friends.length})
              </button>
              <button
                onClick={() => setActiveTab('add')}
                className={`px-2.5 py-0.5 rounded text-white font-medium transition cursor-pointer ${
                  activeTab === 'add'
                    ? 'bg-[#23a55a] text-white'
                    : 'bg-[#23a55a] hover:bg-[#1f9250]'
                }`}
              >
                Thêm bạn
              </button>
            </div>
          </div>
        </header>

        {/* Tab Body */}
        <div className="flex-1 p-6 overflow-y-auto overflow-x-hidden">
          {activeTab === 'add' ? (
            <div className="max-w-xl">
              <h2 className="text-base font-bold text-white uppercase tracking-wider mb-2">
                Thêm Bạn Bè
              </h2>
              <p className="text-xs text-[#949ba4] mb-4">
                Bạn có thể thêm bạn bè bằng tên người dùng PlayVerse của họ.
              </p>
              <div className="flex items-center bg-[#1e1f22] rounded-lg p-2 border border-[#232428]">
                <input
                  type="text"
                  placeholder="Nhập tên người dùng PlayVerse..."
                  className="flex-1 bg-transparent text-sm text-white px-3 outline-none"
                />
                <button
                  onClick={() => alert('Đã gửi lời mời kết bạn!')}
                  className="bg-[#5865f2] hover:bg-[#4752c4] text-white text-xs font-semibold px-4 py-2 rounded transition cursor-pointer"
                >
                  Gửi yêu cầu
                </button>
              </div>
            </div>
          ) : friends.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-80 text-center text-[#949ba4]">
              <div className="w-16 h-16 rounded-full bg-[#2b2d31] flex items-center justify-center mb-4 text-[#5865f2]">
                <UserPlus size={32} />
              </div>
              <h3 className="text-base font-semibold text-white mb-1">Chưa có bạn bè nào trực tuyến</h3>
              <p className="text-xs max-w-sm mb-4">
                Hãy thêm bạn bè bằng tên người dùng PlayVerse hoặc chia sẻ mã mời máy chủ của bạn!
              </p>
              <button
                onClick={() => setActiveTab('add')}
                className="bg-[#5865f2] hover:bg-[#4752c4] text-white text-xs font-semibold px-5 py-2.5 rounded-md transition cursor-pointer shadow"
              >
                Thêm bạn bè ngay
              </button>
            </div>
          ) : (
            <div>
              <h3 className="text-xs font-bold text-[#949ba4] uppercase tracking-wider mb-4">
                Trực tuyến — {friends.length}
              </h3>
              <div className="space-y-1">
                {friends.map((f) => (
                  <div
                    key={f.id}
                    className="flex items-center justify-between p-2.5 rounded-lg hover:bg-[#35373c] border-t border-[#3f4147]/30 transition group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={f.avatar}
                          alt={f.name}
                          className="w-10 h-10 rounded-full bg-[#1e1f22]"
                        />
                        <div
                          className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#313338] ${
                            f.status === 'online'
                              ? 'bg-[#23a55a]'
                              : f.status === 'idle'
                              ? 'bg-[#f0b232]'
                              : 'bg-[#f23f43]'
                          }`}
                        />
                      </div>
                      <div>
                        <div className="flex items-baseline gap-1.5">
                          <span className="font-semibold text-white text-sm">{f.name}</span>
                          <span className="text-xs text-[#949ba4]">{f.tag}</span>
                        </div>
                        <div className="text-xs text-[#949ba4]">{f.activity}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => alert(`Bắt đầu chat với ${f.name}`)}
                        className="w-9 h-9 rounded-full bg-[#2b2d31] flex items-center justify-center text-[#b5bac1] hover:text-white hover:bg-[#1e1f22] transition cursor-pointer"
                        title="Gửi tin nhắn"
                      >
                        <MessageSquare size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* User Settings Modal */}
      <UserSettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </div>
  );
}
