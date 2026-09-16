'use client';

import React, { useEffect, useRef } from 'react';
import { Channel } from '@/types/database';
import { Participant } from '@/hooks/use-webrtc';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Monitor,
  PhoneOff,
  Volume2,
  Users,
  MessageSquare,
} from 'lucide-react';

interface VoiceRoomProps {
  channel: Channel;
  participants: Participant[];
  localStream: MediaStream | null;
  isMuted: boolean;
  isVideoOn: boolean;
  isScreenSharing: boolean;
  onToggleMute: () => void;
  onToggleVideo: () => void;
  onToggleScreenShare: () => void;
  onDisconnect: () => void;
}

export function VoiceRoom({
  channel,
  participants,
  localStream,
  isMuted,
  isVideoOn,
  isScreenSharing,
  onToggleMute,
  onToggleVideo,
  onToggleScreenShare,
  onDisconnect,
}: VoiceRoomProps) {
  return (
    <div className="flex-1 flex flex-col h-full bg-[#1e1f22] select-none min-w-0">
      {/* Top Header */}
      <header className="h-12 border-b border-[#2b2d31] px-4 flex items-center justify-between shadow-sm shrink-0 bg-[#2b2d31]">
        <div className="flex items-center gap-2">
          <Volume2 size={24} className="text-[#23a55a] shrink-0" />
          <h2 className="font-bold text-white text-base truncate">{channel.name}</h2>
          <span className="text-xs text-[#23a55a] font-semibold bg-[#23a55a]/10 px-2 py-0.5 rounded-full border border-[#23a55a]/30 hidden sm:inline">
            RTC Đang kết nối
          </span>
        </div>

        <div className="flex items-center gap-3 text-[#b5bac1]">
          <div className="flex items-center gap-1.5 text-xs text-[#949ba4]">
            <Users size={16} />
            <span>{participants.length} người trong phòng</span>
          </div>
        </div>
      </header>

      {/* Main Video & Audio Participant Grid */}
      <div className="flex-1 p-6 overflow-y-auto overflow-x-hidden flex items-center justify-center">
        <div
          className={`grid gap-4 w-full h-full max-h-[700px] max-w-5xl ${
            participants.length <= 1
              ? 'grid-cols-1'
              : participants.length === 2
              ? 'grid-cols-1 md:grid-cols-2'
              : participants.length <= 4
              ? 'grid-cols-2'
              : 'grid-cols-2 md:grid-cols-3'
          }`}
        >
          {participants.map((p, index) => (
            <ParticipantTile
              key={p.id || index}
              participant={p}
              localStream={localStream}
            />
          ))}
        </div>
      </div>

      {/* Discord Floating Bottom Control Bar */}
      <div className="pb-8 pt-2 flex items-center justify-center select-none shrink-0">
        <div className="bg-[#2b2d31] rounded-2xl px-6 py-3 flex items-center gap-4 shadow-2xl border border-[#3f4147]">
          {/* Mute Mic Button */}
          <button
            onClick={onToggleMute}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition cursor-pointer ${
              isMuted
                ? 'bg-[#f23f43] text-white hover:bg-[#da373b]'
                : 'bg-[#35373c] text-white hover:bg-[#404249]'
            }`}
            title={isMuted ? 'Bật Micro' : 'Tắt Micro'}
          >
            {isMuted ? <MicOff size={22} /> : <Mic size={22} />}
          </button>

          {/* Camera Video Button */}
          <button
            onClick={onToggleVideo}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition cursor-pointer ${
              isVideoOn
                ? 'bg-white text-black hover:bg-gray-200'
                : 'bg-[#35373c] text-white hover:bg-[#404249]'
            }`}
            title={isVideoOn ? 'Tắt Camera' : 'Bật Camera'}
          >
            {isVideoOn ? <Video size={22} /> : <VideoOff size={22} />}
          </button>

          {/* Screen Share Button */}
          <button
            onClick={onToggleScreenShare}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition cursor-pointer ${
              isScreenSharing
                ? 'bg-[#23a55a] text-white hover:bg-[#1f9250]'
                : 'bg-[#35373c] text-white hover:bg-[#404249]'
            }`}
            title={isScreenSharing ? 'Dừng chia sẻ màn hình' : 'Chia sẻ màn hình'}
          >
            <Monitor size={22} />
          </button>

          <div className="w-[1px] h-6 bg-[#4e5058]/50" />

          {/* Disconnect Red Button */}
          <button
            onClick={onDisconnect}
            className="w-12 h-12 rounded-full bg-[#f23f43] hover:bg-[#da373b] text-white flex items-center justify-center transition cursor-pointer shadow-lg"
            title="Ngắt kết nối đàm thoại"
          >
            <PhoneOff size={22} />
          </button>
        </div>
      </div>
    </div>
  );
}

function ParticipantTile({
  participant,
  localStream,
}: {
  participant: Participant;
  localStream: MediaStream | null;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamToUse = participant.stream || localStream;

  useEffect(() => {
    if (videoRef.current && streamToUse && participant.isVideoOn) {
      videoRef.current.srcObject = streamToUse;
    }
  }, [streamToUse, participant.isVideoOn]);

  return (
    <div
      className={`relative bg-[#2b2d31] rounded-2xl overflow-hidden flex items-center justify-center border border-[#35373c] min-h-[220px] transition-all duration-200 ${
        participant.isSpeaking
          ? 'ring-4 ring-[#23a55a] shadow-[0_0_20px_rgba(35,165,90,0.5)]'
          : ''
      }`}
    >
      {/* Video stream OR Avatar */}
      {participant.isVideoOn && streamToUse ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={participant.id.includes('demo') || participant.id.length < 15}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="flex flex-col items-center justify-center">
          <div className="relative">
            <img
              src={participant.avatarUrl}
              alt={participant.name}
              className={`w-24 h-24 rounded-full bg-[#1e1f22] object-cover transition-transform duration-200 ${
                participant.isSpeaking ? 'scale-105' : ''
              }`}
            />
            {participant.isSpeaking && (
              <div className="absolute inset-0 rounded-full border-2 border-[#23a55a] animate-ping pointer-events-none" />
            )}
          </div>
        </div>
      )}

      {/* Name and Status Tag Bottom-Left */}
      <div className="absolute bottom-3 left-3 bg-[#111214]/80 backdrop-blur-sm px-3 py-1 rounded-md flex items-center gap-2 text-xs font-semibold text-white">
        <span className="truncate max-w-[150px]">{participant.name}</span>
        {participant.isMuted && <MicOff size={14} className="text-[#f23f43] shrink-0" />}
      </div>
    </div>
  );
}
