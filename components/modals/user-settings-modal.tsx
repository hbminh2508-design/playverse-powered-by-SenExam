'use client';

import React, { useState } from 'react';
import { X, LogOut, ShieldCheck, Database, Check } from 'lucide-react';
import { useAuth } from '@/lib/context/auth-context';
import { UserStatus } from '@/types/database';

interface UserSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UserSettingsModal({ isOpen, onClose }: UserSettingsModalProps) {
  const { profile, signOut, isConfigured } = useAuth();
  const [displayName, setDisplayName] = useState(profile?.display_name || '');
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || '');
  const [customStatus, setCustomStatus] = useState(profile?.custom_status || '');
  const [status, setStatus] = useState<UserStatus>(profile?.status || 'online');
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (profile) {
      profile.display_name = displayName;
      profile.avatar_url = avatarUrl;
      profile.custom_status = customStatus;
      profile.status = status;
    }
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1000);
  };

  const statusOptions: { label: string; value: UserStatus; color: string }[] = [
    { label: 'Trực tuyến (Online)', value: 'online', color: 'bg-[#23a55a]' },
    { label: 'Chờ (Idle)', value: 'idle', color: 'bg-[#f0b232]' },
    { label: 'Không làm phiền (Do Not Disturb)', value: 'dnd', color: 'bg-[#f23f43]' },
    { label: 'Ẩn danh (Invisible)', value: 'offline', color: 'bg-[#80848e]' },
  ];

  return (
    <div className="fixed inset-0 bg-black/75 flex items-center justify-center p-4 z-50 animate-tooltip">
      <div className="bg-[#313338] w-full max-w-xl rounded-xl overflow-hidden shadow-2xl border border-[#232428] flex flex-col md:flex-row h-[560px]">
        {/* Left Settings Sidebar */}
        <div className="w-full md:w-48 bg-[#2b2d31] p-4 flex flex-col justify-between border-r border-[#1f2023]/40">
          <div>
            <div className="text-xs font-bold text-[#949ba4] uppercase tracking-wider px-2 mb-2">
              Cài Đặt Người Dùng
            </div>
            <div className="bg-[#404249] text-white px-2.5 py-1.5 rounded-md text-sm font-medium">
              Hồ Sơ Của Tôi
            </div>
          </div>

          <div className="space-y-3">
            {/* Backend Status */}
            <div className="bg-[#1e1f22] p-2 rounded text-[11px] text-[#949ba4] flex items-center gap-1.5">
              <Database size={14} className="text-[#5865f2] shrink-0" />
              <span>{isConfigured ? 'Supabase Connected' : 'Chế Độ Demo'}</span>
            </div>

            <button
              onClick={() => {
                signOut();
                onClose();
              }}
              className="w-full flex items-center justify-between px-2.5 py-2 rounded text-[#f23f43] hover:bg-[#f23f43]/10 transition cursor-pointer text-sm font-medium"
            >
              <span>Đăng xuất</span>
              <LogOut size={16} />
            </button>
          </div>
        </div>

        {/* Right Settings Content */}
        <div className="flex-1 p-6 overflow-y-auto relative flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Hồ Sơ Người Dùng</h2>
              <button
                onClick={onClose}
                className="text-[#949ba4] hover:text-white transition cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              {/* Display Name */}
              <div>
                <label className="block text-xs font-bold text-[#b5bac1] uppercase tracking-wider mb-2">
                  Tên hiển thị
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Nhập tên hiển thị..."
                  className="w-full bg-[#1e1f22] text-white text-sm rounded p-2.5 outline-none focus:ring-2 focus:ring-[#5865f2] border border-[#232428]"
                />
              </div>

              {/* Avatar URL */}
              <div>
                <label className="block text-xs font-bold text-[#b5bac1] uppercase tracking-wider mb-2">
                  Đường dẫn ảnh đại diện (Avatar URL)
                </label>
                <input
                  type="url"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://api.dicebear.com/..."
                  className="w-full bg-[#1e1f22] text-white text-sm rounded p-2.5 outline-none focus:ring-2 focus:ring-[#5865f2] border border-[#232428]"
                />
              </div>

              {/* Custom Status */}
              <div>
                <label className="block text-xs font-bold text-[#b5bac1] uppercase tracking-wider mb-2">
                  Trạng thái tùy chỉnh
                </label>
                <input
                  type="text"
                  value={customStatus}
                  onChange={(e) => setCustomStatus(e.target.value)}
                  placeholder="Đang làm gì đó..."
                  className="w-full bg-[#1e1f22] text-white text-sm rounded p-2.5 outline-none focus:ring-2 focus:ring-[#5865f2] border border-[#232428]"
                />
              </div>

              {/* Status Picker */}
              <div>
                <label className="block text-xs font-bold text-[#b5bac1] uppercase tracking-wider mb-2">
                  Trạng thái hoạt động
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {statusOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setStatus(opt.value)}
                      className={`flex items-center gap-2 p-2 rounded text-xs transition cursor-pointer border ${
                        status === opt.value
                          ? 'bg-[#404249] text-white border-[#5865f2]'
                          : 'bg-[#2b2d31] text-[#949ba4] border-transparent hover:bg-[#35373c]'
                      }`}
                    >
                      <div className={`w-3 h-3 rounded-full ${opt.color} shrink-0`} />
                      <span className="truncate">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-[#5865f2] hover:bg-[#4752c4] text-white font-medium py-2.5 rounded transition cursor-pointer flex items-center justify-center gap-2"
                >
                  {saved ? (
                    <>
                      <Check size={18} />
                      <span>Đã lưu thay đổi!</span>
                    </>
                  ) : (
                    <span>Lưu Thay Đổi</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
