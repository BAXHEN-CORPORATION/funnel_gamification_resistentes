"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  Lock,
  ShieldCheck,
  Play,
  Pause,
  FileAudio,
  Clock,
  CheckCheck,
  Eye,
  AlertTriangle,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AudioFile {
  id: string;
  title: string;
  sender: string;
  duration: string;
  transcript: string;
  reflection: string;
  unlocked: boolean;
  played: boolean;
}

interface SystemEntry {
  id: string;
  text: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const FONT = '-apple-system, BlinkMacSystemFont, "Helvetica Neue", sans-serif';

const INITIAL_AUDIO_FILES: AudioFile[] = [
  {
    id: "audio-01",
    title: "ÁUDIO 01 — A mentira",
    sender: "Relato anônimo",
    duration: "1:24",
    transcript: '"Eu sabia que era errado. Mas parecia mais fácil esconder."',
    reflection: "A questão não era falta de informação. Era escolha.",
    unlocked: true,
    played: false,
  },
  {
    id: "audio-02",
    title: "ÁUDIO 02 — A indiferença",
    sender: "Registro interno",
    duration: "1:04",
    transcript: '"Eu vi. Eu podia ajudar. Mas preferi continuar andando."',
    reflection:
      "O problema não estava distante. Estava no momento em que alguém decidiu não se importar.",
    unlocked: false,
    played: false,
  },
  {
    id: "audio-03",
    title: "ÁUDIO 03 — O poder",
    sender: "Arquivo confidencial",
    duration: "1:14",
    transcript: '"Quando tive a chance, fiz aquilo que antes condenava."',
    reflection:
      "Talvez o poder não crie corrupção. Talvez apenas revele o que já existia.",
    unlocked: false,
    played: false,
  },
  {
    id: "audio-04",
    title: "ÁUDIO 04 — A causa",
    sender: "Investigador",
    duration: "0:57",
    transcript:
      '"Todos procuram culpados no mundo. Poucos têm coragem de olhar para dentro."',
    reflection: "Esta é a direção final da investigação.",
    unlocked: false,
    played: false,
  },
];

const ALL_SYSTEM_MESSAGES: SystemEntry[] = [
  { id: "sys-1", text: "Você entrou no grupo Arquivos Secretos." },
  {
    id: "sys-2",
    text: "Novos arquivos foram liberados após a investigação inicial.",
  },
  {
    id: "sys-3",
    text: "Ouça os relatos com atenção. Eles não apontam para fora. Apontam para algo mais profundo.",
  },
];

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

const AUDIO_SRC_MAP: Record<string, string> = {
  "audio-01": "/audios/evidence-01.mp3",
  "audio-02": "/audios/evidence-02.mp3",
  "audio-03": "/audios/evidence-03.mp3",
  "audio-04": "/audios/evidence-04.mp3",
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ArquivosSecretosPage() {
  const router = useRouter();
  const [audioFiles, setAudioFiles] =
    useState<AudioFile[]>(INITIAL_AUDIO_FILES);
  const [visibleSystemMessages, setVisibleSystemMessages] = useState<
    SystemEntry[]
  >([]);
  const [currentlyPlayingId, setCurrentlyPlayingId] = useState<string | null>(
    null,
  );
  const [playbackProgress, setPlaybackProgress] = useState<
    Record<string, number>
  >({});
  const [showFinalMessage, setShowFinalMessage] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const scrollAnchor = useRef<HTMLDivElement | null>(null);
  const alive = useRef(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioElRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (audioElRef.current) {
        audioElRef.current.pause();
        audioElRef.current = null;
      }
    };
  }, []);

  const scrollBottom = useCallback(() => {
    setTimeout(
      () => scrollAnchor.current?.scrollIntoView({ behavior: "smooth" }),
      80,
    );
  }, []);

  // Reveal system messages on mount
  useEffect(() => {
    const reveal = async () => {
      await sleep(600);
      for (const msg of ALL_SYSTEM_MESSAGES) {
        if (!alive.current) return;
        setVisibleSystemMessages((p) => [...p, msg]);
        await sleep(800);
      }
    };
    reveal();
  }, []);

  const getPlayedCount = useCallback(
    () => audioFiles.filter((a) => a.played).length,
    [audioFiles],
  );

