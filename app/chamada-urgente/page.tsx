"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useCallAudio } from "@/hooks/useCallAudio";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import {
  Phone,
  PhoneOff,
  MicOff,
  Grid3X3,
  Volume2,
  Plus,
  Video,
  User,
} from "lucide-react";

type CallState = "incoming" | "active" | "ended";

// Three staggered ripple rings
const RINGS = [
  { delay: "0s", opacity: 0.55 },
  { delay: "0.65s", opacity: 0.4 },
  { delay: "1.3s", opacity: 0.25 },
];

interface CallButton {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function ChamadaUrgentePage() {
  const router = useRouter();
  const [callState, setCallState] = useState<CallState>("incoming");
  const [callSeconds, setCallSeconds] = useState<number>(0);
  const [showRedirect, setShowRedirect] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isSpeaker, setIsSpeaker] = useState<boolean>(false);

  const { retryPlay: retryIncomingAudio } = useCallAudio(
    "/audios/incoming-call-vibrate-single.mp3",
    {
      enabled: callState === "incoming",
      repeatInterval: 3000,
      vibrate: true,
      vibratePattern: [400, 200, 400],
    },
  );

  // ── Call-end beep × 3 ──
  useEffect(() => {
    if (callState !== "ended") return;
    let count = 0;
    let current: HTMLAudioElement | null = null;
    const playNext = () => {
      if (count >= 3) return;
      count++;
      const audio = new Audio("/audios/call-end-beep.mp3");
      current = audio;
      audio.addEventListener("ended", playNext, { once: true });
      audio.play().catch(() => {});
    };
    playNext();
    return () => {
      count = 3;
      current?.pause();
    };
  }, [callState]);

  // ── Call timer ──
  useEffect(() => {
    if (callState !== "active") return;
    const interval = setInterval(
      () => setCallSeconds((prev) => prev + 1),
      1000,
    );
    return () => clearInterval(interval);
  }, [callState]);

