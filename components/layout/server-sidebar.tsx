'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Server } from '@/types/database';
import { Plus, Compass, MessageSquare } from 'lucide-react';
import Image from 'next/image';

interface ServerSidebarProps {
  servers: Server[];
  onOpenCreateServer: () => void;
}

export function ServerSidebar({ servers, onOpenCreateServer }: ServerSidebarProps) {
  const pathname = usePathname();
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const isMeActive = pathname?.startsWith('/channels/me') || pathname?.startsWith('/channels/@me');

  return (
    <nav className="fixed left-0 top-0 bottom-0 w-[72px] bg-[#1e1f22] flex flex-col items-center py-3 gap-2 z-40 select-none overflow-x-hidden">
      {/* Home / Direct Messages Button */}
      <div className="relative group flex items-center justify-center w-full">
        {/* Active/Hover Pill */}
        <div
          className={`absolute left-0 w-1 bg-white rounded-r-full transition-all duration-200 ${
            isMeActive
              ? 'h-10'
              : hoveredId === 'me'
              ? 'h-5'
              : 'h-0'
          }`}
        />
        <Link
          href="/channels/me"
          onMouseEnter={() => setHoveredId('me')}
          onMouseLeave={() => setHoveredId(null)}
          className={`relative flex items-center justify-center w-12 h-12 rounded-[24px] transition-all duration-200 group-hover:rounded-[16px] ${
            isMeActive
              ? 'bg-[#5865f2] text-white rounded-[16px]'
              : 'bg-[#313338] text-[#dbdee1] hover:bg-[#5865f2] hover:text-white'
          }`}
        >
          {/* Logo PlayVerse */}
          <div className="flex items-center justify-center font-bold text-lg tracking-wider">
            PV
          </div>
        </Link>
        {/* Tooltip */}
        <div className="absolute left-[84px] px-3 py-1.5 bg-[#111214] text-white text-xs font-semibold rounded-md shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap">
          Tin nhắn trực tiếp
          <div className="absolute top-1/2 -left-1 -translate-y-1/2 border-4 border-transparent border-r-[#111214]" />
        </div>
      </div>

      {/* Separator */}
      <div className="w-8 h-[2px] bg-[#35363c] rounded my-1" />

      {/* Server Icons List */}
      <div className="flex-1 w-full overflow-y-auto no-scrollbar flex flex-col items-center gap-2">
        {servers.map((server) => {
          const isActive = pathname?.includes(`/channels/${server.id}`);
          const initials = server.name
            .split(' ')
            .map((w) => w[0])
            .slice(0, 2)
            .join('')
            .toUpperCase();

          return (
            <div key={server.id} className="relative group flex items-center justify-center w-full">
              {/* Active/Hover Pill */}
              <div
                className={`absolute left-0 w-1 bg-white rounded-r-full transition-all duration-200 ${
                  isActive
                    ? 'h-10'
                    : hoveredId === server.id
                    ? 'h-5'
                    : 'h-0'
                }`}
              />
              <Link
                href={`/channels/${server.id}/default`}
                onMouseEnter={() => setHoveredId(server.id)}
                onMouseLeave={() => setHoveredId(null)}
                className={`relative flex items-center justify-center w-12 h-12 rounded-[24px] overflow-hidden transition-all duration-200 group-hover:rounded-[16px] ${
                  isActive
                    ? 'bg-[#5865f2] text-white rounded-[16px]'
                    : 'bg-[#313338] text-[#dbdee1] hover:bg-[#5865f2] hover:text-white'
                }`}
              >
                {server.icon_url ? (
                  <img
                    src={server.icon_url}
                    alt={server.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="font-semibold text-sm">{initials}</span>
                )}
              </Link>
              {/* Tooltip */}
              <div className="absolute left-[84px] px-3 py-1.5 bg-[#111214] text-white text-xs font-semibold rounded-md shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap">
                {server.name}
                <div className="absolute top-1/2 -left-1 -translate-y-1/2 border-4 border-transparent border-r-[#111214]" />
              </div>
            </div>
          );
        })}

        {/* Add Server Button */}
        <div className="relative group flex items-center justify-center w-full">
          <div
            className={`absolute left-0 w-1 bg-white rounded-r-full transition-all duration-200 ${
              hoveredId === 'add' ? 'h-5' : 'h-0'
            }`}
          />
          <button
            onClick={onOpenCreateServer}
            onMouseEnter={() => setHoveredId('add')}
            onMouseLeave={() => setHoveredId(null)}
            className="flex items-center justify-center w-12 h-12 rounded-[24px] bg-[#313338] text-[#23a55a] hover:bg-[#23a55a] hover:text-white transition-all duration-200 hover:rounded-[16px] cursor-pointer"
          >
            <Plus size={24} />
          </button>
          {/* Tooltip */}
          <div className="absolute left-[84px] px-3 py-1.5 bg-[#111214] text-white text-xs font-semibold rounded-md shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap">
            Thêm một máy chủ
            <div className="absolute top-1/2 -left-1 -translate-y-1/2 border-4 border-transparent border-r-[#111214]" />
          </div>
        </div>
      </div>
    </nav>
  );
}
