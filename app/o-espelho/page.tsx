"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ChevronLeft, Eye, Lock } from "lucide-react";

// ─── Data ─────────────────────────────────────────────────────────────────────

const QUESTIONS = [
  "Você já mentiu?",
  "Você já enganou alguém para obter alguma vantagem?",
  "Você já deixou de fazer algo que sabia que era certo?",
  "Você já colocou os seus interesses acima dos interesses de outra pessoa?",
  "Você já fez algo que sabia que era errado?",
];

const REVEAL_LINES = [
  "Você passou toda a investigação procurando monstros.",
  "Mas encontrou um espelho.",
  "O seu maior inimigo estava escondido no último lugar onde você procuraria.",
  "Dentro de você.",
];

const REVEAL_DELAYS = [200, 1800, 2400, 2000];

const REFLECTION_LINES = [
  "Os mesmos impulsos que produzem corrupção, mentira, egoísmo e violência em grande escala também existem em versões menores dentro de cada um de nós.",
  "A diferença nem sempre está na natureza.",
  "Muitas vezes está apenas na oportunidade.",
];

// Telegram dark palette
const TG = {
  bg: "#17212B",
  surface: "#1E2C3A",
  surfaceAlt: "#232E3C",
  border: "rgba(255,255,255,0.06)",
  blue: "#5BA4CF",
  blueHover: "#4A93BE",
  textPrimary: "#FFFFFF",
  textSecondary: "#8E9BA7",
  textMuted: "#4A6478",
  sent: "#2B5278",
};

const FONT = "Inter, -apple-system, sans-serif";

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function OEspelhoPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [phase, setPhase] = useState<
    "intro" | "questions" | "reveal" | "reflection"
  >("intro");
  const [revealStep, setRevealStep] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Reveal auto-advance
  useEffect(() => {
    if (phase !== "reveal") return;
    const delay = REVEAL_DELAYS[revealStep] ?? 2000;
    const t = setTimeout(() => {
      setRevealStep((s) => {
        const next = s + 1;
        if (next >= REVEAL_LINES.length) {
          setTimeout(() => setPhase("reflection"), 1400);
        }
        return next;
      });
    }, delay);
    return () => clearTimeout(t);
  }, [phase, revealStep]);

  const handleContinue = useCallback(() => {
    setPhase("questions");
    setStep(0);
  }, []);

  const handleNext = useCallback(() => {
    if (step < QUESTIONS.length - 1) {
      setStep((s) => s + 1);
    } else {
      setPhase("reveal");
      setRevealStep(0);
    }
  }, [step]);

  const handleOpenStory = useCallback(() => {
    setIsTransitioning(true);
    setTimeout(() => router.push("/perfil-secreto"), 800);
  }, [router]);

  return (
    <div
      className="relative flex min-h-dvh w-full max-w-[100vw] flex-col overflow-x-hidden"
      style={{ backgroundColor: TG.bg, fontFamily: FONT }}
    >
      {/* Telegram-style header */}
      <header
        className="sticky top-0 z-20 flex flex-shrink-0 items-center gap-3 px-2 py-2"
        style={{
          backgroundColor: TG.surface,
          borderBottom: `1px solid ${TG.border}`,
        }}
      >
        <button
          onClick={() => router.back()}
          aria-label="Voltar"
          className="flex min-h-[44px] min-w-[40px] items-center justify-center focus:outline-none"
          style={{ color: TG.blue }}
        >
          <ChevronLeft style={{ width: 24, height: 24 }} aria-hidden="true" />
        </button>

        {/* Avatar */}
        <div
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full"
          style={{ backgroundColor: TG.sent }}
          aria-hidden="true"
        >
          <Eye
            style={{ width: 16, height: 16, color: TG.blue }}
            aria-hidden="true"
          />
        </div>

        <div className="flex flex-1 flex-col justify-center overflow-hidden">
          <span
            className="truncate"
            style={{ fontSize: 16, fontWeight: 600, color: TG.textPrimary }}
          >
            O Espelho
          </span>
          <span style={{ fontSize: 13, color: TG.textSecondary }}>
            Investigação particular
          </span>
        </div>

        <Lock
          style={{ width: 16, height: 16, color: TG.textMuted, marginRight: 8 }}
          aria-hidden="true"
        />
      </header>

      {/* Content */}
      <main className="flex flex-1 items-center justify-center px-5 py-12">
        <div className="w-full max-w-[700px]">
          <AnimatePresence mode="wait">
            {phase === "intro" && (
              <IntroScreen key="intro" onContinue={handleContinue} />
            )}
            {phase === "questions" && (
              <QuestionScreen
                key={`q-${step}`}
                question={QUESTIONS[step]}
                index={step}
                total={QUESTIONS.length}
                onNext={handleNext}
              />
            )}
            {phase === "reveal" && (
              <RevealScreen key="reveal" revealStep={revealStep} />
            )}
            {phase === "reflection" && (
              <ReflectionScreen
                key="reflection"
                onOpenStory={handleOpenStory}
              />
            )}
          </AnimatePresence>
        </div>
      </main>

      <AnimatePresence>
        {isTransitioning && <TransitionOverlay key="overlay" />}
      </AnimatePresence>
    </div>
  );
}

