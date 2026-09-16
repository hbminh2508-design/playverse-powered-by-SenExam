import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/context/auth-context';

export const metadata: Metadata = {
  title: 'PlayVerse - Nền tảng Cộng đồng Thời gian thực',
  description: 'Ứng dụng giao tiếp phong cách Discord tự chủ dữ liệu, vận hành trên Supabase và tên miền playverse.senexam.me',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className="dark">
      <body className="min-h-screen bg-[#1e1f22] text-[#dbdee1] antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
