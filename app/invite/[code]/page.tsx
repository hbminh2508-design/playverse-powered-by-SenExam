'use client';

import React, { use } from 'react';
import { useRouter } from 'next/navigation';
import { DEMO_SERVERS } from '@/lib/demo-data';
import { Users, Compass, CheckCircle } from 'lucide-react';
import Link from 'next/link';

interface InvitePageProps {
  params: Promise<{
    code: string;
  }>;
}

export default function InvitePage({ params }: InvitePageProps) {
  const resolvedParams = use(params);
  const { code } = resolvedParams;
  const router = useRouter();

  const server =
    DEMO_SERVERS.find((s) => s.invite_code.toUpperCase() === code.toUpperCase()) ||
    DEMO_SERVERS[0];

  const handleAccept = () => {
    router.push(`/channels/${server.id}/default`);
  };

  return (
    <div className="min-h-screen bg-[#1e1f22] flex items-center justify-center p-4">
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
        <h1 className="text-2xl font-bold text-white mb-4">{server.name}</h1>

        <div className="flex items-center justify-center gap-4 text-xs text-[#949ba4] mb-8 bg-[#2b2d31] py-2.5 px-4 rounded-lg">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#23a55a]" />
            <span>4 Trực tuyến</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users size={14} />
            <span>5 Thành viên</span>
          </div>
        </div>

        <button
          onClick={handleAccept}
          className="w-full bg-[#5865f2] hover:bg-[#4752c4] text-white font-medium py-3 rounded-lg transition shadow cursor-pointer text-sm"
        >
          Chấp nhận lời mời
        </button>

        <div className="mt-4">
          <Link
            href="/channels/me"
            className="text-xs text-[#00a8fc] hover:underline"
          >
            Đã có tài khoản? Vào ứng dụng ngay
          </Link>
        </div>
      </div>
    </div>
  );
}
