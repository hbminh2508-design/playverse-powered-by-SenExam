'use client';

import React, { useState } from 'react';
import { X, Copy, Check, Link as LinkIcon } from 'lucide-react';
import { Server } from '@/types/database';

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  server: Server;
}

export function InviteModal({ isOpen, onClose, server }: InviteModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const appUrl =
    typeof window !== 'undefined'
      ? window.location.origin
      : 'https://playverse.senexam.me';

  const inviteUrl = `${appUrl}/invite/${server.invite_code}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 animate-tooltip">
      <div className="bg-[#313338] w-full max-w-md rounded-lg overflow-hidden shadow-2xl border border-[#232428]">
        {/* Header */}
        <div className="p-6 pb-2 relative">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-[#949ba4] hover:text-white transition cursor-pointer"
          >
            <X size={20} />
          </button>
          <h2 className="text-lg font-bold text-white mb-1">
            Mời bạn bè tham gia {server.name}
          </h2>
          <p className="text-xs text-[#949ba4]">
            Gửi liên kết này cho bạn bè để họ tham gia vào máy chủ PlayVerse của bạn.
          </p>
        </div>

        {/* Body */}
        <div className="p-6 pt-3 space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#b5bac1] uppercase tracking-wider mb-2">
              Gửi một liên kết lời mời máy chủ
            </label>
            <div className="flex items-center bg-[#1e1f22] rounded p-1 border border-[#232428]">
              <input
                type="text"
                readOnly
                value={inviteUrl}
                className="flex-1 bg-transparent text-sm text-white px-3 py-1.5 outline-none font-mono select-all"
              />
              <button
                onClick={handleCopy}
                className={`px-4 py-2 rounded text-sm font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                  copied
                    ? 'bg-[#23a55a] text-white'
                    : 'bg-[#5865f2] hover:bg-[#4752c4] text-white'
                }`}
              >
                {copied ? (
                  <>
                    <Check size={16} />
                    <span>Đã chép</span>
                  </>
                ) : (
                  <>
                    <Copy size={16} />
                    <span>Sao chép</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-[11px] text-[#949ba4] mt-2">
              Liên kết mời của bạn được đặt mặc định là không bao giờ hết hạn.
            </p>
          </div>

          <div className="bg-[#2b2d31] p-3 rounded-md text-xs text-[#dbdee1] flex items-center gap-2">
            <LinkIcon size={16} className="text-[#5865f2] shrink-0" />
            <span>Mã mời nhanh: <strong className="text-white font-mono">{server.invite_code}</strong></span>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#2b2d31] px-6 py-3 flex justify-end">
          <button
            onClick={onClose}
            className="bg-[#383a40] hover:bg-[#404249] text-white text-sm font-medium px-5 py-1.5 rounded transition cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