  const unlockNextAudio = useCallback((currentId: string) => {
    setAudioFiles((prev) => {
      const idx = prev.findIndex((a) => a.id === currentId);
      if (idx === -1 || idx === prev.length - 1) return prev;
      return prev.map((a, i) => (i === idx + 1 ? { ...a, unlocked: true } : a));
    });
  }, []);

  const onAudioComplete = useCallback(
    (id: string) => {
      if (!alive.current) return;
      setCurrentlyPlayingId(null);
      setAudioFiles((prev) => {
        const next = prev.map((a) =>
          a.id === id ? { ...a, played: true } : a,
        );
        const allPlayed = next.every((a) => a.played);
        if (allPlayed) {
          setTimeout(() => {
            if (alive.current) {
              setShowFinalMessage(true);
              scrollBottom();
            }
          }, 400);
        }
        return next;
      });
      unlockNextAudio(id);
      scrollBottom();
    },
    [unlockNextAudio, scrollBottom],
  );

  const handlePlayAudio = useCallback(
    (id: string) => {
      if (currentlyPlayingId !== null) return;

      setCurrentlyPlayingId(id);
      setPlaybackProgress((p) => ({ ...p, [id]: 0 }));

      const src = AUDIO_SRC_MAP[id];

      if (src) {
        const audio = new Audio(src);
        audioElRef.current = audio;

        audio.addEventListener("timeupdate", () => {
          if (!audio.duration) return;
          setPlaybackProgress((p) => ({
            ...p,
            [id]: (audio.currentTime / audio.duration) * 100,
          }));
        });

        audio.addEventListener("ended", () => {
          audioElRef.current = null;
          onAudioComplete(id);
        });

        audio.play().catch(() => {
          // Fallback: simulate if autoplay blocked
          audioElRef.current = null;
          runSimulated(id);
        });
        return;
      }

      runSimulated(id);

      function runSimulated(simId: string) {
        const DURATION_MS = 2000;
        const TICK_MS = 50;
        let elapsed = 0;
        intervalRef.current = setInterval(() => {
          elapsed += TICK_MS;
          const pct = Math.min((elapsed / DURATION_MS) * 100, 100);
          setPlaybackProgress((p) => ({ ...p, [simId]: pct }));
          if (elapsed >= DURATION_MS) {
            clearInterval(intervalRef.current!);
            intervalRef.current = null;
            onAudioComplete(simId);
          }
        }, TICK_MS);
      }
    },
    [currentlyPlayingId, onAudioComplete],
  );

  const handleOpenProfile = useCallback(() => {
    if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
    setIsTransitioning(true);
    setTimeout(() => router.push("/perfil-secreto"), 1500);
  }, [router]);

  const playedCount = getPlayedCount();

