'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Channel, Message } from '@/types/database';
import { useAuth } from '@/lib/context/auth-context';
import {
  Hash,
  Volume2,
  Bell,
  Pin,
  Users,
  Search,
  PlusCircle,
  Smile,
  Send,
  Image as ImageIcon,
} from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

interface ChatAreaProps {
  channel: Channel;
  messages: Message[];
  onSendMessage: (content: string, attachments?: any[]) => void;
  showMemberList: boolean;
  onToggleMemberList: () => void;
}

export function ChatArea({
  channel,
  messages,
  onSendMessage,
  showMemberList,
  onToggleMemberList,
}: ChatAreaProps) {
  const { profile } = useAuth();
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  return (
    <main className="flex-1 flex flex-col h-full bg-[#313338] min-w-0">
      {/* Top Header */}
      <header className="h-12 border-b border-[#1f2023] px-4 flex items-center justify-between shadow-sm shrink-0 select-none">
        <div className="flex items-center gap-2 min-w-0">
          {channel.type === 'text' ? (
            <Hash size={24} className="text-[#80848e] shrink-0" />
          ) : (
            <Volume2 size={24} className="text-[#80848e] shrink-0" />
          )}
          <h2 className="font-bold text-white text-base truncate">{channel.name}</h2>
          {channel.topic && (
            <>
              <div className="w-[1px] h-4 bg-[#4e5058]/40 mx-2" />
              <span className="text-xs text-[#949ba4] truncate font-normal hidden sm:inline">
                {channel.topic}
              </span>
            </>
          )}
        </div>

        {/* Header Action Tools */}
        <div className="flex items-center gap-3 text-[#b5bac1]">
          <button className="hover:text-white transition p-1" title="Kênh thông báo">
            <Bell size={20} />
          </button>
          <button className="hover:text-white transition p-1" title="Tin nhắn đã ghim">
            <Pin size={20} />
          </button>
          <button
            onClick={onToggleMemberList}
            className={`hover:text-white transition p-1 ${
              showMemberList ? 'text-white' : ''
            }`}
            title="Danh sách thành viên"
          >
            <Users size={20} />
          </button>

          {/* Search Bar */}
          <div className="relative hidden md:block">
            <input
              type="text"
              placeholder="Tìm kiếm"
              className="bg-[#1e1f22] text-xs text-white rounded px-2 py-1 pl-2 pr-6 w-36 focus:w-60 transition-all outline-none placeholder-[#949ba4]"
            />
            <Search size={14} className="absolute right-2 top-2 text-[#949ba4]" />
          </div>
        </div>
      </header>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Welcome Channel Banner */}
        <div className="mt-8 mb-6">
          <div className="w-16 h-16 rounded-full bg-[#404249] flex items-center justify-center mb-2">
            <Hash size={40} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">Chào mừng bạn đến với #{channel.name}!</h1>
          <p className="text-sm text-[#949ba4]">
            Đây là điểm khởi đầu cho kênh #{channel.name}. Hãy gửi tin nhắn đầu tiên để bắt đầu cuộc trò chuyện!
          </p>
        </div>

        <div className="h-[1px] bg-[#3f4147] my-4" />

        {/* Message Items */}
        {messages.map((msg, index) => {
          const createdAtDate = new Date(msg.created_at);
          const timeFormatted = format(createdAtDate, 'HH:mm', { locale: vi });

          return (
            <div
              key={msg.id || index}
              className="flex gap-4 group hover:bg-[#2e3035] -mx-4 px-4 py-1.5 rounded transition"
            >
              {/* Avatar */}
              <img
                src={
                  msg.profile?.avatar_url ||
                  `https://api.dicebear.com/7.x/bottts/svg?seed=${msg.profile_id}`
                }
                alt="Avatar"
                className="w-10 h-10 rounded-full bg-[#1e1f22] shrink-0 mt-0.5 object-cover"
              />

              {/* Content & Meta */}
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="font-semibold text-sm text-white hover:underline cursor-pointer">
                    {msg.profile?.display_name || msg.profile?.username || 'Người dùng'}
                  </span>
                  <span className="text-[11px] text-[#949ba4]">{timeFormatted}</span>
                </div>

                <div className="text-sm text-[#dbdee1] mt-1 whitespace-pre-wrap leading-relaxed break-words">
                  {msg.content}
                </div>

                {/* Attachments (if any) */}
                {msg.attachments && msg.attachments.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {msg.attachments.map((att, idx) => (
                      <div key={idx} className="rounded overflow-hidden border border-[#3f4147]">
                        <img
                          src={att.url}
                          alt={att.name}
                          className="max-h-60 max-w-sm object-cover rounded"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Message Area */}
      <div className="px-4 pb-6 pt-1 select-none">
        <div className="bg-[#383a40] rounded-lg px-4 py-2.5 flex items-center gap-3">
          <button
            onClick={() => {
              const url = prompt('Nhập đường dẫn ảnh bạn muốn gửi:');
              if (url) {
                onSendMessage('Đã gửi một hình ảnh:', [
                  { name: 'image.jpg', url, type: 'image/jpeg', size: 1024 },
                ]);
              }
            }}
            className="text-[#b5bac1] hover:text-white transition cursor-pointer"
            title="Đính kèm tệp / ảnh"
          >
            <PlusCircle size={22} />
          </button>

          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Gửi tin nhắn tới #${channel.name}`}
            rows={1}
            className="flex-1 bg-transparent text-sm text-white outline-none resize-none placeholder-[#949ba4] max-h-32"
          />

          <button
            onClick={() => {
              setInputText((prev) => prev + ' 🚀');
            }}
            className="text-[#b5bac1] hover:text-white transition cursor-pointer"
            title="Thêm Emoji"
          >
            <Smile size={22} />
          </button>

          {inputText.trim() && (
            <button
              onClick={handleSend}
              className="text-[#5865f2] hover:text-[#4752c4] transition cursor-pointer"
              title="Gửi tin nhắn (Enter)"
            >
              <Send size={20} />
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
