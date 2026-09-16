'use client';

import React, { useState, useEffect } from 'react';
import { ServerSidebar } from '@/components/layout/server-sidebar';
import { CreateServerModal } from '@/components/modals/create-server-modal';
import { Server } from '@/types/database';
import { useAuth } from '@/lib/context/auth-context';
import { createClient } from '@/lib/supabase/client';
import { DEMO_SERVERS } from '@/lib/demo-data';
import { useRouter } from 'next/navigation';

export default function ChannelsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isConfigured, isDemoMode } = useAuth();
  const router = useRouter();
  const [servers, setServers] = useState<Server[]>([]);
  const [createServerOpen, setCreateServerOpen] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    // Nếu ở chế độ Demo rõ ràng -> dùng DEMO_SERVERS
    if (isDemoMode) {
      setServers(DEMO_SERVERS);
      return;
    }

    // Nếu là người dùng thật đã đăng nhập Supabase -> TUYỆT ĐỐI CHỈ DÙNG DỮ LIỆU THẬT TỪ SUPABASE
    if (isConfigured && user) {
      const fetchServers = async () => {
        try {
          const { data, error } = await supabase
            .from('server_members')
            .select('server:servers(*)')
            .eq('profile_id', user.id);

          if (!error && data) {
            const userServers = data
              .map((item: any) => item.server)
              .filter(Boolean) as Server[];
            setServers(userServers);
          } else {
            setServers([]);
          }
        } catch (err) {
          console.error('Lỗi tải danh sách server từ Supabase:', err);
          setServers([]);
        }
      };

      fetchServers();
      return;
    }

    setServers([]);
  }, [isConfigured, user, isDemoMode]);

  const handleCreateServer = async (name: string, iconUrl?: string) => {
    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    if (isConfigured && user && !isDemoMode) {
      try {
        const { data, error } = await supabase
          .from('servers')
          .insert({
            name,
            icon_url: iconUrl || null,
            invite_code: inviteCode,
            owner_id: user.id,
          })
          .select()
          .single();

        if (!error && data) {
          setServers((prev) => [...prev, data as Server]);
          router.push(`/channels/${data.id}/default`);
          return;
        }
      } catch (err) {
        console.error('Lỗi tạo server trên Supabase:', err);
      }
    }

    // Demo Mode chỉ khi người dùng chọn Demo
    if (isDemoMode) {
      const newServer: Server = {
        id: `server-${Date.now()}`,
        name,
        icon_url: iconUrl || null,
        invite_code: inviteCode,
        owner_id: user?.id || 'demo-user-001',
        created_at: new Date().toISOString(),
      };

      setServers((prev) => [...prev, newServer]);
      router.push(`/channels/${newServer.id}/default`);
    }
  };

  const handleJoinServer = async (inviteCode: string) => {
    const matched = servers.find(
      (s) => s.invite_code.toUpperCase() === inviteCode.toUpperCase()
    );
    if (matched) {
      router.push(`/channels/${matched.id}/default`);
    } else {
      router.push(`/invite/${inviteCode}`);
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#1e1f22]">
      {/* Server Sidebar Leftmost (72px) */}
      <ServerSidebar
        servers={servers}
        onOpenCreateServer={() => setCreateServerOpen(true)}
      />

      {/* Main Content Area (offset by 72px) */}
      <div className="flex-1 ml-[72px] flex h-full min-w-0 overflow-hidden">
        {children}
      </div>

      {/* Create Server Modal */}
      <CreateServerModal
        isOpen={createServerOpen}
        onClose={() => setCreateServerOpen(false)}
        onCreateServer={handleCreateServer}
        onJoinServer={handleJoinServer}
      />
    </div>
  );
}
