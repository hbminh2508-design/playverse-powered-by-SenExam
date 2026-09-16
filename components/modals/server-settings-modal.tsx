'use client';

import React, { useState } from 'react';
import { Server, Channel, ServerMember } from '@/types/database';
import { useAuth } from '@/lib/context/auth-context';
import { createClient } from '@/lib/supabase/client';
import {
  X,
  Settings,
  Shield,
  Hash,
  Volume2,
  Users,
  Link as LinkIcon,
  Trash2,
  Check,
  Copy,
  RefreshCw,
  UserMinus,
  Crown,
  AlertTriangle,
  Plus,
} from 'lucide-react';

interface ServerSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  server: Server;
  channels: Channel[];
  members: ServerMember[];
  onUpdateServer?: (updated: Partial<Server>) => void;
  onDeleteServer?: () => void;
  onChannelUpdated?: () => void;
  onMembersUpdated?: () => void;
}

type TabType = 'overview' | 'roles' | 'channels' | 'members' | 'invites' | 'danger';

export function ServerSettingsModal({
  isOpen,
  onClose,
  server,
  channels,
  members,
  onUpdateServer,
  onDeleteServer,
  onChannelUpdated,
  onMembersUpdated,
}: ServerSettingsModalProps) {
  const { user } = useAuth();
  const supabase = createClient();

  const [activeTab, setActiveTab] = useState<TabType>('overview');

  // Overview form state
  const [serverName, setServerName] = useState(server.name);
  const [iconUrl, setIconUrl] = useState(server.icon_url || '');
  const [savingOverview, setSavingOverview] = useState(false);
  const [overviewSuccess, setOverviewSuccess] = useState(false);

  // Invites state
  const [inviteCode, setInviteCode] = useState(server.invite_code);
  const [copied, setCopied] = useState(false);
  const [regeneratingInvite, setRegeneratingInvite] = useState(false);

  // Channels state
  const [deletingChannelId, setDeletingChannelId] = useState<string | null>(null);

  // Members state
  const [updatingMemberId, setUpdatingMemberId] = useState<string | null>(null);

  // Delete server state
  const [confirmDelete, setConfirmDelete] = useState('');
  const [deletingServer, setDeletingServer] = useState(false);

  if (!isOpen) return null;

  const isOwner = user?.id === server.owner_id;
  const currentMember = members.find((m) => m.profile_id === user?.id);
  const isAdminOrOwner = isOwner || currentMember?.role === 'admin';

  // 1. Save Overview
  const handleSaveOverview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serverName.trim()) return;
    setSavingOverview(true);
    setOverviewSuccess(false);

    try {
      const { error } = await supabase
        .from('servers')
        .update({
          name: serverName.trim(),
          icon_url: iconUrl.trim() || null,
        })
        .eq('id', server.id);

      if (!error) {
        setOverviewSuccess(true);
        if (onUpdateServer) {
          onUpdateServer({ name: serverName.trim(), icon_url: iconUrl.trim() || null });
        }
        setTimeout(() => setOverviewSuccess(false), 2500);
      }
    } catch (err) {
      console.error('Lỗi cập nhật máy chủ:', err);
    } finally {
      setSavingOverview(false);
    }
  };

  // 2. Regenerate Invite Code
  const handleRegenerateInvite = async () => {
    setRegeneratingInvite(true);
    const newCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    try {
      const { error } = await supabase
        .from('servers')
        .update({ invite_code: newCode })
        .eq('id', server.id);

      if (!error) {
        setInviteCode(newCode);
        if (onUpdateServer) {
          onUpdateServer({ invite_code: newCode });
        }
      }
    } catch (err) {
      console.error('Lỗi tạo mã mời mới:', err);
    } finally {
      setRegeneratingInvite(false);
    }
  };

  // 3. Delete Channel
  const handleDeleteChannel = async (channelId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa kênh này vĩnh viễn không?')) return;
    setDeletingChannelId(channelId);

    try {
      const { error } = await supabase.from('channels').delete().eq('id', channelId);
      if (!error && onChannelUpdated) {
        onChannelUpdated();
      }
    } catch (err) {
      console.error('Lỗi xóa kênh:', err);
    } finally {
      setDeletingChannelId(null);
    }
  };

  // 4. Change Member Role
  const handleChangeRole = async (memberId: string, newRole: 'admin' | 'moderator' | 'member') => {
    setUpdatingMemberId(memberId);
    try {
      const { error } = await supabase
        .from('server_members')
        .update({ role: newRole })
        .eq('id', memberId);

      if (!error && onMembersUpdated) {
        onMembersUpdated();
      }
    } catch (err) {
      console.error('Lỗi cập nhật quyền:', err);
    } finally {
      setUpdatingMemberId(null);
    }
  };

  // 5. Kick Member
  const handleKickMember = async (memberId: string, memberName: string) => {
    if (!confirm(`Bạn có chắc chắn muốn đuổi "${memberName}" khỏi máy chủ không?`)) return;
    setUpdatingMemberId(memberId);

    try {
      const { error } = await supabase.from('server_members').delete().eq('id', memberId);
      if (!error && onMembersUpdated) {
        onMembersUpdated();
      }
    } catch (err) {
      console.error('Lỗi đuổi thành viên:', err);
    } finally {
      setUpdatingMemberId(null);
    }
  };

  // 6. Delete Server
  const handleDeleteServer = async () => {
    if (confirmDelete !== server.name) return;
    setDeletingServer(true);

    try {
      const { error } = await supabase.from('servers').delete().eq('id', server.id);
      if (!error && onDeleteServer) {
        onDeleteServer();
        onClose();
      }
    } catch (err) {
      console.error('Lỗi xóa server:', err);
    } finally {
      setDeletingServer(false);
    }
  };

  const inviteUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/invite/${inviteCode}`
    : `https://playverse.senexam.me/invite/${inviteCode}`;

  const copyInvite = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="bg-[#313338] text-[#dbdee1] w-full max-w-4xl h-[620px] rounded-2xl shadow-2xl flex overflow-hidden border border-[#2b2d31]">
        {/* Left Navigation Sidebar */}
        <div className="w-56 bg-[#2b2d31] p-3 flex flex-col justify-between shrink-0 border-r border-[#1f2023]/50">
          <div>
            <div className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-[#949ba4] truncate">
              {server.name}
            </div>

            <nav className="space-y-1 mt-1 text-sm font-medium">
              <button
                onClick={() => setActiveTab('overview')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition cursor-pointer ${
                  activeTab === 'overview'
                    ? 'bg-[#404249] text-white font-semibold'
                    : 'text-[#b5bac1] hover:bg-[#35373c] hover:text-white'
                }`}
              >
                <Settings size={17} />
                <span>Tổng Quan</span>
              </button>

              <button
                onClick={() => setActiveTab('roles')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition cursor-pointer ${
                  activeTab === 'roles'
                    ? 'bg-[#404249] text-white font-semibold'
                    : 'text-[#b5bac1] hover:bg-[#35373c] hover:text-white'
                }`}
              >
                <Shield size={17} />
                <span>Vai Trò & Quyền Hạn</span>
              </button>

              <button
                onClick={() => setActiveTab('channels')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition cursor-pointer ${
                  activeTab === 'channels'
                    ? 'bg-[#404249] text-white font-semibold'
                    : 'text-[#b5bac1] hover:bg-[#35373c] hover:text-white'
                }`}
              >
                <Hash size={17} />
                <span>Quản Lý Kênh</span>
              </button>

              <button
                onClick={() => setActiveTab('members')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition cursor-pointer ${
                  activeTab === 'members'
                    ? 'bg-[#404249] text-white font-semibold'
                    : 'text-[#b5bac1] hover:bg-[#35373c] hover:text-white'
                }`}
              >
                <Users size={17} />
                <span>Thành Viên ({members.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('invites')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition cursor-pointer ${
                  activeTab === 'invites'
                    ? 'bg-[#404249] text-white font-semibold'
                    : 'text-[#b5bac1] hover:bg-[#35373c] hover:text-white'
                }`}
              >
                <LinkIcon size={17} />
                <span>Mã Mời & Link</span>
              </button>

              {isAdminOrOwner && (
                <div className="pt-3 border-t border-[#35373c] mt-2">
                  <button
                    onClick={() => setActiveTab('danger')}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition cursor-pointer ${
                      activeTab === 'danger'
                        ? 'bg-[#f23f43]/20 text-[#f23f43] font-semibold'
                        : 'text-[#f23f43] hover:bg-[#f23f43]/15'
                    }`}
                  >
                    <Trash2 size={17} />
                    <span>Xóa Máy Chủ</span>
                  </button>
                </div>
              )}
            </nav>
          </div>

          <div className="px-3 py-2 text-[11px] text-[#949ba4]">
            ID: <span className="font-mono text-white/60">{server.id.substring(0, 8)}...</span>
          </div>
        </div>

        {/* Right Content Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#313338] relative">
          {/* Header Close Button */}
          <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-[#35373c] text-[#949ba4] hover:text-white transition cursor-pointer"
              title="Đóng cài đặt (ESC)"
            >
              <X size={20} />
            </button>
          </div>

          {/* Main Body */}
          <div className="flex-1 overflow-y-auto p-8 pr-12">
            {/* 1. OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div className="max-w-lg">
                <h2 className="text-xl font-bold text-white mb-6">Tổng Quan Máy Chủ</h2>

                <form onSubmit={handleSaveOverview} className="space-y-6">
                  {/* Server Icon Preview & URL */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#b5bac1] mb-2">
                      Biểu Tượng Máy Chủ
                    </label>
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 rounded-2xl bg-[#1e1f22] overflow-hidden flex items-center justify-center border border-[#3f4147] shrink-0">
                        {iconUrl ? (
                          <img
                            src={iconUrl}
                            alt="Server Icon"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <span className="text-2xl font-black text-[#5865f2]">
                            {serverName.substring(0, 2).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="flex-1">
                        <input
                          type="url"
                          value={iconUrl}
                          onChange={(e) => setIconUrl(e.target.value)}
                          placeholder="https://example.com/icon.png"
                          className="w-full bg-[#1e1f22] text-sm text-white rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-[#5865f2] border border-[#232428]"
                        />
                        <p className="text-[11px] text-[#949ba4] mt-1">
                          Khuyên dùng ảnh tỉ lệ 1:1, dung lượng nhẹ.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Server Name */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#b5bac1] mb-2">
                      Tên Máy Chủ
                    </label>
                    <input
                      type="text"
                      required
                      value={serverName}
                      onChange={(e) => setServerName(e.target.value)}
                      placeholder="Tên máy chủ của bạn"
                      className="w-full bg-[#1e1f22] text-sm text-white rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-[#5865f2] border border-[#232428]"
                    />
                  </div>

                  {overviewSuccess && (
                    <div className="p-3 bg-[#23a55a]/15 text-[#23a55a] rounded-lg text-xs font-semibold flex items-center gap-2">
                      <Check size={16} />
                      <span>Đã lưu các thay đổi thành công!</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={savingOverview}
                    className="bg-[#5865f2] hover:bg-[#4752c4] text-white font-bold px-6 py-2.5 rounded-lg text-sm transition shadow disabled:opacity-50 cursor-pointer"
                  >
                    {savingOverview ? 'Đang lưu...' : 'Lưu Thay Đổi'}
                  </button>
                </form>
              </div>
            )}

            {/* 2. ROLES & PERMISSIONS TAB */}
            {activeTab === 'roles' && (
              <div>
                <h2 className="text-xl font-bold text-white mb-2">Vai Trò & Phân Quyền</h2>
                <p className="text-xs text-[#949ba4] mb-6">
                  Sử dụng vai trò để thiết lập các quyền hạn của thành viên trong máy chủ theo tiêu chuẩn Discord.
                </p>

                <div className="space-y-4">
                  {/* Owner Role Card */}
                  <div className="bg-[#2b2d31] p-4 rounded-xl border border-[#3f4147] flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#f0b232]/20 text-[#f0b232] flex items-center justify-center shrink-0">
                      <Crown size={20} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-base">Chủ Sở Hữu (Owner)</span>
                        <span className="text-[10px] bg-[#f0b232]/20 text-[#f0b232] px-2 py-0.5 rounded-full font-bold uppercase">
                          Toàn quyền
                        </span>
                      </div>
                      <p className="text-xs text-[#949ba4] mt-1">
                        Có toàn quyền điều hành máy chủ, chỉnh sửa cấu hình sâu, chuyển nhượng quyền hoặc xóa máy chủ.
                      </p>
                      <div className="flex flex-wrap gap-2 mt-3 text-[11px]">
                        <span className="bg-[#1e1f22] text-[#23a55a] px-2 py-1 rounded">✓ Quản lý máy chủ</span>
                        <span className="bg-[#1e1f22] text-[#23a55a] px-2 py-1 rounded">✓ Quản lý kênh</span>
                        <span className="bg-[#1e1f22] text-[#23a55a] px-2 py-1 rounded">✓ Quản lý vai trò</span>
                        <span className="bg-[#1e1f22] text-[#23a55a] px-2 py-1 rounded">✓ Kick thành viên</span>
                        <span className="bg-[#1e1f22] text-[#23a55a] px-2 py-1 rounded">✓ Xóa server</span>
                      </div>
                    </div>
                  </div>

                  {/* Admin Role Card */}
                  <div className="bg-[#2b2d31] p-4 rounded-xl border border-[#3f4147] flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#5865f2]/20 text-[#5865f2] flex items-center justify-center shrink-0">
                      <Shield size={20} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-base">Quản Trị Viên (Admin)</span>
                        <span className="text-[10px] bg-[#5865f2]/20 text-[#5865f2] px-2 py-0.5 rounded-full font-bold uppercase">
                          Quản trị
                        </span>
                      </div>
                      <p className="text-xs text-[#949ba4] mt-1">
                        Quản lý các kênh chat, phân quyền thành viên, mời hoặc đuổi người vi phạm quy định máy chủ.
                      </p>
                      <div className="flex flex-wrap gap-2 mt-3 text-[11px]">
                        <span className="bg-[#1e1f22] text-[#23a55a] px-2 py-1 rounded">✓ Quản lý kênh</span>
                        <span className="bg-[#1e1f22] text-[#23a55a] px-2 py-1 rounded">✓ Quản lý vai trò</span>
                        <span className="bg-[#1e1f22] text-[#23a55a] px-2 py-1 rounded">✓ Kick thành viên</span>
                        <span className="bg-[#1e1f22] text-[#f23f43] px-2 py-1 rounded">✗ Xóa server</span>
                      </div>
                    </div>
                  </div>

                  {/* Moderator Role Card */}
                  <div className="bg-[#2b2d31] p-4 rounded-xl border border-[#3f4147] flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#23a55a]/20 text-[#23a55a] flex items-center justify-center shrink-0">
                      <Shield size={20} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-base">Điều Hành Viên (Moderator)</span>
                        <span className="text-[10px] bg-[#23a55a]/20 text-[#23a55a] px-2 py-0.5 rounded-full font-bold uppercase">
                          Kiểm duyệt
                        </span>
                      </div>
                      <p className="text-xs text-[#949ba4] mt-1">
                        Kiểm duyệt nội dung trò chuyện, xóa các tin nhắn spam, giữ gìn môi trường văn minh trong các kênh.
                      </p>
                      <div className="flex flex-wrap gap-2 mt-3 text-[11px]">
                        <span className="bg-[#1e1f22] text-[#23a55a] px-2 py-1 rounded">✓ Xóa tin nhắn spam</span>
                        <span className="bg-[#1e1f22] text-[#23a55a] px-2 py-1 rounded">✓ Ghim tin nhắn</span>
                        <span className="bg-[#1e1f22] text-[#23a55a] px-2 py-1 rounded">✓ Kick thành viên vi phạm</span>
                      </div>
                    </div>
                  </div>

                  {/* Member Role Card */}
                  <div className="bg-[#2b2d31] p-4 rounded-xl border border-[#3f4147] flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#949ba4]/20 text-[#949ba4] flex items-center justify-center shrink-0">
                      <Users size={20} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-base">Thành Viên (@everyone)</span>
                        <span className="text-[10px] bg-[#949ba4]/20 text-[#949ba4] px-2 py-0.5 rounded-full font-bold uppercase">
                          Mặc định
                        </span>
                      </div>
                      <p className="text-xs text-[#949ba4] mt-1">
                        Vai trò mặc định áp dụng cho tất cả thành viên khi tham gia máy chủ.
                      </p>
                      <div className="flex flex-wrap gap-2 mt-3 text-[11px]">
                        <span className="bg-[#1e1f22] text-[#23a55a] px-2 py-1 rounded">✓ Xem và đọc kênh</span>
                        <span className="bg-[#1e1f22] text-[#23a55a] px-2 py-1 rounded">✓ Gửi tin nhắn và ảnh</span>
                        <span className="bg-[#1e1f22] text-[#23a55a] px-2 py-1 rounded">✓ Tham gia thoại & video</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 3. CHANNELS MANAGEMENT TAB */}
            {activeTab === 'channels' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-white">Quản Lý Kênh</h2>
                    <p className="text-xs text-[#949ba4]">
                      Danh sách các kênh văn bản và thoại trong máy chủ ({channels.length} kênh).
                    </p>
                  </div>
                </div>

                <div className="bg-[#2b2d31] rounded-xl border border-[#3f4147] overflow-hidden divide-y divide-[#35373c]">
                  {channels.map((ch) => (
                    <div
                      key={ch.id}
                      className="p-3.5 flex items-center justify-between hover:bg-[#35373c]/50 transition"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#1e1f22] flex items-center justify-center text-[#949ba4]">
                          {ch.type === 'voice' ? <Volume2 size={18} /> : <Hash size={18} />}
                        </div>
                        <div>
                          <div className="font-bold text-white text-sm">{ch.name}</div>
                          <div className="text-[11px] text-[#949ba4]">
                            {ch.type === 'voice' ? 'Kênh thoại & Video Call' : ch.topic || 'Kênh văn bản'}
                          </div>
                        </div>
                      </div>

                      {isAdminOrOwner && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleDeleteChannel(ch.id)}
                            disabled={deletingChannelId === ch.id || channels.length <= 1}
                            className="p-2 rounded-lg text-[#949ba4] hover:text-[#f23f43] hover:bg-[#f23f43]/15 transition cursor-pointer disabled:opacity-30"
                            title={channels.length <= 1 ? 'Không thể xóa kênh duy nhất' : 'Xóa kênh'}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4. MEMBERS MANAGEMENT TAB */}
            {activeTab === 'members' && (
              <div>
                <h2 className="text-xl font-bold text-white mb-2">Thành Viên Máy Chủ</h2>
                <p className="text-xs text-[#949ba4] mb-6">
                  Quản lý và cấp quyền hạn cho {members.length} thành viên đang có mặt trong máy chủ.
                </p>

                <div className="bg-[#2b2d31] rounded-xl border border-[#3f4147] overflow-hidden divide-y divide-[#35373c]">
                  {members.map((m) => {
                    const memberProfile = m.profile;
                    const isMemberOwner = m.profile_id === server.owner_id;
                    const isSelf = m.profile_id === user?.id;

                    return (
                      <div
                        key={m.id}
                        className="p-3.5 flex items-center justify-between hover:bg-[#35373c]/50 transition"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              memberProfile?.avatar_url ||
                              'https://api.dicebear.com/7.x/bottts/svg?seed=playverse'
                            }
                            alt="Avatar"
                            className="w-9 h-9 rounded-full bg-[#1e1f22] object-cover"
                          />
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-white text-sm">
                                {memberProfile?.display_name || memberProfile?.username || 'Người Dùng'}
                              </span>
                              {isMemberOwner && (
                                <span title="Chủ sở hữu máy chủ">
                                  <Crown size={14} className="text-[#f0b232]" />
                                </span>
                              )}
                              {isSelf && (
                                <span className="text-[10px] bg-[#5865f2]/20 text-[#5865f2] px-1.5 py-0.2 rounded font-semibold">
                                  Bạn
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-[#949ba4]">
                              @{memberProfile?.username || 'user'}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          {/* Role Selector */}
                          {isAdminOrOwner && !isMemberOwner && !isSelf ? (
                            <select
                              value={m.role}
                              onChange={(e) =>
                                handleChangeRole(
                                  m.id,
                                  e.target.value as 'admin' | 'moderator' | 'member'
                                )
                              }
                              disabled={updatingMemberId === m.id}
                              className="bg-[#1e1f22] text-xs font-semibold text-[#dbdee1] border border-[#3f4147] rounded-lg px-2.5 py-1.5 outline-none cursor-pointer"
                            >
                              <option value="member">Thành viên</option>
                              <option value="moderator">Điều hành viên</option>
                              <option value="admin">Quản trị viên</option>
                            </select>
                          ) : (
                            <span className="text-xs font-semibold text-[#949ba4] uppercase px-2 py-1 bg-[#1e1f22] rounded">
                              {isMemberOwner ? 'Chủ sở hữu' : m.role}
                            </span>
                          )}

                          {/* Kick Action */}
                          {isAdminOrOwner && !isMemberOwner && !isSelf && (
                            <button
                              onClick={() =>
                                handleKickMember(
                                  m.id,
                                  memberProfile?.display_name || memberProfile?.username || 'người dùng'
                                )
                              }
                              disabled={updatingMemberId === m.id}
                              className="p-1.5 rounded-lg text-[#949ba4] hover:text-[#f23f43] hover:bg-[#f23f43]/15 transition cursor-pointer"
                              title="Đuổi khỏi máy chủ"
                            >
                              <UserMinus size={16} />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 5. INVITES TAB */}
            {activeTab === 'invites' && (
              <div className="max-w-lg">
                <h2 className="text-xl font-bold text-white mb-2">Mã Mời & Liên Kết Tham Gia</h2>
                <p className="text-xs text-[#949ba4] mb-6">
                  Chia sẻ liên kết này để mời bạn bè tham gia trực tiếp vào máy chủ của bạn trên tên miền playverse.senexam.me.
                </p>

                <div className="bg-[#2b2d31] p-5 rounded-2xl border border-[#3f4147] space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#b5bac1] mb-2">
                      Liên Kết Mời Chính Thức
                    </label>
                    <div className="flex items-center gap-2 bg-[#1e1f22] rounded-xl p-2 border border-[#232428]">
                      <input
                        type="text"
                        readOnly
                        value={inviteUrl}
                        className="flex-1 bg-transparent text-sm text-white px-2 font-mono outline-none select-all"
                      />
                      <button
                        onClick={copyInvite}
                        className="bg-[#5865f2] hover:bg-[#4752c4] text-white text-xs font-bold px-4 py-2 rounded-lg transition cursor-pointer flex items-center gap-1.5 shrink-0"
                      >
                        {copied ? <Check size={14} /> : <Copy size={14} />}
                        <span>{copied ? 'Đã chép' : 'Sao chép'}</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#b5bac1] mb-2">
                      Mã Mời Trực Tiếp
                    </label>
                    <div className="font-mono text-2xl font-black text-white tracking-widest bg-[#1e1f22] p-3 rounded-xl text-center border border-[#232428]">
                      {inviteCode}
                    </div>
                  </div>

                  {isAdminOrOwner && (
                    <div className="pt-2">
                      <button
                        onClick={handleRegenerateInvite}
                        disabled={regeneratingInvite}
                        className="text-xs text-[#949ba4] hover:text-white flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <RefreshCw size={13} className={regeneratingInvite ? 'animate-spin' : ''} />
                        <span>Tạo mã mời mới (vô hiệu hóa mã cũ)</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 6. DANGER ZONE (DELETE SERVER) */}
            {activeTab === 'danger' && isAdminOrOwner && (
              <div className="max-w-lg">
                <div className="flex items-center gap-2.5 text-[#f23f43] mb-2">
                  <AlertTriangle size={24} />
                  <h2 className="text-xl font-bold">Xóa Máy Chủ Vĩnh Viễn</h2>
                </div>
                <p className="text-xs text-[#949ba4] mb-6">
                  Hành động này không thể hoàn tác. Toàn bộ kênh trò chuyện, tin nhắn và danh sách thành viên sẽ bị xóa vĩnh viễn khỏi cơ sở dữ liệu.
                </p>

                <div className="bg-[#f23f43]/10 border border-[#f23f43]/30 rounded-2xl p-6 space-y-4">
                  <p className="text-sm text-white">
                    Để xác nhận, vui lòng nhập chính xác tên máy chủ: <strong className="text-[#f23f43]">{server.name}</strong>
                  </p>

                  <input
                    type="text"
                    value={confirmDelete}
                    onChange={(e) => setConfirmDelete(e.target.value)}
                    placeholder={server.name}
                    className="w-full bg-[#1e1f22] text-sm text-white rounded-lg p-3 outline-none focus:ring-2 focus:ring-[#f23f43] border border-[#f23f43]/40"
                  />

                  <button
                    onClick={handleDeleteServer}
                    disabled={confirmDelete !== server.name || deletingServer}
                    className="w-full bg-[#f23f43] hover:bg-[#da373c] text-white font-bold py-3 rounded-xl transition cursor-pointer disabled:opacity-40 text-sm shadow"
                  >
                    {deletingServer ? 'Đang xóa...' : 'Tôi Hiểu Hậu Quả, Xóa Máy Chủ Này'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}