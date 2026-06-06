"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, PhoneOff, Volume2 } from "lucide-react";

type CallState = "incoming" | "active" | "ended";

interface ScriptLine {
  id: number;
  text: string;
}

const SCRIPT_LINES: ScriptLine[] = [
  { id: 1, text: "Você sabe o que está acontecendo com a sociedade." },
  { id: 2, text: "Não é coincidência. Nunca foi." },
  { id: 3, text: "Existem forças que preferem que ninguém questione." },
  { id: 4, text: "Compilamos os arquivos. As evidências estão organizadas." },
  { id: 5, text: "Mas precisamos de alguém que realmente queira entender." },
  { id: 6, text: "Alguém como você." },
  { id: 7, text: "Vou te enviar o acesso. Verifique seu WhatsApp." },
];

const FIRST_LINE_DELAY_MS = 1500;
const SCRIPT_INTERVAL_MS = 5000;
const END_AFTER_LAST_LINE_MS = 3500;
const REDIRECT_SHOW_DELAY_MS = 1500;
const REDIRECT_PUSH_DELAY_MS = 4000;

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

const WAVE_BARS = [0, 1, 2, 3, 4];

// Three staggered ripple rings
const RINGS = [
  { delay: "0s", opacity: 0.55 },
  { delay: "0.65s", opacity: 0.4 },
  { delay: "1.3s", opacity: 0.25 },
];

