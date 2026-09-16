'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/lib/context/auth-context';
import { createClient } from '@/lib/supabase/client';

export interface Participant {
  id: string;
  name: string;
  avatarUrl: string;
  isMuted: boolean;
  isVideoOn: boolean;
  isScreenSharing: boolean;
  isSpeaking: boolean;
  stream?: MediaStream;
}

export function useWebRTC(channelId: string | null) {
  const { profile, isConfigured, isDemoMode } = useAuth();
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [participants, setParticipants] = useState<Participant[]>([]);

  const localStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const peerConnections = useRef<Map<string, RTCPeerConnection>>(new Map());

  const supabase = createClient();

  // 1. Initialize local audio stream
  const startLocalAudio = useCallback(async () => {
    try {
      if (typeof window === 'undefined' || !navigator.mediaDevices) return;

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });

      localStreamRef.current = stream;
      setLocalStream(stream);

      // Setup audio analyzer for speaking detection
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        const audioCtx = new AudioContextClass();
        audioContextRef.current = audioCtx;
        const source = audioCtx.createMediaStreamSource(stream);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 512;
        source.connect(analyser);
        analyserRef.current = analyser;

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        const checkAudio = () => {
          if (analyserRef.current) {
            analyserRef.current.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) {
              sum += dataArray[i];
            }
            const avg = sum / dataArray.length;
            setIsSpeaking(avg > 15);
          }
          animFrameRef.current = requestAnimationFrame(checkAudio);
        };
        checkAudio();
      } catch (err) {
        console.warn('Audio analyzer not supported:', err);
      }
    } catch (err) {
      console.warn('Không thể truy cập microphone (đang ở chế độ giả lập):', err);
    }
  }, []);

  // 2. Manage participants in room
  useEffect(() => {
    if (!channelId || !profile) return;

    // Start local audio
    startLocalAudio();

    // Default participants list: Trong chế độ THẬT chỉ có người dùng hiện tại, không có fake demo
    const initialParticipants: Participant[] = isDemoMode
      ? [
          {
            id: profile.id,
            name: profile.display_name || profile.username || 'Bạn',
            avatarUrl: profile.avatar_url || 'https://api.dicebear.com/7.x/bottts/svg?seed=playverse',
            isMuted: false,
            isVideoOn: false,
            isScreenSharing: false,
            isSpeaking: false,
          },
          {
            id: 'peer-alex',
            name: 'Alex Nguyễn',
            avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex',
            isMuted: false,
            isVideoOn: true,
            isScreenSharing: false,
            isSpeaking: false,
          },
          {
            id: 'peer-linh',
            name: 'Linh Chi',
            avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=linh',
            isMuted: true,
            isVideoOn: false,
            isScreenSharing: false,
            isSpeaking: false,
          },
        ]
      : [
          {
            id: profile.id,
            name: profile.display_name || profile.username || 'Bạn',
            avatarUrl: profile.avatar_url || 'https://api.dicebear.com/7.x/bottts/svg?seed=playverse',
            isMuted: false,
            isVideoOn: false,
            isScreenSharing: false,
            isSpeaking: false,
          },
        ];
    setParticipants(initialParticipants);

    // Setup Supabase Realtime Signaling if configured
    if (isConfigured) {
      const roomChannel = supabase.channel(`voice-room:${channelId}`, {
        config: { broadcast: { self: false } },
      });

      roomChannel
        .on('broadcast', { event: 'user-state' }, ({ payload }) => {
          setParticipants((prev) => {
            const exists = prev.find((p) => p.id === payload.id);
            if (exists) {
              return prev.map((p) => (p.id === payload.id ? { ...p, ...payload } : p));
            }
            return [...prev, payload];
          });
        })
        .on('broadcast', { event: 'user-leave' }, ({ payload }) => {
          setParticipants((prev) => prev.filter((p) => p.id !== payload.id));
        })
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            roomChannel.send({
              type: 'broadcast',
              event: 'user-state',
              payload: {
                id: profile.id,
                name: profile.display_name || profile.username,
                avatarUrl: profile.avatar_url,
                isMuted,
                isVideoOn,
                isScreenSharing,
              },
            });
          }
        });

      return () => {
        roomChannel.send({
          type: 'broadcast',
          event: 'user-leave',
          payload: { id: profile.id },
        });
        supabase.removeChannel(roomChannel);
      };
    }
  }, [channelId, profile, isConfigured, startLocalAudio]);

  // Update local participant state in list when speaking or muted
  useEffect(() => {
    if (!profile) return;
    setParticipants((prev) =>
      prev.map((p) =>
        p.id === profile.id
          ? {
              ...p,
              isMuted,
              isVideoOn,
              isScreenSharing,
              isSpeaking: !isMuted && isSpeaking,
              stream: localStream || undefined,
            }
          : p
      )
    );
  }, [profile, isMuted, isVideoOn, isScreenSharing, isSpeaking, localStream]);

  // 3. Toggle Mute
  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
        return;
      }
    }
    setIsMuted((prev) => !prev);
  };

  // 4. Toggle Camera Video
  const toggleVideo = async () => {
    if (isVideoOn) {
      // Turn off video
      if (localStreamRef.current) {
        const videoTrack = localStreamRef.current.getVideoTracks()[0];
        if (videoTrack) {
          videoTrack.stop();
          localStreamRef.current.removeTrack(videoTrack);
        }
      }
      setIsVideoOn(false);
      setIsScreenSharing(false);
    } else {
      // Turn on video
      try {
        if (!navigator.mediaDevices) return;
        const videoStream = await navigator.mediaDevices.getUserMedia({
          video: { width: 1280, height: 720 },
          audio: false,
        });
        const videoTrack = videoStream.getVideoTracks()[0];

        if (localStreamRef.current) {
          localStreamRef.current.addTrack(videoTrack);
        } else {
          localStreamRef.current = videoStream;
        }
        setLocalStream(new MediaStream(localStreamRef.current.getTracks()));
        setIsVideoOn(true);
        setIsScreenSharing(false);
      } catch (err) {
        alert('Không thể mở Camera. Vui lòng cấp quyền truy cập Camera trên trình duyệt.');
      }
    }
  };

  // 5. Toggle Screen Share
  const toggleScreenShare = async () => {
    if (isScreenSharing) {
      // Stop screen share
      if (localStreamRef.current) {
        const videoTrack = localStreamRef.current.getVideoTracks()[0];
        if (videoTrack) {
          videoTrack.stop();
          localStreamRef.current.removeTrack(videoTrack);
        }
      }
      setIsScreenSharing(false);
      setIsVideoOn(false);
    } else {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) return;
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true,
        });
        const screenTrack = screenStream.getVideoTracks()[0];

        screenTrack.onended = () => {
          setIsScreenSharing(false);
          setIsVideoOn(false);
        };

        if (localStreamRef.current) {
          const oldVideoTrack = localStreamRef.current.getVideoTracks()[0];
          if (oldVideoTrack) {
            oldVideoTrack.stop();
            localStreamRef.current.removeTrack(oldVideoTrack);
          }
          localStreamRef.current.addTrack(screenTrack);
        } else {
          localStreamRef.current = screenStream;
        }

        setLocalStream(new MediaStream(localStreamRef.current.getTracks()));
        setIsScreenSharing(true);
        setIsVideoOn(true);
      } catch (err) {
        console.log('Hủy chia sẻ màn hình');
      }
    }
  };

  // 6. Disconnect
  const disconnect = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
    }
    setLocalStream(null);
    setIsVideoOn(false);
    setIsScreenSharing(false);
    setIsMuted(false);
    setIsSpeaking(false);
  };

  return {
    localStream,
    participants,
    isMuted,
    isVideoOn,
    isScreenSharing,
    isSpeaking,
    toggleMute,
    toggleVideo,
    toggleScreenShare,
    disconnect,
  };
}
