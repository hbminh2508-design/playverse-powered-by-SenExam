'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/auth-context';
import { createClient } from '@/lib/supabase/client';
import { PlayVerseLogo } from '@/components/ui/logo';
import {
  Download,
  Monitor,
  MessageSquare,
  Shield,
  Zap,
  Sparkles,
  Users,
  Video,
  Volume2,
  Lock,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Mic,
  Smile,
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const { user, profile, isConfigured } = useAuth();

  // Auth widget states
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);

  const supabase = createClient();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccess(null);
    setAuthLoading(true);

    try {
      if (!isConfigured) {
        setAuthError('Hệ thống chưa kết nối Supabase API keys. Vui lòng cấu hình trên Vercel / .env.local.');
        return;
      }

      if (authTab === 'register') {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username: username.trim().toLowerCase(),
              display_name: displayName.trim() || username.trim(),
            },
          },
        });

        if (signUpError) throw signUpError;

        if (data.session) {
          router.push('/channels/me');
        } else {
          setAuthSuccess('Đăng ký thành công! Vui lòng kiểm tra hộp thư email để kích hoạt tài khoản.');
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) throw signInError;
        router.push('/channels/me');
      }
    } catch (err: any) {
      setAuthError(err.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setAuthLoading(false);
    }
  };

  const scrollTo = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#1e1f22] text-[#dbdee1] flex flex-col font-sans selection:bg-[#5865f2] selection:text-white overflow-x-hidden">
      {/* 1. TOP NAVIGATION BAR */}
      <header className="sticky top-0 z-50 bg-[#1e1f22]/90 backdrop-blur-md border-b border-[#2b2d31] px-6 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="hover:opacity-90 transition">
            <PlayVerseLogo size="md" />
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-[#949ba4]">
            <a href="#features" onClick={(e) => scrollTo(e, 'features')} className="hover:text-white transition cursor-pointer">Tính năng</a>
            <a href="#showcase" onClick={(e) => scrollTo(e, 'showcase')} className="hover:text-white transition cursor-pointer">Giao diện</a>
            <a href="#download" onClick={(e) => scrollTo(e, 'download')} className="hover:text-white transition flex items-center gap-1.5 text-white cursor-pointer">
              <Download size={15} className="text-[#5865f2]" />
              <span>Tải Windows (.exe)</span>
            </a>
            <a href="#auth" onClick={(e) => scrollTo(e, 'auth')} className="hover:text-white transition cursor-pointer">Đăng nhập</a>
          </nav>

          {/* Right Action */}
          <div className="flex items-center gap-3">
            {user ? (
              <Link
                href="/channels/me"
                className="bg-[#5865f2] hover:bg-[#4752c4] text-white text-xs font-bold px-4 py-2.5 rounded-full transition shadow-md flex items-center gap-2"
              >
                <span>Vào Máy Chủ Của Bạn</span>
                <ArrowRight size={14} />
              </Link>
            ) : (
              <>
                <a
                  href="#auth"
                  onClick={(e) => scrollTo(e, 'auth')}
                  className="text-xs font-semibold text-white hover:underline px-3 py-2 hidden sm:inline cursor-pointer"
                >
                  Đăng Nhập
                </a>
                <Link
                  href="/channels/me"
                  className="bg-[#5865f2] hover:bg-[#4752c4] text-white text-xs font-bold px-4 py-2.5 rounded-full transition shadow-md shadow-[#5865f2]/20"
                >
                  Mở Web App
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative pt-16 pb-20 px-6 overflow-hidden">
        {/* Ambient Glows */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-[#5865f2]/15 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-40 right-10 w-[400px] h-[400px] bg-[#23a55a]/10 rounded-full blur-[140px] pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10 pt-4">
          {/* Heading */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-white tracking-tight leading-[1.1] mb-6">
            Nơi Tụ Họp Cộng Đồng & <br />
            <span className="bg-gradient-to-r from-[#5865f2] via-[#7983f5] to-[#23a55a] bg-clip-text text-transparent">
              Vũ Trụ Trò Chuyện Của Bạn
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-[#949ba4] max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
            Trò chuyện văn bản thời gian thực, đàm thoại thoại, gọi video chất lượng cao và chia sẻ màn hình chuẩn Discord.
            Vận hành độc lập trên cơ sở dữ liệu Supabase, hoàn toàn làm chủ dữ liệu của chính bạn.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {/* Windows Download Button */}
            <a
              href="/download/PlayVerse-Setup.exe"
              download="PlayVerse-Setup.exe"
              className="w-full sm:w-auto bg-[#5865f2] hover:bg-[#4752c4] text-white font-bold px-8 py-4 rounded-2xl transition shadow-xl shadow-[#5865f2]/30 flex items-center justify-center gap-3 text-base group cursor-pointer"
            >
              <Download size={22} className="group-hover:translate-y-0.5 transition" />
              <div className="text-left leading-tight">
                <div>Tải về cho Windows (.exe)</div>
                <div className="text-[11px] font-normal text-white/80">Phiên bản v1.0.0 • 64-bit</div>
              </div>
            </a>

            {/* Open Web App Button */}
            <Link
              href="/channels/me"
              className="w-full sm:w-auto bg-[#2b2d31] hover:bg-[#35373c] text-white font-semibold px-8 py-4 rounded-2xl transition border border-[#3f4147] flex items-center justify-center gap-2 text-base shadow"
            >
              <Monitor size={20} className="text-[#949ba4]" />
              <span>Mở Web App Trên Trình Duyệt</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 3. SHOWCASE MOCKUP SECTION */}
      <section id="showcase" className="px-6 pb-20">
        <div className="max-w-6xl mx-auto">
          <div className="bg-[#18191c] rounded-2xl p-2 sm:p-4 shadow-2xl border border-[#2b2d31] overflow-hidden">
            {/* Window titlebar mockup */}
            <div className="h-8 bg-[#111214] rounded-t-xl px-4 flex items-center justify-between border-b border-[#2b2d31]/60 mb-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#f23f43]" />
                <div className="w-3 h-3 rounded-full bg-[#f0b232]" />
                <div className="w-3 h-3 rounded-full bg-[#23a55a]" />
              </div>
              <span className="text-[11px] font-mono text-[#949ba4]">PlayVerse Client — playverse.senexam.me</span>
              <div className="w-12" />
            </div>

            {/* App interface preview mockup */}
            <div className="bg-[#1e1f22] rounded-xl overflow-hidden h-[450px] sm:h-[540px] flex text-xs select-none">
              {/* Mockup Server Sidebar */}
              <div className="w-14 bg-[#1e1f22] border-r border-[#2b2d31] py-3 flex flex-col items-center gap-2 shrink-0">
                <div className="w-10 h-10 rounded-2xl bg-[#5865f2] text-white flex items-center justify-center font-bold text-sm">PV</div>
                <div className="w-6 h-[1px] bg-[#35363c]" />
                <div className="w-10 h-10 rounded-2xl bg-[#313338] hover:bg-[#5865f2] text-[#dbdee1] flex items-center justify-center font-bold">PL</div>
                <div className="w-10 h-10 rounded-2xl bg-[#313338] text-[#23a55a] flex items-center justify-center font-bold">+</div>
              </div>

              {/* Mockup Channel Sidebar */}
              <div className="w-44 bg-[#2b2d31] p-3 hidden sm:flex flex-col justify-between shrink-0 border-r border-[#1f2023]/40">
                <div>
                  <div className="font-bold text-white text-sm pb-2 border-b border-[#1f2023] mb-3">PlayVerse Official</div>
                  <div className="text-[10px] font-bold text-[#949ba4] uppercase mb-1">Kênh Văn Bản</div>
                  <div className="space-y-1">
                    <div className="bg-[#404249] text-white p-1.5 rounded flex items-center gap-1.5 font-medium">
                      <span>#</span><span>chung</span>
                    </div>
                    <div className="text-[#949ba4] p-1.5 rounded flex items-center gap-1.5">
                      <span>#</span><span>thảo-luận</span>
                    </div>
                  </div>
                  <div className="text-[10px] font-bold text-[#949ba4] uppercase mt-4 mb-1">Kênh Thoại</div>
                  <div className="text-[#23a55a] p-1.5 rounded flex items-center gap-1.5 bg-[#23a55a]/10 font-semibold">
                    <Volume2 size={13} /><span>Phòng Thoại 1</span>
                  </div>
                </div>
                <div className="bg-[#232428] p-2 rounded flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-[#5865f2] text-white flex items-center justify-center text-[10px]">U</div>
                  <span className="font-semibold text-white truncate">Admin</span>
                </div>
              </div>

              {/* Mockup Chat & Video Area */}
              <div className="flex-1 bg-[#313338] flex flex-col justify-between p-4 min-w-0">
                <div className="space-y-4">
                  {/* Floating Voice Tile Mockup */}
                  <div className="bg-[#2b2d31] p-3 rounded-xl border border-[#3f4147] flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-[#5865f2] flex items-center justify-center font-bold text-white ring-4 ring-[#23a55a]">
                          H
                        </div>
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#23a55a] border-2 border-[#2b2d31]" />
                      </div>
                      <div>
                        <div className="font-bold text-white text-sm flex items-center gap-1.5">
                          <span>Hoàng (Đang nói...)</span>
                          <span className="text-[10px] bg-[#23a55a]/20 text-[#23a55a] px-1.5 py-0.5 rounded font-bold">RTC Voice</span>
                        </div>
                        <div className="text-[#949ba4] text-[11px]">Đang đàm thoại qua WebRTC P2P</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-[#35373c] flex items-center justify-center text-white"><Mic size={14} /></div>
                      <div className="w-7 h-7 rounded-full bg-[#35373c] flex items-center justify-center text-white"><Video size={14} /></div>
                    </div>
                  </div>

                  {/* Message Item Mockup */}
                  <div className="flex gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#5865f2] text-white flex items-center justify-center font-bold shrink-0">PV</div>
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="font-bold text-white">PlayVerse Bot</span>
                        <span className="text-[10px] text-[#949ba4]">Hôm nay lúc 14:00</span>
                      </div>
                      <p className="text-[#dbdee1] mt-0.5">Chào mừng đến với vũ trụ PlayVerse! Kết nối Supabase Realtime đã sẵn sàng.</p>
                    </div>
                  </div>
                </div>

                {/* Mockup Chat Input */}
                <div className="bg-[#383a40] p-2.5 rounded-lg flex items-center justify-between text-[#949ba4]">
                  <span>Gửi tin nhắn tới #chung...</span>
                  <Smile size={16} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. QUICK AUTH CARD (ĐĂNG NHẬP / ĐĂNG KÝ NGAY TRÊN DASHBOARD) */}
      <section id="auth" className="px-6 py-16 bg-[#18191c]/80 border-y border-[#2b2d31]">
        <div className="max-w-xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
              Sẵn Sàng Bắt Đầu Trải Nghiệm?
            </h2>
            <p className="text-sm text-[#949ba4]">
              Đăng nhập tài khoản của bạn hoặc tạo tài khoản mới chỉ trong vài giây.
            </p>
          </div>

          <div className="bg-[#313338] rounded-2xl p-6 sm:p-8 shadow-2xl border border-[#3f4147]">
            {/* Tabs */}
            <div className="flex bg-[#1e1f22] p-1 rounded-xl mb-6">
              <button
                type="button"
                onClick={() => setAuthTab('login')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition cursor-pointer ${
                  authTab === 'login' ? 'bg-[#5865f2] text-white shadow' : 'text-[#949ba4] hover:text-white'
                }`}
              >
                Đăng Nhập
              </button>
              <button
                type="button"
                onClick={() => setAuthTab('register')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition cursor-pointer ${
                  authTab === 'register' ? 'bg-[#5865f2] text-white shadow' : 'text-[#949ba4] hover:text-white'
                }`}
              >
                Tạo Tài Khoản Mới
              </button>
            </div>

            {/* Error / Success Notifications */}
            {authError && (
              <div className="mb-4 p-3 rounded-lg bg-[#f23f43]/15 border border-[#f23f43]/40 text-[#f23f43] text-xs flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            {authSuccess && (
              <div className="mb-4 p-3 rounded-lg bg-[#23a55a]/15 border border-[#23a55a]/40 text-[#23a55a] text-xs flex items-center gap-2">
                <CheckCircle size={16} className="shrink-0" />
                <span>{authSuccess}</span>
              </div>
            )}

            {/* Auth Form */}
            <form onSubmit={handleAuth} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#b5bac1] uppercase tracking-wider mb-2">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tenban@example.com"
                  className="w-full bg-[#1e1f22] text-white text-sm rounded-lg p-3 outline-none focus:ring-2 focus:ring-[#5865f2] border border-[#232428]"
                />
              </div>

              {authTab === 'register' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-[#b5bac1] uppercase tracking-wider mb-2">
                      Tên Đăng Nhập (Username)
                    </label>
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="playverse_user"
                      className="w-full bg-[#1e1f22] text-white text-sm rounded-lg p-3 outline-none focus:ring-2 focus:ring-[#5865f2] border border-[#232428]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#b5bac1] uppercase tracking-wider mb-2">
                      Tên Hiển Thị
                    </label>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Người Dùng Mới"
                      className="w-full bg-[#1e1f22] text-white text-sm rounded-lg p-3 outline-none focus:ring-2 focus:ring-[#5865f2] border border-[#232428]"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-bold text-[#b5bac1] uppercase tracking-wider mb-2">
                  Mật Khẩu
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#1e1f22] text-white text-sm rounded-lg p-3 outline-none focus:ring-2 focus:ring-[#5865f2] border border-[#232428]"
                />
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full bg-[#5865f2] hover:bg-[#4752c4] text-white font-bold py-3.5 rounded-xl transition shadow-lg cursor-pointer disabled:opacity-50 text-sm mt-2"
              >
                {authLoading
                  ? 'Đang kết nối...'
                  : authTab === 'register'
                  ? 'Tạo Tài Khoản PlayVerse'
                  : 'Đăng Nhập'}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* 5. DEDICATED WINDOWS APP (.EXE) DOWNLOAD SECTION */}
      <section id="download" className="px-6 py-20 bg-[#1e1f22] relative">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-[#2b2d31] to-[#18191c] rounded-3xl p-8 sm:p-12 border border-[#3f4147] shadow-2xl relative overflow-hidden">
            {/* Background Accent */}
            <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-[#5865f2]/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
              <div className="space-y-4 text-center md:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#23a55a]/20 text-[#23a55a] text-xs font-bold">
                  <CheckCircle size={14} />
                  <span>Chính Thức Cho Windows</span>
                </div>
                <h3 className="text-3xl sm:text-4xl font-black text-white">
                  PlayVerse for Windows
                </h3>
                <p className="text-sm text-[#949ba4] max-w-lg leading-relaxed">
                  Tải ngay trình cài đặt Windows <strong>PlayVerse-Setup.exe</strong> để trải nghiệm ứng dụng với tốc độ nhanh nhất,
                  chạy trên cửa sổ riêng biệt không cần mở tab trình duyệt.
                </p>

                <div className="flex flex-wrap gap-4 text-xs text-[#949ba4] justify-center md:justify-start">
                  <div>• HĐH: <strong>Windows 10 / 11 (64-bit)</strong></div>
                  <div>• Dung lượng: <strong>Bản cài đặt nhanh</strong></div>
                  <div>• Phiên bản: <strong>v1.0.0</strong></div>
                </div>
              </div>

              {/* Download Action Box */}
              <div className="flex flex-col gap-3 w-full md:w-auto shrink-0">
                <a
                  href="/download/PlayVerse-Setup.exe"
                  download="PlayVerse-Setup.exe"
                  className="bg-[#5865f2] hover:bg-[#4752c4] text-white font-bold px-8 py-4 rounded-2xl transition shadow-xl shadow-[#5865f2]/30 flex items-center justify-center gap-3 text-base group cursor-pointer"
                >
                  <Download size={22} className="group-hover:translate-y-1 transition" />
                  <span>Tải PlayVerse-Setup.exe</span>
                </a>

                <a
                  href="https://github.com/hbminh2508-design/playverse-powered-by-SenExam"
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-[#949ba4] hover:text-white flex items-center justify-center gap-1.5 py-1.5 transition"
                >
                  <span>Mã nguồn trên GitHub</span>
                  <ExternalLink size={13} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FEATURES HIGHLIGHTS SECTION */}
      <section id="features" className="px-6 py-20 max-w-6xl mx-auto w-full">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">
            Những Tính Năng Tạo Nên Sự Khác Biệt
          </h2>
          <p className="text-sm text-[#949ba4] max-w-xl mx-auto">
            Xây dựng trên nền tảng công nghệ hiện đại nhất giúp bạn giao tiếp không rào cản.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#2b2d31] p-8 rounded-2xl border border-[#3f4147] hover:border-[#5865f2] transition duration-200 group">
            <div className="w-12 h-12 rounded-xl bg-[#5865f2]/20 text-[#5865f2] flex items-center justify-center mb-5 group-hover:scale-110 transition">
              <Zap size={26} />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Realtime Không Độ Trễ</h3>
            <p className="text-sm text-[#949ba4] leading-relaxed">
              Trò chuyện văn bản tức thì với WebSockets. Nhận tin nhắn, xem ảnh và biểu cảm cảm xúc ngay khi người gửi bấm Enter.
            </p>
          </div>

          <div className="bg-[#2b2d31] p-8 rounded-2xl border border-[#3f4147] hover:border-[#23a55a] transition duration-200 group">
            <div className="w-12 h-12 rounded-xl bg-[#23a55a]/20 text-[#23a55a] flex items-center justify-center mb-5 group-hover:scale-110 transition">
              <Video size={26} />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Đàm Thoại & Video Call</h3>
            <p className="text-sm text-[#949ba4] leading-relaxed">
              Tích hợp công nghệ WebRTC P2P cho kênh thoại và camera sắc nét. Viền sáng nhấp nháy phát hiện người đang nói như Discord thật.
            </p>
          </div>

          <div className="bg-[#2b2d31] p-8 rounded-2xl border border-[#3f4147] hover:border-[#f0b232] transition duration-200 group">
            <div className="w-12 h-12 rounded-xl bg-[#f0b232]/20 text-[#f0b232] flex items-center justify-center mb-5 group-hover:scale-110 transition">
              <Shield size={26} />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Tự Chủ Dữ Liệu 100%</h3>
            <p className="text-sm text-[#949ba4] leading-relaxed">
              Vận hành trên cơ sở dữ liệu PostgreSQL của Supabase. Dữ liệu là của bạn, được bảo mật qua Row Level Security và tên miền riêng.
            </p>
          </div>
        </div>
      </section>

      {/* 7. FOOTER */}
      <footer className="mt-auto bg-[#18191c] border-t border-[#2b2d31] px-6 py-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#949ba4]">
          <PlayVerseLogo size="sm" />
          <div>
            Tên miền chính thức: <strong className="text-white">playverse.senexam.me</strong>
          </div>
          <div>
            <a
              href="https://github.com/hbminh2508-design/playverse-powered-by-SenExam"
              target="_blank"
              rel="noreferrer"
              className="text-[#5865f2] hover:underline flex items-center gap-1"
            >
              <span>GitHub Repository</span>
              <ExternalLink size={12} />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
