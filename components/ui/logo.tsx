'use client';

import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

export function PlayVerseLogo({ size = 'md', showText = true, className = '' }: LogoProps) {
  const sizeMap = {
    sm: { icon: 28, text: 'text-base', subtext: 'text-[9px]' },
    md: { icon: 40, text: 'text-xl', subtext: 'text-[11px]' },
    lg: { icon: 56, text: 'text-2xl', subtext: 'text-xs' },
    xl: { icon: 72, text: 'text-4xl', subtext: 'text-sm' },
  };

  const { icon, text, subtext } = sizeMap[size];

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Signature Cosmic Game-Portal Emblem */}
      <div
        style={{ width: icon, height: icon }}
        className="relative shrink-0 flex items-center justify-center rounded-2xl p-1 bg-gradient-to-br from-[#5865f2] via-[#4752c4] to-[#1e1f22] shadow-lg shadow-[#5865f2]/25 border border-[#5865f2]/40"
      >
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Outer Cosmic Ring */}
          <circle
            cx="50"
            cy="50"
            r="44"
            stroke="url(#ringGrad)"
            strokeWidth="3.5"
            strokeDasharray="6 4"
            opacity="0.8"
          />

          {/* Central Celestial Controller Crest */}
          <path
            d="M26 40 C26 31, 35 25, 50 25 C65 25, 74 31, 74 40 C74 54, 70 73, 62 75 C56 76, 54 66, 50 66 C46 66, 44 76, 38 75 C30 73, 26 54, 26 40 Z"
            fill="url(#controllerGrad)"
            stroke="#ffffff"
            strokeWidth="2.5"
          />

          {/* D-Pad (Left) */}
          <path
            d="M36 41 H42 M39 38 V44"
            stroke="#ffffff"
            strokeWidth="2.8"
            strokeLinecap="round"
          />

          {/* Action Gems (Right) */}
          <circle cx="61" cy="38" r="2.2" fill="#00f0ff" />
          <circle cx="64" cy="42" r="2.2" fill="#23a55a" />
          <circle cx="58" cy="42" r="2.2" fill="#f0b232" />
          <circle cx="61" cy="46" r="2.2" fill="#f23f43" />

          {/* Central Portal Core */}
          <circle cx="50" cy="48" r="4.5" fill="#ffffff" />
          <circle cx="50" cy="48" r="2.2" fill="#5865f2" />

          {/* Glowing Gradients */}
          <defs>
            <linearGradient id="controllerGrad" x1="26" y1="25" x2="74" y2="75" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#5865f2" />
              <stop offset="50%" stopColor="#3d49c6" />
              <stop offset="100%" stopColor="#1a1c38" />
            </linearGradient>
            <linearGradient id="ringGrad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#00f0ff" />
              <stop offset="50%" stopColor="#5865f2" />
              <stop offset="100%" stopColor="#23a55a" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Brand Typography */}
      {showText && (
        <div className="flex flex-col leading-tight">
          <div className="flex items-center gap-1.5">
            <span className={`font-black tracking-wider text-white ${text}`}>
              PLAY<span className="text-[#5865f2]">VERSE</span>
            </span>
          </div>
          <span className={`text-[#23a55a] font-bold tracking-wider uppercase ${subtext}`}>
            by SenExam
          </span>
        </div>
      )}
    </div>
  );
}