// ─── IntroScreen ──────────────────────────────────────────────────────────────

function IntroScreen({ onContinue }: { onContinue: () => void }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.4 }}
      className="flex w-full flex-col items-center gap-10 text-center"
      aria-label="Introdução"
    >
      {/* Card */}
      <div
        className="w-full rounded-2xl p-8"
        style={{
          backgroundColor: TG.surface,
          border: `1px solid ${TG.border}`,
        }}
      >
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          style={{
            fontSize: 13,
            color: TG.blue,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            marginBottom: 16,
          }}
        >
          Antes de continuar...
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="break-words hyphens-auto"
          style={{
            fontSize: "clamp(24px, 4.5vw, 40px)",
            fontWeight: 500,
            color: TG.textPrimary,
            lineHeight: 1.3,
            marginBottom: 28,
          }}
        >
          Existe uma última etapa da investigação.
        </motion.h1>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.85, duration: 0.5 }}
          className="flex flex-col gap-2 text-left"
          style={{
            borderLeft: `2px solid ${TG.blue}`,
            paddingLeft: 16,
          }}
        >
          {[
            "Não responda em voz alta.",
            "Não responda para ninguém.",
            "Apenas responda para si mesmo.",
          ].map((line, i) => (
            <p
              key={i}
              style={{ fontSize: 17, color: TG.textSecondary, lineHeight: 1.6 }}
            >
              {line}
            </p>
          ))}
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.4, duration: 0.4 }}
      >
        <button
          onClick={onContinue}
          aria-label="Continuar para as perguntas"
          className="group flex min-h-[52px] items-center gap-3 rounded-xl px-8 font-semibold text-white transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2"
          style={
            {
              backgroundColor: TG.blue,
              fontSize: 16,
              focusRingColor: TG.blue,
            } as React.CSSProperties
          }
        >
          Continuar
          <ArrowRight
            className="transition-transform group-hover:translate-x-1"
            style={{ width: 18, height: 18 }}
            aria-hidden="true"
          />
        </button>
      </motion.div>
    </motion.section>
  );
}

// ─── QuestionScreen ───────────────────────────────────────────────────────────

function QuestionScreen({
  question,
  index,
  total,
  onNext,
}: {
  question: string;
  index: number;
  total: number;
  onNext: () => void;
}) {
  const isLast = index === total - 1;

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3 }}
      className="flex w-full flex-col items-center gap-12 text-center"
      aria-live="polite"
      aria-label={`Pergunta ${index + 1} de ${total}`}
    >
      {/* Progress dots */}
      <div className="flex items-center gap-2">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className="rounded-full transition-all duration-300"
            style={{
              width: i === index ? 20 : 6,
              height: 6,
              backgroundColor: i <= index ? TG.blue : TG.textMuted,
            }}
          />
        ))}
      </div>

      {/* Question card */}
      <div
        className="w-full rounded-2xl px-8 py-10"
        style={{
          backgroundColor: TG.surface,
          border: `1px solid ${TG.border}`,
        }}
      >
        <p
          style={{
            fontSize: 13,
            color: TG.textMuted,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            marginBottom: 20,
          }}
        >
          Pergunta {index + 1} de {total}
        </p>

        <h2
          className="break-words hyphens-auto"
          style={{
            fontSize: "clamp(26px, 5vw, 40px)",
            fontWeight: 500,
            color: TG.textPrimary,
            lineHeight: 1.3,
          }}
        >
          {question}
        </h2>

        <p
          style={{
            fontSize: 14,
            color: TG.textMuted,
            marginTop: 24,
            letterSpacing: "0.06em",
          }}
        >
          — Pense por um momento —
        </p>
      </div>

      {/* Button */}
      <button
        onClick={onNext}
        aria-label={isLast ? "Finalizar perguntas" : "Próxima pergunta"}
        className="group flex min-h-[52px] items-center gap-3 rounded-xl px-8 font-semibold text-white transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2"
        style={{ backgroundColor: TG.blue, fontSize: 16 }}
      >
        {isLast ? "Concluir" : "Próxima pergunta"}
        <ArrowRight
          className="transition-transform group-hover:translate-x-1"
          style={{ width: 18, height: 18 }}
          aria-hidden="true"
        />
      </button>
    </motion.section>
  );
}