  return (
    <main
      className="w-full max-w-[100vw] overflow-x-hidden"
      style={{ height: "100dvh", backgroundColor: "#0B141A" }}
    >
      <div
        className="relative mx-auto flex w-full max-w-[430px] flex-col overflow-hidden"
        style={{ height: "100dvh", fontFamily: FONT }}
      >
        {/* ── Header ── */}
        <header
          className="relative z-10 flex flex-shrink-0 items-center gap-2 px-1 py-2"
          style={{ backgroundColor: "#202C33" }}
        >
          <button
            onClick={() => router.back()}
            aria-label="Voltar"
            className="flex min-h-[44px] min-w-[36px] items-center justify-center focus:outline-none"
          >
            <ChevronLeft
              style={{ width: 22, height: 22, color: "#E9EDEF" }}
              aria-hidden="true"
            />
          </button>

          {/* Lock avatar */}
          <div
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full"
            style={{ backgroundColor: "#2A3942" }}
            aria-hidden="true"
          >
            <Lock
              style={{ width: 16, height: 16, color: "#00A884" }}
              aria-hidden="true"
            />
          </div>

          <div className="flex flex-1 flex-col justify-center overflow-hidden">
            <span
              className="truncate"
              style={{ fontSize: 17, fontWeight: 600, color: "#E9EDEF" }}
            >
              Arquivos Secretos
            </span>
            <span style={{ fontSize: 13, color: "#8696A0" }}>
              5 participantes • criptografado
            </span>
          </div>

          <div
            className="flex min-h-[44px] min-w-[44px] items-center justify-center"
            aria-hidden="true"
          >
            <ShieldCheck
              style={{ width: 20, height: 20, color: "#00A884" }}
              aria-hidden="true"
            />
          </div>
        </header>

        {/* ── Scrollable content ── */}
        <div
          className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-3"
          style={{ WebkitOverflowScrolling: "touch" } as React.CSSProperties}
          aria-live="polite"
        >
          {/* Encryption notice */}
          <div
            className="mb-4 flex items-start gap-2 rounded-lg px-3 py-2.5"
            style={{
              backgroundColor: "#1D282F",
              border: "1px solid #2A3942",
            }}
            role="note"
          >
            <ShieldCheck
              style={{
                width: 14,
                height: 14,
                color: "#00A884",
                flexShrink: 0,
                marginTop: 2,
              }}
              aria-hidden="true"
            />
            <p
              className="break-words hyphens-auto"
              style={{ fontSize: 13, color: "#8696A0", lineHeight: 1.45 }}
            >
              As mensagens e arquivos deste grupo são protegidos. Apenas
              investigadores autorizados têm acesso.
            </p>
          </div>

          {/* System messages */}
          <AnimatePresence initial={false}>
            {visibleSystemMessages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="mb-3 flex justify-center"
              >
                <span
                  className="rounded-md px-3 py-1 text-center break-words hyphens-auto"
                  style={{
                    backgroundColor: "#1D282F",
                    fontSize: 12,
                    color: "#8696A0",
                    border: "1px solid #2A3942",
                    maxWidth: "85%",
                    lineHeight: 1.4,
                  }}
                >
                  {msg.text}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Progress unlock */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: visibleSystemMessages.length === 3 ? 1 : 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="mb-4"
          >
            <div className="mb-1.5 flex items-center justify-between">
              <span style={{ fontSize: 12, color: "#8696A0" }}>
                Arquivos desbloqueados
              </span>
              <span style={{ fontSize: 12, color: "#00A884", fontWeight: 600 }}>
                {playedCount}/4
              </span>
            </div>
            <div
              className="h-1 w-full overflow-hidden rounded-full"
              style={{ backgroundColor: "#2A3942" }}
              role="progressbar"
              aria-valuenow={playedCount}
              aria-valuemin={0}
              aria-valuemax={4}
              aria-label={`${playedCount} de 4 arquivos reproduzidos`}
            >
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${(playedCount / 4) * 100}%`,
                  backgroundColor: "#00A884",
                }}
              />
            </div>
          </motion.div>

          {/* Audio files */}
          <div className="space-y-3">
            <AnimatePresence initial={false}>
              {audioFiles.map((audio, idx) => (
                <AudioEvidenceCard
                  key={audio.id}
                  audio={audio}
                  index={idx}
                  isPlaying={currentlyPlayingId === audio.id}
                  progress={playbackProgress[audio.id] ?? 0}
                  onPlay={handlePlayAudio}
                />
              ))}
            </AnimatePresence>
          </div>

          {/* Final message */}
          <AnimatePresence>
            {showFinalMessage && (
              <motion.div
                key="final"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-4 space-y-2"
              >
                {[
                  "Os arquivos apontam para uma conta privada.",
                  "Ela foi criada para publicar apenas fragmentos da investigação.",
                  "O próximo sinal está lá.",
                ].map((line, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, delay: i * 0.2 }}
                    className="flex justify-start"
                  >
                    <div
                      className="max-w-[85%] break-words rounded-lg px-3 py-2 hyphens-auto"
                      style={{
                        backgroundColor: "#202C33",
                        border: "1px solid #2A3942",
                        borderRadius: "4px 12px 12px 12px",
                        fontSize: 15,
                        color: "#E9EDEF",
                        lineHeight: 1.45,
                      }}
                    >
                      {line}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={scrollAnchor} className="h-4" />
        </div>

        {/* ── Bottom CTA ── */}
        <AnimatePresence>
          {showFinalMessage && (
            <motion.div
              key="cta"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.6 }}
              className="relative z-10 flex-shrink-0 px-4 py-4"
              style={{ backgroundColor: "#0B141A" }}
            >
              <button
                onClick={handleOpenProfile}
                aria-label="Abrir perfil secreto"
                className="w-full min-h-[52px] rounded-xl font-semibold transition-opacity active:opacity-80 focus:outline-none focus:ring-2 focus:ring-[#00A884] focus:ring-offset-2 focus:ring-offset-[#0B141A]"
                style={{
                  backgroundColor: "#00A884",
                  fontSize: 16,
                  color: "#FFFFFF",
                  fontFamily: FONT,
                  letterSpacing: "0.01em",
                }}
              >
                Abrir perfil secreto
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Transition overlay ── */}
      <AnimatePresence>
        {isTransitioning && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center"
            style={{ backgroundColor: "#0B141A" }}
            aria-live="assertive"
            aria-atomic="true"
            aria-label="Abrindo perfil privado"
          >
            <motion.div
              animate={{ scale: [1, 1.08, 1] }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="mb-5"
            >
              <Lock
                style={{ width: 52, height: 52, color: "#00A884" }}
                aria-hidden="true"
              />
            </motion.div>
            <p
              style={{
                fontSize: 17,
                color: "#E9EDEF",
                fontFamily: FONT,
                marginBottom: 20,
              }}
            >
              Abrindo perfil privado...
            </p>
            <div className="flex gap-2">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="rounded-full"
                  style={{ width: 7, height: 7, backgroundColor: "#00A884" }}
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{
                    duration: 0.9,
                    repeat: Infinity,
                    delay: i * 0.25,
                  }}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

// ─── AudioEvidenceCard ────────────────────────────────────────────────────────

function AudioEvidenceCard({
  audio,
  index,
  isPlaying,
  progress,
  onPlay,
}: {
  audio: AudioFile;
  index: number;
  isPlaying: boolean;
  progress: number;
  onPlay: (id: string) => void;
}) {
  const isLocked = !audio.unlocked;

  return (
    <motion.div
      key={audio.id}
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <div
        className="overflow-hidden rounded-xl"
        style={{
          backgroundColor: "#202C33",
          border: `1px solid #2A3942`,
          opacity: isLocked ? 0.45 : 1,
          transition: "opacity 0.4s",
        }}
        aria-disabled={isLocked}
      >
        {/* Card header */}
        <div
          className="flex items-center gap-2 px-3 py-2"
          style={{ borderBottom: "1px solid #2A3942" }}
        >
          <FileAudio
            style={{ width: 14, height: 14, color: "#00A884", flexShrink: 0 }}
            aria-hidden="true"
          />
          <span
            className="flex-1 truncate"
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: "#00A884",
              letterSpacing: "0.04em",
            }}
          >
            {audio.title}
          </span>
          {audio.played && (
            <CheckCheck
              style={{ width: 14, height: 14, color: "#00A884" }}
              aria-hidden="true"
            />
          )}
          {isLocked && (
            <Lock
              style={{ width: 13, height: 13, color: "#8696A0" }}
              aria-hidden="true"
            />
          )}
        </div>

        {/* Card body */}
        <div className="px-3 py-3">
          {/* Sender + duration row */}
          <div className="mb-3 flex items-center justify-between">
            <span style={{ fontSize: 12, color: "#8696A0" }}>
              {audio.sender}
            </span>
            <div className="flex items-center gap-1">
              <Clock
                style={{ width: 11, height: 11, color: "#8696A0" }}
                aria-hidden="true"
              />
              <span style={{ fontSize: 12, color: "#8696A0" }}>
                {audio.duration}
              </span>
            </div>
          </div>

          {/* Waveform + play button */}
          <div className="mb-3 flex items-center gap-3">
            <button
              onClick={() => !isLocked && !audio.played && onPlay(audio.id)}
              disabled={isLocked || audio.played || isPlaying}
              aria-label={`Reproduzir ${audio.title}`}
              className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full transition-opacity focus:outline-none focus:ring-2 focus:ring-[#00A884] focus:ring-offset-1 focus:ring-offset-[#202C33] disabled:cursor-not-allowed"
              style={{
                backgroundColor:
                  isLocked || audio.played ? "#2A3942" : "#00A884",
                minHeight: 44,
                minWidth: 44,
              }}
            >
              {isPlaying ? (
                <Pause
                  style={{ width: 16, height: 16, color: "#FFFFFF" }}
                  aria-hidden="true"
                />
              ) : (
                <Play
                  style={{
                    width: 16,
                    height: 16,
                    color: isLocked ? "#4A5568" : "#FFFFFF",
                    marginLeft: 2,
                  }}
                  aria-hidden="true"
                />
              )}
            </button>

            {/* Progress bar */}
            <div className="flex-1">
              {/* Fake waveform bars */}
              <div
                className="mb-1.5 flex items-end gap-[2px]"
                aria-hidden="true"
              >
                {WAVEFORM_HEIGHTS[index % WAVEFORM_HEIGHTS.length].map(
                  (h, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-sm transition-all duration-75"
                      style={{
                        height: h,
                        backgroundColor:
                          isPlaying && (i / 20) * 100 <= progress
                            ? "#00A884"
                            : audio.played
                              ? "#00A884"
                              : "#2A3942",
                        opacity: isLocked ? 0.4 : 1,
                      }}
                    />
                  ),
                )}
              </div>
              {/* Progress track */}
              <div
                className="h-0.5 w-full overflow-hidden rounded-full"
                style={{ backgroundColor: "#2A3942" }}
                role="progressbar"
                aria-valuenow={Math.round(progress)}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`Progresso de ${audio.title}`}
              >
                <div
                  className="h-full rounded-full"
                  style={{
                    width: audio.played ? "100%" : `${progress}%`,
                    backgroundColor: "#00A884",
                    transition: "width 50ms linear",
                  }}
                />
              </div>
            </div>
          </div>

          {/* Currently playing indicator */}
          {isPlaying && (
            <div
              className="mb-2 flex items-center gap-1.5"
              aria-live="polite"
              aria-atomic="true"
            >
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="rounded-full"
                  style={{ width: 4, height: 4, backgroundColor: "#00A884" }}
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{
                    duration: 0.8,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                  aria-hidden="true"
                />
              ))}
              <span style={{ fontSize: 11, color: "#00A884" }}>
                Reproduzindo...
              </span>
            </div>
          )}

          {/* Transcript + reflection (after played) */}
          <AnimatePresence>
            {audio.played && (
              <motion.div
                key="transcript"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div
                  className="mb-2 rounded-lg px-3 py-2"
                  style={{
                    backgroundColor: "#1D282F",
                    border: "1px solid #2A3942",
                  }}
                >
                  <div className="mb-1 flex items-center gap-1.5">
                    <Eye
                      style={{ width: 12, height: 12, color: "#8696A0" }}
                      aria-hidden="true"
                    />
                    <span
                      style={{
                        fontSize: 11,
                        color: "#8696A0",
                        letterSpacing: "0.04em",
                      }}
                    >
                      TRANSCRIÇÃO
                    </span>
                  </div>
                  <p
                    className="break-words hyphens-auto"
                    style={{
                      fontSize: 14,
                      color: "#E9EDEF",
                      lineHeight: 1.45,
                      fontStyle: "italic",
                    }}
                  >
                    {audio.transcript}
                  </p>
                </div>
                <div
                  className="flex items-start gap-2 rounded-lg px-3 py-2"
                  style={{
                    backgroundColor: "#0D1F17",
                    border: "1px solid #1A3828",
                  }}
                >
                  <AlertTriangle
                    style={{
                      width: 13,
                      height: 13,
                      color: "#F59E0B",
                      flexShrink: 0,
                      marginTop: 2,
                    }}
                    aria-hidden="true"
                  />
                  <p
                    className="break-words hyphens-auto"
                    style={{
                      fontSize: 13,
                      color: "#A3C4A8",
                      lineHeight: 1.5,
                    }}
                  >
                    {audio.reflection}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Waveform data ────────────────────────────────────────────────────────────

const WAVEFORM_HEIGHTS: string[][] = [
  [
    "4px",
    "7px",
    "12px",
    "9px",
    "5px",
    "14px",
    "10px",
    "6px",
    "13px",
    "8px",
    "5px",
    "11px",
    "7px",
    "15px",
    "9px",
    "6px",
    "12px",
    "8px",
    "4px",
    "10px",
  ],
  [
    "6px",
    "10px",
    "8px",
    "14px",
    "5px",
    "12px",
    "9px",
    "7px",
    "15px",
    "6px",
    "11px",
    "4px",
    "13px",
    "8px",
    "10px",
    "5px",
    "7px",
    "12px",
    "9px",
    "6px",
  ],
  [
    "8px",
    "5px",
    "13px",
    "7px",
    "11px",
    "4px",
    "9px",
    "14px",
    "6px",
    "10px",
    "5px",
    "12px",
    "8px",
    "6px",
    "15px",
    "7px",
    "9px",
    "5px",
    "11px",
    "8px",
  ],
  [
    "5px",
    "12px",
    "7px",
    "10px",
    "15px",
    "6px",
    "9px",
    "4px",
    "13px",
    "8px",
    "11px",
    "6px",
    "14px",
    "5px",
    "8px",
    "12px",
    "7px",
    "10px",
    "6px",
    "9px",
  ],
];