export default function ChamadaUrgentePage() {
  const router = useRouter();
  const [callState, setCallState] = useState<CallState>("incoming");
  const [visibleLines, setVisibleLines] = useState<ScriptLine[]>([]);
  const [callSeconds, setCallSeconds] = useState<number>(0);
  const [showRedirect, setShowRedirect] = useState<boolean>(false);

  const handleAnswer = useCallback(() => setCallState("active"), []);
  const handleDecline = useCallback(() => setCallState("ended"), []);

  // Call timer
  useEffect(() => {
    if (callState !== "active") return;
    const interval = setInterval(
      () => setCallSeconds((prev) => prev + 1),
      1000
    );
    return () => clearInterval(interval);
  }, [callState]);

  // Progressive script reveal
  useEffect(() => {
    if (callState !== "active") return;
    if (visibleLines.length >= SCRIPT_LINES.length) return;
    const delay =
      visibleLines.length === 0 ? FIRST_LINE_DELAY_MS : SCRIPT_INTERVAL_MS;
    const t = setTimeout(() => {
      setVisibleLines((prev) => {
        const next = SCRIPT_LINES[prev.length];
        return next ? [...prev, next] : prev;
      });
    }, delay);
    return () => clearTimeout(t);
  }, [callState, visibleLines]);

  // End call after last line
  useEffect(() => {
    if (visibleLines.length !== SCRIPT_LINES.length) return;
    const t = setTimeout(() => setCallState("ended"), END_AFTER_LAST_LINE_MS);
    return () => clearTimeout(t);
  }, [visibleLines]);

  // Redirect sequence
  useEffect(() => {
    if (callState !== "ended") return;
    const t1 = setTimeout(() => setShowRedirect(true), REDIRECT_SHOW_DELAY_MS);
    const t2 = setTimeout(
      () => router.push("/whatsapp"),
      REDIRECT_PUSH_DELAY_MS
    );
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [callState, router]);

  const currentTime = useMemo(() => {
    const now = new Date();
    return `${now.getHours()}:${String(now.getMinutes()).padStart(2, "0")}`;
  }, []);

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

        {/* Status bar — always visible */}
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

        {/* ── INCOMING ── plain div, always visible when callState matches */}
        {callState === "incoming" && (
          <div className="relative z-10 flex flex-1 flex-col items-center overflow-hidden">
            {/* TOP: caller info */}
            <div className="flex flex-col items-center gap-5 pt-10">
              <p className="text-xs uppercase tracking-[0.22em] text-white/50">
                Chamada recebida
              </p>

              {/* Avatar + CSS ping rings */}
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
                <div className="relative flex h-28 w-28 flex-shrink-0 select-none items-center justify-center rounded-full border border-zinc-700 bg-zinc-800">
                  <span className="text-5xl font-thin text-white/25">?</span>
                </div>
              </div>

              <div className="flex flex-col items-center gap-1">
                <h1 className="text-[28px] font-semibold tracking-tight text-white">
                  Número Privado
                </h1>
                <p className="text-sm text-white/40">Chamada de voz</p>
              </div>
            </div>

            {/* MIDDLE: volume hint */}
            <div className="flex flex-1 flex-col items-center justify-center gap-2">
              <Volume2 className="h-5 w-5 text-white/30" aria-hidden="true" />
              <p className="max-w-[180px] break-words text-center text-xs hyphens-auto text-white/30">
                Ligue o volume para ouvir
              </p>
            </div>

            {/* BOTTOM: action buttons */}
            <div className="flex w-full max-w-[300px] items-center justify-between px-4 pb-16">
              {/* Decline */}
              <div className="flex flex-col items-center gap-2.5">
                <motion.button
                  onClick={handleDecline}
                  className="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-[#FF3B30] focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 focus:ring-offset-black"
                  aria-label="Recusar chamada"
                  whileTap={{ scale: 0.88 }}
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
                  {/* CSS pulse glow rings */}
                  <span
                    className="absolute animate-ping rounded-full bg-[#34C759]"
                    style={{ inset: -10, opacity: 0.22, animationDuration: "1.3s" }}
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
                    style={{ boxShadow: "0 0 28px rgba(52,199,89,0.5)" }}
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
            {/* Header */}
            <div className="flex flex-shrink-0 flex-col items-center gap-1 pb-4 pt-6">
              <p className="text-xs uppercase tracking-[0.15em] text-white/50">
                Em chamada
              </p>
              <h2 className="text-xl font-medium text-white">Número Privado</h2>
              <p
                className="text-sm tabular-nums text-[#34C759]"
                aria-live="polite"
                aria-label={`Duração: ${formatDuration(callSeconds)}`}
              >
                {formatDuration(callSeconds)}
              </p>
            </div>

            {/* Waveform */}
            <div
              className="flex flex-shrink-0 items-center justify-center gap-2 py-5"
              aria-hidden="true"
            >
              {WAVE_BARS.map((i) => (
                <motion.div
                  key={i}
                  className="w-[5px] rounded-full bg-[#34C759]"
                  style={{ height: 28, transformOrigin: "50% 50%" }}
                  animate={{ scaleY: [0.25, 1, 0.45, 0.8, 0.25] }}
                  transition={{
                    duration: 0.75,
                    repeat: Infinity,
                    delay: i * 0.13,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </div>

            {/* Transcript */}
            <div
              className="flex-1 overflow-y-auto px-6 pb-4"
              role="log"
              aria-live="polite"
              aria-label="Transcrição da chamada"
            >
              <div className="flex flex-col gap-5 pb-4">
                <AnimatePresence>
                  {visibleLines.map((line) => (
                    <motion.div
                      key={line.id}
                      className="flex items-start gap-3"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                    >
                      <div
                        className="mt-[9px] h-1.5 w-1.5 flex-shrink-0 rounded-full bg-zinc-500"
                        aria-hidden="true"
                      />
                      <p className="break-words text-[15px] leading-[1.65] hyphens-auto text-white/85">
                        {line.text}
                      </p>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {visibleLines.length < SCRIPT_LINES.length && (
                  <motion.div
                    className="flex items-center gap-1.5 pl-[18px]"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: 0.4 }}
                    aria-label="Aguardando..."
                  >
                    {([0, 1, 2] as number[]).map((i) => (
                      <motion.div
                        key={i}
                        className="h-1.5 w-1.5 rounded-full bg-zinc-600"
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{
                          duration: 1.1,
                          repeat: Infinity,
                          delay: i * 0.22,
                        }}
                      />
                    ))}
                  </motion.div>
                )}
              </div>
            </div>

            {/* End call */}
            <div className="flex flex-shrink-0 flex-col items-center gap-2 pb-14 pt-4">
              <motion.button
                onClick={handleDecline}
                className="flex h-[64px] w-[64px] items-center justify-center rounded-full bg-[#FF3B30] focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 focus:ring-offset-black"
                aria-label="Encerrar chamada"
                whileTap={{ scale: 0.88 }}
              >
                <PhoneOff className="h-7 w-7 text-white" aria-hidden="true" />
              </motion.button>
              <span className="text-xs text-white/35">Encerrar</span>
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