// ─── RevealScreen ─────────────────────────────────────────────────────────────

function RevealScreen({ revealStep }: { revealStep: number }) {
  const visibleLines = REVEAL_LINES.slice(0, revealStep);

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="flex w-full flex-col items-center gap-10 text-center"
      aria-live="polite"
      aria-label="Revelação"
    >
      <Eye
        style={{ width: 32, height: 32, color: TG.textMuted }}
        aria-hidden="true"
      />

      <div className="flex flex-col items-center gap-7">
        <AnimatePresence initial={false}>
          {visibleLines.map((line, i) => {
            const isFinalLine = i === REVEAL_LINES.length - 1;
            return (
              <motion.p
                key={i}
                initial={
                  isFinalLine
                    ? { opacity: 0, scale: 0.97, filter: "blur(8px)" }
                    : { opacity: 0, scale: 0.98 }
                }
                animate={
                  isFinalLine
                    ? { opacity: 1, scale: 1, filter: "blur(0px)" }
                    : { opacity: 1, scale: 1 }
                }
                transition={{
                  duration: isFinalLine ? 1.0 : 0.6,
                  ease: "easeOut",
                }}
                className="break-words hyphens-auto"
                style={{
                  fontSize: isFinalLine
                    ? "clamp(34px, 6vw, 54px)"
                    : "clamp(20px, 3.5vw, 32px)",
                  fontWeight: isFinalLine ? 600 : 400,
                  color: isFinalLine ? TG.textPrimary : TG.textSecondary,
                  lineHeight: 1.25,
                  maxWidth: 680,
                  ...(isFinalLine && {
                    background: `linear-gradient(135deg, #FFFFFF 60%, ${TG.blue})`,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }),
                }}
              >
                {line}
              </motion.p>
            );
          })}
        </AnimatePresence>
      </div>
    </motion.section>
  );
}

// ─── ReflectionScreen ─────────────────────────────────────────────────────────

function ReflectionScreen({ onOpenStory }: { onOpenStory: () => void }) {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="flex w-full flex-col items-center gap-10 text-center"
      aria-label="Reflexão"
    >
      {/* Reflection card */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full rounded-2xl p-8"
        style={{
          backgroundColor: TG.surface,
          border: `1px solid ${TG.border}`,
        }}
      >
        <div
          className="flex flex-col gap-5"
          style={{ maxWidth: 620, margin: "0 auto" }}
        >
          {REFLECTION_LINES.map((line, i) => (
            <motion.p
              key={i}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.35, duration: 0.5 }}
              className="break-words hyphens-auto"
              style={{
                fontSize: 18,
                fontWeight: 400,
                lineHeight: 1.7,
                color: i === 0 ? TG.textPrimary : TG.textSecondary,
              }}
            >
              {line}
            </motion.p>
          ))}
        </div>
      </motion.div>

      {/* Pause / closing lines */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.5 }}
        className="flex flex-col items-center gap-3"
        style={{
          borderTop: `1px solid ${TG.border}`,
          paddingTop: 36,
          maxWidth: 520,
          width: "100%",
        }}
      >
        <p style={{ fontSize: 17, color: TG.textMuted, lineHeight: 1.6 }}>
          Essa descoberta não trouxe desespero.
        </p>
        <p style={{ fontSize: 17, color: TG.textMuted }}>
          Trouxe uma pergunta.
        </p>
        <p
          className="break-words hyphens-auto"
          style={{
            fontSize: "clamp(22px, 4vw, 32px)",
            fontWeight: 500,
            color: TG.textPrimary,
            lineHeight: 1.35,
            marginTop: 16,
          }}
        >
          Existe esperança para alguém assim?
        </p>
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.9, duration: 0.4 }}
      >
        <button
          onClick={onOpenStory}
          aria-label="Ouvir a história do investigador"
          className="group flex min-h-[52px] items-center gap-3 rounded-xl px-8 font-semibold text-white transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2"
          style={{ backgroundColor: TG.blue, fontSize: 16 }}
        >
          Ouvir a história do investigador
          <ArrowRight
            className="transition-transform group-hover:translate-x-1"
            style={{ width: 18, height: 18 }}
            aria-hidden="true"
          />
        </button>
      </motion.div>
    </motion.section>
  );
}

// ─── TransitionOverlay ────────────────────────────────────────────────────────

function TransitionOverlay() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-50"
      style={{ backgroundColor: TG.bg }}
      aria-hidden="true"
    />
  );
}
