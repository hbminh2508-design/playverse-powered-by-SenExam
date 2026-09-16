'use client';

import React, { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Compass, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/lib/context/auth-context';
import { createClient } from '@/lib/supabase/client';
import { Server } from '@/types/database';

interface InvitePageProps {
  params: Promise<{
    code: string;
  }>;
}

export default function InvitePage({ params }: InvitePageProps) {
  const resolvedParams = use(params);
  const { code } = resolvedParams;
  const router = useRouter();
  const { user, isConfigured } = useAuth();
  const [server, setServer] = useState<Server | null>(null);
  const [memberCount, setMemberCount] = useState<number>(1);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    const fetchServerByInvite = async () => {
      setLoading(true);

      // Tìm kiếm server theo mã mời trên Supabase
      if (isConfigured) {
        try {
          const { data, error } = await supabase
            .from('servers')
            .select('*')
            .ilike('invite_code', code)
            .single();

          if (!error && data) {
            setServer(data as Server);

            // Đếm số thành viên
            const { count } = await supabase
              .from('server_members')
              .select('*', { count: 'exact', head: true })
              .eq('server_id', data.id);

            setMemberCount(count || 1);
          } else {
            setServer(null);
          }
        } catch (err) {
          console.error('Lỗi tìm mã mời:', err);
          setServer(null);
        } finally {
          setLoading(false);
        }
        return;
      }

      setLoading(false);
    };

    fetchServerByInvite();
  }, [code, isConfigured]);

  const handleAccept = async () => {
    if (!server) return;
    setJoining(true);

    if (isConfigured && user) {
      try {
        // Kiểm tra xem đã là thành viên chưa
        const { data: existing } = await supabase
          .from('server_members')
          .select('id')
          .eq('server_id', server.id)
          .eq('profile_id', user.id)
          .single();

        if (!existing) {
          await supabase.from('server_members').insert({
            server_id: server.id,
            profile_id: user.id,
            role: 'member',
          });
        }
      } catch (err) {
        console.error('Lỗi gia nhập server:', err);
      }
    }

    router.push(`/channels/${server.id}/default`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1e1f22] flex items-center justify-center p-4 text-[#949ba4]">
        Đang kiểm tra lời mời PlayVerse...
      </div>
    );
  }

  if (!server) {
    return (
      <div className="min-h-screen bg-[#1e1f22] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#313338] rounded-xl p-8 shadow-2xl border border-[#232428] text-center">
          <div className="w-16 h-16 rounded-full bg-[#f23f43]/10 text-[#f23f43] flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={32} />
          </div>
          <h1 className="text-xl font-bold text-white mb-2">Lời mời không hợp lệ hoặc đã hết hạn</h1>
          <p className="text-xs text-[#949ba4] mb-6">
            Mã mời <strong className="font-mono text-white">{code}</strong> không tồn tại trên hệ thống.
          </p>
          <Link
            href="/channels/me"
            className="inline-block bg-[#5865f2] hover:bg-[#4752c4] text-white text-xs font-semibold px-5 py-2.5 rounded-md transition"
          >
            Về Trang Chủ PlayVerse
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1e1f22] flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-md bg-[#313338] rounded-xl p-8 shadow-2xl border border-[#232428] text-center">
        {/* Server Icon */}
        <div className="relative inline-block mb-4">
          <img
            src={
              server.icon_url ||
              'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=128&h=128&fit=crop'
            }
            alt={server.name}
            className="w-20 h-20 rounded-3xl bg-[#1e1f22] object-cover mx-auto shadow-lg"
          />
        </div>

        <div className="text-xs font-bold text-[#949ba4] uppercase tracking-wider mb-1">
          Bạn đã được mời tham gia máy chủ
        </div>
        <h1 className="text-2xl font-bold text-white mb-4 truncate">{server.name}</h1>

        <div className="flex items-center justify-center gap-4 text-xs text-[#949ba4] mb-8 bg-[#2b2d31] py-2.5 px-4 rounded-lg">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#23a55a]" />
            <span>Trực tuyến</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users size={14} />
            <span>{memberCount} Thành viên</span>
          </div>
        </div>

        <button
          onClick={handleAccept}
          disabled={joining}
          className="w-full bg-[#5865f2] hover:bg-[#4752c4] text-white font-medium py-3 rounded-lg transition shadow cursor-pointer text-sm disabled:opacity-50"
        >
          {joining ? 'Đang tham gia...' : 'Chấp nhận lời mời'}
        </button>

        <div className="mt-4">
          <Link
            href="/channels/me"
            className="text-xs text-[#00a8fc] hover:underline"
          >
            Về trang cá nhân / Bạn bè
          </Link>
        </div>
      </div>
    </div>
  );
}