  // ── Redirect after ended ──
  useEffect(() => {
    if (callState !== "ended") return;
    const t1 = setTimeout(() => setShowRedirect(true), 1500);
    const t2 = setTimeout(() => router.push("/whatsapp"), 4000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [callState, router]);

  const handleAnswer = useCallback(() => setCallState("active"), []);
  const handleEndCall = useCallback(() => setCallState("ended"), []);

  // ── Active call audio — auto-ends call when audio finishes ──
  useCallAudio("/audios/urgent-call.mp3", {
    enabled: callState === "active",
    onEnded: handleEndCall,
  });
  const toggleMute = useCallback(() => setIsMuted((v) => !v), []);
  const toggleSpeaker = useCallback(() => setIsSpeaker((v) => !v), []);

  const currentTime = useMemo(() => {
    const now = new Date();
    return `${now.getHours()}:${String(now.getMinutes()).padStart(2, "0")}`;
  }, []);

  const callButtons: CallButton[] = [
    { icon: <MicOff className="h-7 w-7" />, label: "mudo", active: isMuted },
    { icon: <Grid3X3 className="h-7 w-7" />, label: "teclado" },
    {
      icon: <Volume2 className="h-7 w-7" />,
      label: "áudio",
      active: isSpeaker,
    },
    { icon: <Plus className="h-7 w-7" />, label: "adicionar" },
    { icon: <Video className="h-7 w-7" />, label: "FaceTime" },
    { icon: <User className="h-7 w-7" />, label: "contatos" },
  ];

  return (
    <main
      className="w-full max-w-[100vw] overflow-x-hidden bg-black"
      style={{ height: "100dvh" }}
    >
      <div
        className="relative mx-auto flex w-full max-w-[430px] flex-col overflow-hidden bg-black"
        style={{ height: "100dvh" }}
      >
        {/* Atmospheric bg */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-zinc-900 via-black to-black" />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 80% 45% at 50% 18%, rgba(55,55,55,0.55) 0%, transparent 70%)",
          }}
        />

        {/* Status bar */}
        <div className="relative z-10 flex flex-shrink-0 items-center justify-between px-6 pb-2 pt-4">
          <span className="text-[15px] font-semibold tabular-nums text-white">
            {currentTime}
          </span>
          <div className="flex items-center gap-1.5">
            <div className="flex items-end gap-[2px]">
              {([3, 5, 7, 9] as number[]).map((h, i) => (
                <div
                  key={i}
                  className="w-[3px] rounded-sm bg-white"
                  style={{ height: `${h}px` }}
                />
              ))}
            </div>
            <svg
              width="15"
              height="11"
              viewBox="0 0 15 11"
              fill="white"
              aria-hidden="true"
            >
              <path d="M7.5 9a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3z" />
              <path d="M7.5 5.5a4 4 0 0 1 2.83 1.17l1.06-1.06A5.5 5.5 0 0 0 7.5 4 5.5 5.5 0 0 0 3.61 5.61l1.06 1.06A4 4 0 0 1 7.5 5.5z" />
              <path d="M7.5 1.5a8 8 0 0 1 5.66 2.34l1.06-1.06A9.5 9.5 0 0 0 7.5 0 9.5 9.5 0 0 0 .78 2.78l1.06 1.06A8 8 0 0 1 7.5 1.5z" />
            </svg>
            <div className="flex items-center">
              <div className="flex h-[11px] w-[22px] items-center rounded-[2px] border border-white/80 p-[1px]">
                <div className="h-full w-[75%] rounded-[1px] bg-white" />
              </div>
              <div className="h-[5px] w-[2px] rounded-r-sm bg-white/50" />
            </div>
          </div>
        </div>

        {/* ── INCOMING ── */}
        {callState === "incoming" && (
          <div
            className="relative z-10 flex flex-1 flex-col items-center overflow-hidden"
            onClick={retryIncomingAudio}
          >
            {/* TOP */}
            <div className="flex flex-col items-center gap-5 pt-10">
              <p className="text-xs uppercase tracking-[0.22em] text-white/50">
                Chamada recebida
              </p>

              {/* Avatar + ping rings */}
              <div
                className="relative flex items-center justify-center"
                style={{ width: 112, height: 112 }}
              >
                {RINGS.map((ring, i) => (
                  <span
                    key={i}
                    className="absolute inset-0 animate-ping rounded-full border border-white"
                    style={{
                      animationDelay: ring.delay,
                      animationDuration: "2s",
                      opacity: ring.opacity,
                    }}
                    aria-hidden="true"
                  />
                ))}
                <div className="relative h-28 w-28 flex-shrink-0 overflow-hidden rounded-full border border-zinc-700">
                  <Image
                    src="/avatar-caller.png"
                    alt="Caller"
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
              </div>

              <div className="flex flex-col items-center gap-1">
                <h1 className="text-[28px] font-semibold tracking-tight text-white">
                  Número Privado
                </h1>
                <p className="text-sm text-white/40">Chamada de voz</p>
              </div>
            </div>

            {/* MIDDLE */}
            <div className="flex flex-1 flex-col items-center justify-center gap-2">
              <Volume2 className="h-5 w-5 text-white/30" aria-hidden="true" />
              <p className="max-w-[180px] break-words text-center text-xs hyphens-auto text-white/30">
                Ligue o volume para ouvir
              </p>
            </div>

            {/* BOTTOM: buttons */}
            <div className="flex w-full max-w-[300px] items-center justify-between px-4 pb-16">
              {/* Decline */}
              <div className="flex flex-col items-center gap-2.5">
                <motion.button
                  onClick={handleEndCall}
                  className="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-[#FF3B30] focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 focus:ring-offset-black"
                  aria-label="Recusar chamada"
                  whileTap={{ scale: 0.88 }}
                  style={{ cursor: "pointer" }}
                >
                  <PhoneOff className="h-8 w-8 text-white" aria-hidden="true" />
                </motion.button>
                <span className="text-xs font-light tracking-wide text-white/50">
                  Recusar
                </span>
              </div>

              {/* Answer */}
              <div className="flex flex-col items-center gap-2.5">
                <div className="relative flex items-center justify-center">
                  <span
                    className="absolute animate-ping rounded-full bg-[#34C759]"
                    style={{
                      inset: -10,
                      opacity: 0.22,
                      animationDuration: "1.3s",
                    }}
                    aria-hidden="true"
                  />
                  <span
                    className="absolute animate-ping rounded-full bg-[#34C759]"
                    style={{
                      inset: -5,
                      opacity: 0.32,
                      animationDuration: "1.3s",
                      animationDelay: "0.35s",
                    }}
                    aria-hidden="true"
                  />
                  <motion.button
                    onClick={handleAnswer}
                    className="relative z-10 flex h-[72px] w-[72px] items-center justify-center rounded-full bg-[#34C759] focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 focus:ring-offset-black"
                    aria-label="Atender chamada"
                    whileTap={{ scale: 0.88 }}
                    style={{
                      boxShadow: "0 0 28px rgba(52,199,89,0.5)",
                      cursor: "pointer",
                    }}
                  >
                    <Phone className="h-8 w-8 text-white" aria-hidden="true" />
                  </motion.button>
                </div>
                <span className="text-xs font-light tracking-wide text-white/50">
                  Atender
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ── ACTIVE ── */}
        {callState === "active" && (
          <div className="relative z-10 flex flex-1 flex-col overflow-hidden">
            {/* Caller info */}
            <div className="flex flex-shrink-0 flex-col items-center gap-2 pt-8">
              <div className="relative h-16 w-16 overflow-hidden rounded-full border border-zinc-700">
                <Image
                  src="/avatar-caller.png"
                  alt="Caller"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex flex-col items-center gap-0.5">
                <h2 className="text-2xl font-semibold tracking-tight text-white">
                  Número Privado
                </h2>
                <p className="text-sm tabular-nums text-white/50">
                  {formatDuration(callSeconds)}
                </p>
              </div>
            </div>

            {/* Spacer */}
            <div className="flex-1" />

            {/* iOS call button grid */}
            <div className="flex-shrink-0 px-8 pb-8">
              <div className="grid grid-cols-3 gap-5">
                {callButtons.map((btn, i) => {
                  const isActionable = i === 0 || i === 2;
                  return (
                    <motion.button
                      key={i}
                      onClick={
                        i === 0
                          ? toggleMute
                          : i === 2
                            ? toggleSpeaker
                            : undefined
                      }
                      className={[
                        "flex flex-col items-center justify-center gap-1.5 rounded-2xl py-4",
                        "focus:outline-none focus:ring-2 focus:ring-white/30",
                        btn.active
                          ? "bg-white text-zinc-900"
                          : "bg-white/[0.14] text-white",
                        !isActionable
                          ? "opacity-50 cursor-default"
                          : "cursor-pointer",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      aria-label={btn.label}
                      aria-pressed={isActionable ? btn.active : undefined}
                      whileTap={isActionable ? { scale: 0.93 } : undefined}
                    >
                      {btn.icon}
                      <span className="text-[11px] font-medium tracking-wide">
                        {btn.label}
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* End call */}
            <div className="flex flex-shrink-0 flex-col items-center pb-12">
              <motion.button
                onClick={handleEndCall}
                className="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-[#FF3B30] focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 focus:ring-offset-black"
                aria-label="Encerrar chamada"
                whileTap={{ scale: 0.88 }}
                style={{ cursor: "pointer" }}
              >
                <PhoneOff className="h-8 w-8 text-white" aria-hidden="true" />
              </motion.button>
            </div>
          </div>
        )}

        {/* ── ENDED ── */}
        {callState === "ended" && (
          <div
            className="relative z-10 flex flex-1 flex-col items-center justify-center gap-5 px-10"
            aria-live="assertive"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900">
              <PhoneOff className="h-7 w-7 text-zinc-500" aria-hidden="true" />
            </div>
            <div className="flex flex-col items-center gap-1 text-center">
              <p className="text-lg font-medium text-white/65">
                Chamada encerrada
              </p>
              <p className="text-sm tabular-nums text-zinc-600">
                {formatDuration(callSeconds)}
              </p>
            </div>

            {showRedirect && (
              <div className="mt-4 flex flex-col items-center gap-3">
                <div className="flex gap-1.5" aria-hidden="true">
                  {([0, 1, 2] as number[]).map((i) => (
                    <motion.div
                      key={i}
                      className="h-1.5 w-1.5 rounded-full bg-[#34C759]"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        delay: i * 0.22,
                      }}
                    />
                  ))}
                </div>
                <p className="text-center text-sm text-white/40">
                  Verificando WhatsApp...
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
