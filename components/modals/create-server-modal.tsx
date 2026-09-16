'use client';

import React, { useState } from 'react';
import { X, Compass } from 'lucide-react';

interface CreateServerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateServer: (name: string, iconUrl?: string) => void;
  onJoinServer: (inviteCode: string) => void;
}

export function CreateServerModal({
  isOpen,
  onClose,
  onCreateServer,
  onJoinServer,
}: CreateServerModalProps) {
  const [tab, setTab] = useState<'create' | 'join'>('create');
  const [serverName, setServerName] = useState('');
  const [iconUrl, setIconUrl] = useState('');
  const [inviteCode, setInviteCode] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tab === 'create') {
      if (!serverName.trim()) return;
      onCreateServer(serverName.trim(), iconUrl.trim() || undefined);
    } else {
      if (!inviteCode.trim()) return;
      onJoinServer(inviteCode.trim());
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 animate-tooltip">
      <div className="bg-[#313338] w-full max-w-md rounded-lg overflow-hidden shadow-2xl border border-[#232428]">
        {/* Modal Header */}
        <div className="p-6 text-center relative">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-[#949ba4] hover:text-white transition cursor-pointer"
          >
            <X size={20} />
          </button>
          <h2 className="text-2xl font-bold text-white mb-2">
            {tab === 'create' ? 'Tùy chỉnh máy chủ của bạn' : 'Tham gia một máy chủ'}
          </h2>
          <p className="text-sm text-[#949ba4]">
            {tab === 'create'
              ? 'Máy chủ là nơi bạn và bạn bè có thể giao lưu, chơi game và học tập cùng nhau.'
              : 'Nhập mã mời hoặc liên kết để tham gia máy chủ của bạn bè.'}
          </p>

          {/* Toggle Tabs */}
          <div className="flex bg-[#1e1f22] p-1 rounded-md mt-4">
            <button
              type="button"
              onClick={() => setTab('create')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded cursor-pointer transition ${
                tab === 'create' ? 'bg-[#5865f2] text-white' : 'text-[#949ba4] hover:text-white'
              }`}
            >
              Tạo máy chủ mới
            </button>
            <button
              type="button"
              onClick={() => setTab('join')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded cursor-pointer transition ${
                tab === 'join' ? 'bg-[#5865f2] text-white' : 'text-[#949ba4] hover:text-white'
              }`}
            >
              Tham gia bằng mã mời
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit}>
          <div className="px-6 pb-6 space-y-4">
            {tab === 'create' ? (
              <>
                <div>
                  <label className="block text-xs font-bold text-[#b5bac1] uppercase tracking-wider mb-2">
                    Tên máy chủ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={serverName}
                    onChange={(e) => setServerName(e.target.value)}
                    placeholder="Ví dụ: PlayVerse Gaming Club"
                    className="w-full bg-[#1e1f22] text-white text-sm rounded p-2.5 outline-none focus:ring-2 focus:ring-[#5865f2] border border-[#232428]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#b5bac1] uppercase tracking-wider mb-2">
                    Ảnh đại diện máy chủ (URL)
                  </label>
                  <input
                    type="url"
                    value={iconUrl}
                    onChange={(e) => setIconUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full bg-[#1e1f22] text-white text-sm rounded p-2.5 outline-none focus:ring-2 focus:ring-[#5865f2] border border-[#232428]"
                  />
                </div>
              </>
            ) : (
              <div>
                <label className="block text-xs font-bold text-[#b5bac1] uppercase tracking-wider mb-2">
                  Mã mời (Invite Code) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                  placeholder="Ví dụ: PLAYVERSE hoặc mã mời được chia sẻ"
                  className="w-full bg-[#1e1f22] text-white text-sm rounded p-2.5 outline-none focus:ring-2 focus:ring-[#5865f2] border border-[#232428]"
                />
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="bg-[#2b2d31] px-6 py-4 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="text-sm text-white hover:underline cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="bg-[#5865f2] hover:bg-[#4752c4] text-white text-sm font-medium px-6 py-2 rounded transition cursor-pointer"
            >
              {tab === 'create' ? 'Tạo' : 'Tham gia'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
