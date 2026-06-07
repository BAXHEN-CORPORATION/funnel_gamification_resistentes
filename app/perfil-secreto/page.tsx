"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  MoreVertical,
  BookOpen,
  Play,
  Pause,
  X,
  Heart,
  MessageCircle,
  Share2,
  Eye,
  ArrowRight,
  Volume2,
  Lock,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface VideoSegment {
  start: number;
  end: number;
  audio: string;
  text?: string;
}

interface SecretVideo {
  id: string;
  title: string;
  duration: number;
  thumbnailText: string;
  videoSrc?: string; // undefined = locked from grid; still auto-played in sequence
  segments: VideoSegment[];
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const VIDEOS: SecretVideo[] = [
  {
    id: "v1",
    title: "VOCÊ ENCONTROU A RAIZ",
    duration: 22,
    thumbnailText: "VOCÊ ENCONTROU A RAIZ",
    videoSrc: "/videos/historia-01.webm",
    segments: [
      { start: 0, end: 7, audio: "Parabéns.", text: "VOCÊ ENCONTROU A RAIZ" },
      {
        start: 7,
        end: 13,
        audio:
          "Você descobriu aquilo que a maioria das pessoas nunca descobre.",
        text: "O PROBLEMA NÃO ESTÁ APENAS NO MUNDO",
      },
      {
        start: 13,
        end: 22,
        audio: "Está dentro de cada ser humano.",
        text: "DENTRO DE NÓS",
      },
      // {
      //   start: 21,
      //   end: 35,
      //   audio:
      //     "Mas existe algo que você precisa entender. Descobrir a raiz não é o fim da investigação. É apenas o começo.",
      // },
    ],
  },
  {
    id: "v2",
    title: "O ERRO QUE EU COMETI",
    duration: 22,
    thumbnailText: "O ERRO QUE EU COMETI",
    videoSrc: "/videos/historia-02.webm",
    segments: [
      {
        start: 0,
        end: 11,
        audio:
          "Quando percebi isso pela primeira vez... achei que tinha encontrado a resposta.",
      },
      {
        start: 11,
        end: 21,
        audio: "Mas eu estava errado.",
        text: "EU SÓ TINHA ENCONTRADO O PROBLEMA",
      },
      // {
      //   start: 21,
      //   end: 36,
      //   audio:
      //     "Você pode identificar uma doença. Mas isso não significa que sabe curá-la.",
      // },
      // {
      //   start: 36,
      //   end: 45,
      //   audio: "Foi aí que minha verdadeira busca começou.",
      // },
    ],
  },
  {
    id: "v3",
    title: "A PERGUNTA QUE ME PERSEGUIU",
    duration: 23,
    thumbnailText: "EXISTE ESPERANÇA?",
    videoSrc: "/videos/historia-03.webm",
    segments: [
      { start: 0, end: 9, audio: "Aos treze anos... eu comecei uma busca." },
      // {
      //   start: 9,
      //   end: 21,
      //   audio:
      //     "Uma busca pela verdade. Uma busca pela origem. Uma busca pelo sentido.",
      // },
      // {
      //   start: 21,
      //   end: 36,
      //   audio:
      //     "Durante anos eu procurei respostas. Em livros. Histórias. Filosofias. Religiões.",
      // },
      {
        start: 18,
        end: 23,
        audio: "E uma pergunta nunca me abandonou.",
        text: "EXISTE ESPERANÇA?",
      },
    ],
  },
  {
    id: "v4",
    title: "O QUE EU DESCOBRI",
    duration: 21,
    thumbnailText: "O QUE EU DESCOBRI",
    videoSrc: "/videos/historia-04.webm",
    segments: [
      {
        start: 0,
        end: 13,
        audio: "Depois de anos investigando... eu encontrei uma resposta.",
      },
      { start: 13, end: 21, audio: "E essa resposta mudou tudo." },
      {
        start: 13,
        end: 18,
        audio:
          "Mas existe um problema. Se eu simplesmente te contar a conclusão... ela terá muito menos valor.",
      },
      {
        start: 18,
        end: 21,
        audio:
          "Porque algumas verdades precisam ser percorridas. Não apenas ouvidas.",
      },
    ],
  },
  {
    id: "v5",
    title: "O FIM DA INVESTIGAÇÃO",
    duration: 25,
    thumbnailText: "O DESPERTAR DOS RESISTENTES",
    videoSrc: "/videos/historia-05.webm",
    segments: [
      { start: 0, end: 11, audio: "Você chegou mais longe do que a maioria." },
      // {
      //   start: 11,
      //   end: 23,
      //   audio: "Descobriu a raiz. Mas ainda não descobriu a solução.",
      // },
      // {
      //   start: 23,
      //   end: 36,
      //   audio: "Foi exatamente essa busca que consumiu anos da minha vida.",
      // },
      // {
      //   start: 36,
      //   end: 49,
      //   audio:
      //     "Eu reuni toda essa jornada. As perguntas. As descobertas. As respostas.",
      // },
      {
        start: 11,
        end: 25,
        audio:
          "E transformei tudo em um livro. Se você quiser conhecer a conclusão da investigação... ela está lá.",
        text: "O DESPERTAR DOS RESISTENTES",
      },
    ],
  },
];

const THUMB_BG = [
  "radial-gradient(ellipse at 35% 40%, #1a0a2e 0%, #000 80%)",
  "radial-gradient(ellipse at 65% 35%, #0a1a2e 0%, #000 80%)",
  "radial-gradient(ellipse at 40% 60%, #0e1a08 0%, #000 80%)",
  "radial-gradient(ellipse at 60% 40%, #2a0a12 0%, #000 80%)",
  "radial-gradient(ellipse at 50% 50%, #0a1e18 0%, #000 80%)",
];

const SIM_BG = [
  "radial-gradient(ellipse at 30% 35%, #1a0a2e 0%, #0a0a1a 50%, #000 100%)",
  "radial-gradient(ellipse at 70% 30%, #0a1a2e 0%, #000a1a 50%, #000 100%)",
  "radial-gradient(ellipse at 40% 60%, #0e1a08 0%, #050505 50%, #000 100%)",
  "radial-gradient(ellipse at 60% 40%, #2a0a12 0%, #100005 50%, #000 100%)",
  "radial-gradient(ellipse at 50% 50%, #0a1e18 0%, #000a08 50%, #000 100%)",
];

const FONT = '-apple-system, BlinkMacSystemFont, "Helvetica Neue", sans-serif';
const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)'/%3E%3C/svg%3E\")";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getCurrentSegment(video: SecretVideo, time: number): VideoSegment {
  return (
    video.segments.find((s) => time >= s.start && time < s.end) ??
    video.segments[video.segments.length - 1]
  );
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PerfilSecretoPage() {
  const router = useRouter();
  const [selectedVideoIndex, setSelectedVideoIndex] = useState<number | null>(
    null,
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [videoEnded, setVideoEnded] = useState(false);
  const [watchedVideoIds, setWatchedVideoIds] = useState<string[]>([]);
  const [showFinalCTA, setShowFinalCTA] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const alive = useRef(true);
  const currentTimeRef = useRef(0);
  const selectedVideoIndexRef = useRef<number | null>(null);

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  useEffect(() => {
    selectedVideoIndexRef.current = selectedVideoIndex;
  }, [selectedVideoIndex]);

  // Drives time for simulated (non-real-video) playback
  const startSimulatedPlayback = useCallback((videoIndex: number) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    const vid = VIDEOS[videoIndex];
    intervalRef.current = setInterval(() => {
      if (!alive.current) return;
      currentTimeRef.current = Math.min(
        currentTimeRef.current + 0.1,
        vid.duration,
      );
      setCurrentTime(currentTimeRef.current);
      if (currentTimeRef.current >= vid.duration) {
        clearInterval(intervalRef.current!);
        intervalRef.current = null;
        if (!alive.current) return;
        setIsPlaying(false);
        setVideoEnded(true);
        setWatchedVideoIds((p) => (p.includes(vid.id) ? p : [...p, vid.id]));
      }
    }, 100);
  }, []);

  // forceOpen = true bypasses grid lock (used for auto-advance)
  const openVideo = useCallback(
    (index: number, forceOpen = false) => {
      if (index >= VIDEOS.length) return;
      if (!forceOpen && !VIDEOS[index].videoSrc) return;
      if (intervalRef.current) clearInterval(intervalRef.current);
      currentTimeRef.current = 0;
      setSelectedVideoIndex(index);
      setCurrentTime(0);
      setVideoDuration(VIDEOS[index].duration);
      setVideoEnded(false);
      setIsPlaying(true);
      if (!VIDEOS[index].videoSrc) {
        startSimulatedPlayback(index);
      }
    },
    [startSimulatedPlayback],
  );

  // Auto-advance when a video ends
  useEffect(() => {
    if (!videoEnded || selectedVideoIndex === null) return;
    const idx = selectedVideoIndex;
    if (idx >= VIDEOS.length - 1) {
      setShowFinalCTA(true);
      return;
    }
    const timer = setTimeout(() => {
      if (alive.current) openVideo(idx + 1, true);
    }, 500);
    return () => clearTimeout(timer);
  }, [videoEnded, selectedVideoIndex, openVideo]);

  const closeVideo = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setSelectedVideoIndex(null);
    setIsPlaying(false);
    setVideoEnded(false);
    setCurrentTime(0);
    setVideoDuration(0);
    currentTimeRef.current = 0;
  }, []);

  const handlePlayPause = useCallback(() => {
    setIsPlaying((prev) => {
      const next = !prev;
      if (!next && intervalRef.current) clearInterval(intervalRef.current);
      if (next) {
        const idx = selectedVideoIndexRef.current;
        if (idx !== null && !VIDEOS[idx].videoSrc) startSimulatedPlayback(idx);
      }
      return next;
    });
  }, [startSimulatedPlayback]);

  const handleTimeUpdate = useCallback((t: number) => setCurrentTime(t), []);

  const handleDurationChange = useCallback(
    (d: number) => setVideoDuration(d),
    [],
  );

  // Called by real <video> onEnded
  const handleVideoEnded = useCallback(() => {
    if (!alive.current) return;
    const idx = selectedVideoIndexRef.current;
    if (idx === null) return;
    const vid = VIDEOS[idx];
    setIsPlaying(false);
    setVideoEnded(true);
    setWatchedVideoIds((p) => (p.includes(vid.id) ? p : [...p, vid.id]));
  }, []);

  const handleContinueInvestigation = useCallback(() => {
    if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
    setIsTransitioning(true);
    setTimeout(() => router.push("/livro"), 500);
  }, [router]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeVideo();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [closeVideo]);

  const allWatched = watchedVideoIds.length === VIDEOS.length;
  const currentVideo =
    selectedVideoIndex !== null ? VIDEOS[selectedVideoIndex] : null;
  const effectiveDuration = videoDuration || (currentVideo?.duration ?? 0);

  return (
    <main
      className="w-full max-w-[100vw] overflow-x-hidden bg-black"
      style={{ minHeight: "100dvh", fontFamily: FONT }}
    >
      <div
        className="relative mx-auto flex w-full max-w-[430px] flex-col bg-black"
        style={{ minHeight: "100dvh" }}
      >
        {/* Header */}
        <header
          className="sticky top-0 z-10 flex flex-shrink-0 items-center justify-between px-4 py-3"
          style={{
            backgroundColor: "#121212",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <button
            onClick={() => router.back()}
            aria-label="Voltar"
            className="flex min-h-[44px] min-w-[44px] items-center justify-center focus:outline-none"
            style={{ color: "#FFFFFF" }}
          >
            <ChevronLeft style={{ width: 24, height: 24 }} aria-hidden="true" />
          </button>
          <span style={{ fontSize: 17, fontWeight: 600, color: "#FFFFFF" }}>
            Perfil secreto
          </span>
          <button
            aria-label="Mais opções"
            className="flex min-h-[44px] min-w-[44px] items-center justify-center focus:outline-none"
            style={{ color: "#A1A1AA" }}
          >
            <MoreVertical
              style={{ width: 22, height: 22 }}
              aria-hidden="true"
            />
          </button>
        </header>

        {/* Profile info */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="px-5 py-6"
        >
          <div className="mb-5 flex items-center gap-5">
            <div
              className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-full"
              style={{
                background: "linear-gradient(135deg, #25F4EE 0%, #FE2C55 100%)",
              }}
              aria-hidden="true"
            >
              <Eye
                style={{ width: 32, height: 32, color: "#FFFFFF" }}
                aria-hidden="true"
              />
            </div>
            <div className="flex flex-col gap-1">
              <p style={{ fontSize: 17, fontWeight: 700, color: "#FFFFFF" }}>
                @investigador.resistente
              </p>
              <div className="flex items-center gap-4">
                <div className="flex flex-col items-center">
                  <span
                    style={{ fontSize: 16, fontWeight: 700, color: "#FFFFFF" }}
                  >
                    4.321
                  </span>
                  <span style={{ fontSize: 12, color: "#A1A1AA" }}>
                    seguidores
                  </span>
                </div>
                <div className="flex flex-col items-center">
                  <span
                    style={{ fontSize: 16, fontWeight: 700, color: "#FFFFFF" }}
                  >
                    5
                  </span>
                  <span style={{ fontSize: 12, color: "#A1A1AA" }}>vídeos</span>
                </div>
              </div>
            </div>
          </div>

          <p
            className="mb-4 break-words hyphens-auto"
            style={{ fontSize: 15, color: "#E9EDEF", lineHeight: 1.55 }}
          >
            A raiz foi encontrada.{"\n"}A investigação continua.
          </p>

          <button
            onClick={
              allWatched ? handleContinueInvestigation : () => openVideo(0)
            }
            aria-label={
              allWatched
                ? "Continuar investigação no livro"
                : "Abrir primeiro vídeo"
            }
            className="mb-3 flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg font-medium transition-opacity active:opacity-75 focus:outline-none focus:ring-2 focus:ring-white/20"
            style={{
              backgroundColor: "#181818",
              border: "1px solid rgba(255,255,255,0.12)",
              fontSize: 14,
              color: "#FFFFFF",
            }}
          >
            <BookOpen
              style={{ width: 15, height: 15, color: "#25F4EE" }}
              aria-hidden="true"
            />
            📖 Continuar investigação
          </button>

          {watchedVideoIds.length > 0 && (
            <div className="flex items-center gap-2">
              <div
                className="h-1 flex-1 overflow-hidden rounded-full"
                style={{ backgroundColor: "#2A2A2A" }}
                role="progressbar"
                aria-valuenow={watchedVideoIds.length}
                aria-valuemin={0}
                aria-valuemax={VIDEOS.length}
                aria-label={`${watchedVideoIds.length} de ${VIDEOS.length} vídeos assistidos`}
              >
                <motion.div
                  className="h-full rounded-full"
                  initial={{ width: 0 }}
                  animate={{
                    width: `${(watchedVideoIds.length / VIDEOS.length) * 100}%`,
                  }}
                  transition={{ duration: 0.5 }}
                  style={{
                    background:
                      "linear-gradient(90deg, #25F4EE 0%, #FE2C55 100%)",
                  }}
                />
              </div>
              <span style={{ fontSize: 12, color: "#A1A1AA" }}>
                {watchedVideoIds.length}/{VIDEOS.length}
              </span>
            </div>
          )}
        </motion.div>

        {/* Tab divider */}
        <div style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <div
            className="px-5 py-2 text-center"
            style={{
              borderBottom: "2px solid #FFFFFF",
              fontSize: 13,
              color: "#FFFFFF",
              fontWeight: 600,
            }}
          >
            Vídeos
          </div>
        </div>

        {/* Video grid */}
        <div className="grid grid-cols-3 gap-[2px] bg-black p-[2px]">
          {VIDEOS.map((video, index) => {
            const locked = index > 0;
            const watched = watchedVideoIds.includes(video.id);
            return (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.08 }}
                className="relative overflow-hidden"
                style={{ aspectRatio: "9/16" }}
              >
                <button
                  onClick={() => !locked && openVideo(index)}
                  disabled={locked}
                  aria-label={
                    locked
                      ? `Vídeo bloqueado: ${video.title}`
                      : `Abrir vídeo: ${video.title}`
                  }
                  aria-disabled={locked}
                  className="absolute inset-0 w-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white/30"
                  style={{ cursor: locked ? "default" : "pointer" }}
                >
                  <div
                    className="absolute inset-0"
                    style={{
                      background: THUMB_BG[index],
                      opacity: locked ? 0.4 : 1,
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center p-2">
                    <p
                      className="break-words hyphens-auto text-center"
                      style={{
                        fontSize: 9,
                        fontWeight: 800,
                        color: locked ? "rgba(255,255,255,0.3)" : "#FFFFFF",
                        textShadow: "0 1px 4px rgba(0,0,0,0.9)",
                        lineHeight: 1.2,
                        textTransform: "uppercase",
                      }}
                    >
                      {video.thumbnailText}
                    </p>
                  </div>
                  {locked && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Lock
                        style={{
                          width: 20,
                          height: 20,
                          color: "rgba(255,255,255,0.45)",
                        }}
                        aria-hidden="true"
                      />
                    </div>
                  )}
                  <div
                    className="pointer-events-none absolute inset-x-0 bottom-0 h-10"
                    style={{
                      background:
                        "linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)",
                    }}
                    aria-hidden="true"
                  />
                  {!locked && (
                    <>
                      <div className="absolute bottom-1 right-1">
                        <span
                          style={{
                            fontSize: 10,
                            color: "rgba(255,255,255,0.75)",
                          }}
                        >
                          {formatTime(video.duration)}
                        </span>
                      </div>
                      <div className="absolute bottom-1 left-1">
                        <Play
                          style={{
                            width: 13,
                            height: 13,
                            color: "rgba(255,255,255,0.7)",
                          }}
                          aria-hidden="true"
                        />
                      </div>
                    </>
                  )}
                  {watched && (
                    <div
                      className="absolute right-1 top-1 flex items-center justify-center rounded-full"
                      style={{
                        width: 18,
                        height: 18,
                        backgroundColor: "#25F4EE",
                      }}
                      aria-label="Assistido"
                    >
                      <Eye
                        style={{ width: 10, height: 10, color: "#000" }}
                        aria-hidden="true"
                      />
                    </div>
                  )}
                </button>
              </motion.div>
            );
          })}
        </div>

        {/* All-watched CTA */}
        {allWatched && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="m-4 rounded-2xl p-5 text-center"
            style={{
              backgroundColor: "#181818",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <p
              style={{
                fontSize: 16,
                color: "#E9EDEF",
                marginBottom: 14,
                lineHeight: 1.55,
              }}
            >
              A investigação continua no livro.
            </p>
            <button
              onClick={handleContinueInvestigation}
              aria-label="Continuar investigação no livro"
              className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl font-bold text-black transition-opacity active:opacity-80 focus:outline-none focus:ring-2 focus:ring-white/20"
              style={{ backgroundColor: "#FFFFFF", fontSize: 15 }}
            >
              📖 CONTINUAR INVESTIGAÇÃO
              <ArrowRight
                style={{ width: 18, height: 18 }}
                aria-hidden="true"
              />
            </button>
          </motion.div>
        )}
      </div>

      {/* ── Video viewer (full-screen, slides between videos) ── */}
      {selectedVideoIndex !== null && currentVideo && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black">
          <AnimatePresence mode="sync">
            <motion.div
              key={selectedVideoIndex}
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "-100%" }}
              transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
              className="absolute inset-0"
            >
              <VideoViewer
                video={currentVideo}
                videoIndex={selectedVideoIndex}
                videoSrc={currentVideo.videoSrc}
                currentTime={currentTime}
                videoDuration={effectiveDuration}
                isPlaying={isPlaying}
                onClose={closeVideo}
                onPlayPause={handlePlayPause}
                onTimeUpdate={handleTimeUpdate}
                onDurationChange={handleDurationChange}
                onEnded={handleVideoEnded}
              />
            </motion.div>
          </AnimatePresence>
        </div>
      )}

      {/* ── Final CTA — blocks everything after last video ── */}
      <AnimatePresence>
        {showFinalCTA && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="fixed inset-0 z-[55] flex flex-col items-center justify-center gap-8 px-8 text-center"
            style={{ backgroundColor: "rgba(0,0,0,0.97)", fontFamily: FONT }}
          >
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="flex flex-col items-center gap-5"
            >
              <div
                className="flex h-16 w-16 items-center justify-center rounded-full"
                style={{
                  background:
                    "linear-gradient(135deg, #25F4EE 0%, #FE2C55 100%)",
                }}
                aria-hidden="true"
              >
                <Eye
                  style={{ width: 28, height: 28, color: "#FFFFFF" }}
                  aria-hidden="true"
                />
              </div>
              <p
                className="break-words hyphens-auto"
                style={{
                  fontSize: "clamp(22px, 5.5vw, 28px)",
                  fontWeight: 800,
                  color: "#FFFFFF",
                  lineHeight: 1.3,
                }}
              >
                Você chegou ao fim da investigação.
              </p>
              <p
                style={{
                  fontSize: 17,
                  color: "#A1A1AA",
                  lineHeight: 1.6,
                  maxWidth: 320,
                }}
              >
                A resposta está no livro.
              </p>
            </motion.div>
            <motion.button
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7, duration: 0.4 }}
              onClick={handleContinueInvestigation}
              aria-label="Descobrir o restante da investigação no livro"
              className="flex min-h-[56px] w-full max-w-[320px] items-center justify-center gap-3 rounded-2xl font-bold text-black transition-opacity active:opacity-80 focus:outline-none focus:ring-2 focus:ring-white/20"
              style={{ backgroundColor: "#FFFFFF", fontSize: 16 }}
            >
              📖 QUERO DESCOBRIR O RESTO
              <ArrowRight
                style={{ width: 20, height: 20 }}
                aria-hidden="true"
              />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Route transition overlay ── */}
      <AnimatePresence>
        {isTransitioning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-black"
            aria-live="assertive"
            aria-atomic="true"
            aria-label="Abrindo investigação final"
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
              <BookOpen
                style={{ width: 52, height: 52, color: "#25F4EE" }}
                aria-hidden="true"
              />
            </motion.div>
            <p style={{ fontSize: 17, color: "#FFFFFF", fontFamily: FONT }}>
              Abrindo investigação final...
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

// ─── VideoViewer ──────────────────────────────────────────────────────────────

interface VideoViewerProps {
  video: SecretVideo;
  videoIndex: number;
  videoSrc?: string;
  currentTime: number;
  videoDuration: number;
  isPlaying: boolean;
  onClose: () => void;
  onPlayPause: () => void;
  onTimeUpdate: (t: number) => void;
  onDurationChange: (d: number) => void;
  onEnded: () => void;
}

function VideoViewer({
  video,
  videoIndex,
  videoSrc,
  currentTime,
  videoDuration,
  isPlaying,
  onClose,
  onPlayPause,
  onTimeUpdate,
  onDurationChange,
  onEnded,
}: VideoViewerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const segment = getCurrentSegment(video, currentTime);
  const progress =
    videoDuration > 0 ? Math.min((currentTime / videoDuration) * 100, 100) : 0;

  // Sync parent isPlaying → real video element
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    if (isPlaying) {
      el.play().catch(() => {});
    } else {
      el.pause();
    }
  }, [isPlaying]);

  const RIGHT_ACTIONS = [
    {
      icon: <Heart style={{ width: 28, height: 28 }} />,
      count: "842",
      label: "Curtir",
    },
    {
      icon: <MessageCircle style={{ width: 28, height: 28 }} />,
      count: "91",
      label: "Comentar",
    },
    {
      icon: <Share2 style={{ width: 28, height: 28 }} />,
      count: "37",
      label: "Compartilhar",
    },
  ];

  return (
    <div
      className="relative h-full w-full bg-black"
      style={{ fontFamily: FONT }}
    >
      {/* Background: real video or simulated */}
      {videoSrc ? (
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-cover"
          playsInline
          autoPlay
          muted={false}
          onTimeUpdate={(e) => onTimeUpdate(e.currentTarget.currentTime)}
          onLoadedMetadata={(e) => onDurationChange(e.currentTarget.duration)}
          onEnded={onEnded}
          aria-hidden="true"
        >
          <source src={videoSrc} type="video/webm" />
        </video>
      ) : (
        <>
          <div
            className="absolute inset-0"
            style={{ background: SIM_BG[videoIndex] }}
            aria-hidden="true"
          />
          <motion.div
            className="pointer-events-none absolute inset-0"
            animate={{ opacity: [0.04, 0.07, 0.04] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            style={{
              backgroundImage: GRAIN,
              backgroundRepeat: "repeat",
              backgroundSize: "300px 300px",
            }}
            aria-hidden="true"
          />
          {!segment.text && (
            <div
              className="pointer-events-none absolute inset-0 flex items-center justify-center"
              aria-hidden="true"
            >
              <motion.div
                animate={{ scale: [1, 1.06, 1], opacity: [0.1, 0.2, 0.1] }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <Eye
                  style={{ width: 90, height: 90, color: "#FFFFFF" }}
                  aria-hidden="true"
                />
              </motion.div>
            </div>
          )}
        </>
      )}

      {/* Readability gradient */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.1) 40%, rgba(0,0,0,0.3) 100%)",
        }}
        aria-hidden="true"
      />

      {/* Large overlay text */}
      <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-center px-8 pt-20">
        <AnimatePresence mode="wait">
          {segment.text && (
            <motion.p
              key={segment.text}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.3 }}
              className="break-words hyphens-auto text-center"
              style={{
                fontSize: "clamp(24px, 6vw, 36px)",
                fontWeight: 800,
                color: "#FFFFFF",
                textShadow:
                  "0 2px 16px rgba(0,0,0,0.95), 0 0 60px rgba(0,0,0,0.7)",
                textTransform: "uppercase",
                lineHeight: 1.15,
                maxWidth: 340,
              }}
            >
              {segment.text}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Close button */}
      <button
        onClick={onClose}
        aria-label="Fechar vídeo"
        className="absolute left-4 top-12 z-10 flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-white/30"
        style={{ backgroundColor: "rgba(0,0,0,0.55)" }}
      >
        <X
          style={{ width: 20, height: 20, color: "#FFFFFF" }}
          aria-hidden="true"
        />
      </button>

      {/* Right action bar */}
      <div className="absolute bottom-28 right-3 z-10 flex flex-col items-center gap-5">
        {RIGHT_ACTIONS.map(({ icon, count, label }) => (
          <div key={label} className="flex flex-col items-center gap-1">
            <button
              aria-label={label}
              className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-white/20"
              style={{ color: "#FFFFFF" }}
            >
              {icon}
            </button>
            <span style={{ fontSize: 12, color: "#FFFFFF", fontWeight: 600 }}>
              {count}
            </span>
          </div>
        ))}
      </div>

      {/* Bottom area */}
      <div className="absolute inset-x-0 bottom-0 z-10 px-4 pb-4">
        {/* Caption */}
        <div
          className="mb-3 max-w-[75%] rounded-xl px-3 py-2"
          style={{ backgroundColor: "rgba(0,0,0,0.65)" }}
          aria-live="polite"
          aria-atomic="true"
        >
          <AnimatePresence mode="wait">
            <motion.p
              key={segment.audio}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="break-words hyphens-auto"
              style={{ fontSize: 14, color: "#FFFFFF", lineHeight: 1.45 }}
            >
              {segment.audio}
            </motion.p>
          </AnimatePresence>
        </div>

        <p
          style={{
            fontSize: 14,
            fontWeight: 700,
            color: "#FFFFFF",
            marginBottom: 2,
          }}
        >
          @investigador.resistente
        </p>
        <p
          className="break-words hyphens-auto"
          style={{ fontSize: 13, color: "#E9EDEF", marginBottom: 4 }}
        >
          {video.title}
        </p>
        <p style={{ fontSize: 12, color: "#A1A1AA", marginBottom: 10 }}>
          #investigação #raiz #resistentes
        </p>

        {/* Controls row */}
        <div className="mb-2 flex items-center gap-3">
          <button
            onClick={onPlayPause}
            aria-label={isPlaying ? "Pausar vídeo" : "Reproduzir vídeo"}
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-white/30"
            style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
          >
            {isPlaying ? (
              <Pause
                style={{ width: 18, height: 18, color: "#FFFFFF" }}
                aria-hidden="true"
              />
            ) : (
              <Play
                style={{
                  width: 18,
                  height: 18,
                  color: "#FFFFFF",
                  marginLeft: 2,
                }}
                aria-hidden="true"
              />
            )}
          </button>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}>
            {formatTime(Math.floor(currentTime))} /{" "}
            {formatTime(Math.floor(videoDuration))}
          </span>
          <Volume2
            style={{
              width: 16,
              height: 16,
              color: "rgba(255,255,255,0.45)",
              marginLeft: "auto",
            }}
            aria-hidden="true"
          />
        </div>

        {/* Progress bar */}
        <div
          className="h-[3px] w-full overflow-hidden rounded-full"
          style={{ backgroundColor: "rgba(255,255,255,0.18)" }}
          role="progressbar"
          aria-valuenow={Math.round(progress)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Progresso do vídeo: ${Math.round(progress)}%`}
        >
          <div
            className="h-full rounded-full transition-[width] duration-100"
            style={{
              width: `${progress}%`,
              background: "linear-gradient(90deg, #25F4EE 0%, #FE2C55 100%)",
            }}
          />
        </div>
      </div>
    </div>
  );
}
