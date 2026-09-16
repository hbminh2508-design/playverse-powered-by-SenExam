'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/auth-context';
import { createClient } from '@/lib/supabase/client';
import { Sparkles, AlertCircle, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const { isConfigured, setDemoMode } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const supabase = createClient();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      if (!isConfigured) {
        // Chưa điền Supabase credentials -> tự động chuyển sang chế độ Demo
        setDemoMode(true);
        router.push('/channels/me');
        return;
      }

      if (isRegister) {
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
          setSuccess('Đăng ký thành công! Vui lòng kiểm tra hộp thư email để kích hoạt tài khoản.');
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
      setError(err.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoMode = () => {
    setDemoMode(true);
    router.push('/channels/me');
  };

  return (
    <div className="min-h-screen bg-[#1e1f22] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Graphic Blobs */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#5865f2]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-[#23a55a]/15 rounded-full blur-3xl pointer-events-none" />

      {/* Main Login Card */}
      <div className="w-full max-w-[480px] bg-[#313338] rounded-lg p-8 shadow-2xl border border-[#232428] relative z-10">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-[#5865f2] rounded-2xl flex items-center justify-center text-white font-extrabold text-2xl mx-auto mb-3 shadow-md">
            PV
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">
            {isRegister ? 'Tạo một tài khoản' : 'Chào mừng trở lại!'}
          </h1>
          <p className="text-sm text-[#949ba4]">
            {isRegister
              ? 'Rất vui được đón bạn tham gia cùng PlayVerse'
              : 'Chúng tôi rất vui mừng được gặp lại bạn!'}
          </p>
        </div>

        {/* Status Notification */}
        {error && (
          <div className="mb-4 p-3 rounded bg-[#f23f43]/15 border border-[#f23f43]/40 text-[#f23f43] text-xs flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 rounded bg-[#23a55a]/15 border border-[#23a55a]/40 text-[#23a55a] text-xs flex items-center gap-2">
            <CheckCircle size={16} className="shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#b5bac1] uppercase tracking-wider mb-2">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tenban@example.com"
              className="w-full bg-[#1e1f22] text-white text-sm rounded p-2.5 outline-none focus:ring-2 focus:ring-[#5865f2] border border-[#232428]"
            />
          </div>

          {isRegister && (
            <>
              <div>
                <label className="block text-xs font-bold text-[#b5bac1] uppercase tracking-wider mb-2">
                  Tên đăng nhập (Username) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="playverse_user"
                  className="w-full bg-[#1e1f22] text-white text-sm rounded p-2.5 outline-none focus:ring-2 focus:ring-[#5865f2] border border-[#232428]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#b5bac1] uppercase tracking-wider mb-2">
                  Tên hiển thị
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Người Dùng Mới"
                  className="w-full bg-[#1e1f22] text-white text-sm rounded p-2.5 outline-none focus:ring-2 focus:ring-[#5865f2] border border-[#232428]"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-bold text-[#b5bac1] uppercase tracking-wider mb-2">
              Mật khẩu <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[#1e1f22] text-white text-sm rounded p-2.5 outline-none focus:ring-2 focus:ring-[#5865f2] border border-[#232428]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#5865f2] hover:bg-[#4752c4] text-white font-medium py-3 rounded transition shadow cursor-pointer disabled:opacity-50"
          >
            {loading
              ? 'Đang xử lý...'
              : isRegister
              ? 'Tiếp tục đăng ký'
              : 'Đăng nhập'}
          </button>
        </form>

        {/* Toggle Register / Login */}
        <div className="mt-4 text-xs text-[#949ba4]">
          {isRegister ? (
            <span>
              Đã có tài khoản?{' '}
              <button
                onClick={() => setIsRegister(false)}
                className="text-[#00a8fc] hover:underline cursor-pointer"
              >
                Đăng nhập ngay
              </button>
            </span>
          ) : (
            <span>
              Cần một tài khoản?{' '}
              <button
                onClick={() => setIsRegister(true)}
                className="text-[#00a8fc] hover:underline cursor-pointer"
              >
                Đăng ký
              </button>
            </span>
          )}
        </div>

        {/* Fast Demo Mode Button */}
        <div className="mt-6 pt-6 border-t border-[#3f4147]">
          <button
            type="button"
            onClick={handleDemoMode}
            className="w-full bg-[#23a55a] hover:bg-[#1f9250] text-white font-medium py-2.5 rounded transition flex items-center justify-center gap-2 cursor-pointer text-sm shadow"
          >
            <Sparkles size={16} />
            <span>Trải nghiệm ngay (Chế độ Demo)</span>
          </button>
          <p className="text-[11px] text-center text-[#949ba4] mt-2">
            Xem ngay giao diện Discord và trải nghiệm chat tức thì mà không cần thiết lập tài khoản
          </p>
        </div>
      </div>
    </div>
  );
}
