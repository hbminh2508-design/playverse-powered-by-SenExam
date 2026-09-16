'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/auth-context';
import Link from 'next/link';
import { MessageSquare, Shield, Zap, Sparkles } from 'lucide-react';

export default function HomePage() {
  const { user, profile, loading, isDemoMode } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (user || isDemoMode)) {
      router.push('/channels/me');
    }
  }, [user, isDemoMode, loading, router]);

  return (
    <div className="min-h-screen bg-[#1e1f22] text-[#dbdee1] flex flex-col justify-between p-6">
      {/* Navbar */}
      <header className="max-w-6xl mx-auto w-full flex items-center justify-between py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#5865f2] flex items-center justify-center font-bold text-white text-xl shadow-lg">
            PV
          </div>
          <span className="text-xl font-bold text-white tracking-wide">PlayVerse</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="bg-[#5865f2] hover:bg-[#4752c4] text-white text-sm font-medium px-5 py-2 rounded-full transition shadow"
          >
            Mở PlayVerse
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-4xl mx-auto w-full text-center py-16 px-4">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#5865f2]/20 text-[#5865f2] text-xs font-semibold mb-6 border border-[#5865f2]/30">
          <Sparkles size={14} />
          <span>Tự chủ dữ liệu 100% • Tên miền playverse.senexam.me</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold text-white mb-6 leading-tight tracking-tight">
          Nơi tụ họp cộng đồng & <br />
          <span className="text-[#5865f2]">Thế giới trò chuyện của bạn</span>
        </h1>

        <p className="text-base sm:text-lg text-[#949ba4] max-w-2xl mx-auto mb-10 leading-relaxed">
          PlayVerse là ứng dụng giao tiếp cộng đồng thời gian thực phong cách Discord,
          vận hành trên hạ tầng độc lập của Supabase. Trò chuyện qua kênh văn bản, đàm thoại,
          chia sẻ tài nguyên mà không lo giới hạn dữ liệu.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/channels/me"
            className="w-full sm:w-auto bg-[#5865f2] hover:bg-[#4752c4] text-white font-semibold px-8 py-3.5 rounded-full transition shadow-lg text-center"
          >
            Vào Ứng Dụng Ngay (Web App)
          </Link>
          <Link
            href="/login"
            className="w-full sm:w-auto bg-[#2b2d31] hover:bg-[#35373c] text-white font-medium px-8 py-3.5 rounded-full transition text-center border border-[#3f4147]"
          >
            Đăng Nhập / Đăng Ký
          </Link>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 text-left">
          <div className="bg-[#2b2d31] p-6 rounded-xl border border-[#35373c]">
            <div className="w-10 h-10 rounded-lg bg-[#5865f2]/20 text-[#5865f2] flex items-center justify-center mb-4">
              <Zap size={22} />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Realtime Tức Thì</h3>
            <p className="text-sm text-[#949ba4]">
              Nhận tin nhắn, thông báo, gõ phím và trạng thái online tức thời không độ trễ qua WebSockets.
            </p>
          </div>

          <div className="bg-[#2b2d31] p-6 rounded-xl border border-[#35373c]">
            <div className="w-10 h-10 rounded-lg bg-[#23a55a]/20 text-[#23a55a] flex items-center justify-center mb-4">
              <Shield size={22} />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Tự Chủ Dữ Liệu</h3>
            <p className="text-sm text-[#949ba4]">
              Dữ liệu của bạn được bảo mật trong PostgreSQL riêng biệt, dễ dàng sao lưu và xuất dữ liệu.
            </p>
          </div>

          <div className="bg-[#2b2d31] p-6 rounded-xl border border-[#35373c]">
            <div className="w-10 h-10 rounded-lg bg-[#f0b232]/20 text-[#f0b232] flex items-center justify-center mb-4">
              <MessageSquare size={22} />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Kênh & Máy Chủ</h3>
            <p className="text-sm text-[#949ba4]">
              Tạo không giới hạn server, kênh chat và kênh đàm thoại. Mời bạn bè chỉ bằng một đường link.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-xs text-[#949ba4] py-6 border-t border-[#2b2d31]">
        PlayVerse Community Platform • Vận hành độc lập trên senexam.me
      </footer>
    </div>
  );
}
