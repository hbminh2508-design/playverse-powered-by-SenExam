'use client';

import React, { useState } from 'react';
import { X, Hash, Volume2 } from 'lucide-react';
import { ChannelType } from '@/types/database';

interface CreateChannelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateChannel: (name: string, type: ChannelType, topic?: string) => void;
}

export function CreateChannelModal({
  isOpen,
  onClose,
  onCreateChannel,
}: CreateChannelModalProps) {
  const [type, setType] = useState<ChannelType>('text');
  const [name, setName] = useState('');
  const [topic, setTopic] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    // Discord formats text channel names in lowercase with hyphens
    const formattedName =
      type === 'text'
        ? name.trim().toLowerCase().replace(/\s+/g, '-')
        : name.trim();

    onCreateChannel(formattedName, type, topic.trim() || undefined);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 animate-tooltip">
      <div className="bg-[#313338] w-full max-w-md rounded-lg overflow-hidden shadow-2xl border border-[#232428]">
        {/* Header */}
        <div className="p-6 pb-4 relative">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-[#949ba4] hover:text-white transition cursor-pointer"
          >
            <X size={20} />
          </button>
          <h2 className="text-xl font-bold text-white mb-1">Tạo Kênh</h2>
          <p className="text-xs text-[#949ba4]">trong Kênh chat văn bản / thoại</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="px-6 pb-6 space-y-4">
            {/* Channel Type Selector */}
            <div>
              <label className="block text-xs font-bold text-[#b5bac1] uppercase tracking-wider mb-2">
                Loại kênh
              </label>
              <div className="space-y-2">
                <div
                  onClick={() => setType('text')}
                  className={`flex items-center gap-3 p-3 rounded-md cursor-pointer transition ${
                    type === 'text'
                      ? 'bg-[#404249] text-white'
                      : 'bg-[#2b2d31] text-[#949ba4] hover:bg-[#35373c] hover:text-[#dbdee1]'
                  }`}
                >
                  <Hash size={24} className="text-[#80848e]" />
                  <div>
                    <div className="font-semibold text-sm">Văn Bản (Text)</div>
                    <div className="text-xs text-[#949ba4]">
                      Đăng tin nhắn, hình ảnh, tài liệu và emoji
                    </div>
                  </div>
                </div>

                <div
                  onClick={() => setType('voice')}
                  className={`flex items-center gap-3 p-3 rounded-md cursor-pointer transition ${
                    type === 'voice'
                      ? 'bg-[#404249] text-white'
                      : 'bg-[#2b2d31] text-[#949ba4] hover:bg-[#35373c] hover:text-[#dbdee1]'
                  }`}
                >
                  <Volume2 size={24} className="text-[#80848e]" />
                  <div>
                    <div className="font-semibold text-sm">Đàm Thoại (Voice)</div>
                    <div className="text-xs text-[#949ba4]">
                      Họp nhóm, nói chuyện bằng giọng nói và stream màn hình
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Channel Name */}
            <div>
              <label className="block text-xs font-bold text-[#b5bac1] uppercase tracking-wider mb-2">
                Tên kênh <span className="text-red-500">*</span>
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3 text-[#949ba4]">
                  {type === 'text' ? <Hash size={16} /> : <Volume2 size={16} />}
                </span>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={type === 'text' ? 'kênh-mới' : 'Phòng Thoại Mới'}
                  className="w-full bg-[#1e1f22] text-white text-sm rounded pl-8 pr-3 py-2.5 outline-none focus:ring-2 focus:ring-[#5865f2] border border-[#232428]"
                />
              </div>
            </div>

            {/* Channel Topic */}
            <div>
              <label className="block text-xs font-bold text-[#b5bac1] uppercase tracking-wider mb-2">
                Chủ đề kênh (tùy chọn)
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Mô tả mục đích của kênh này..."
                className="w-full bg-[#1e1f22] text-white text-sm rounded p-2.5 outline-none focus:ring-2 focus:ring-[#5865f2] border border-[#232428]"
              />
            </div>
          </div>

          {/* Footer */}
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
              Tạo kênh
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
