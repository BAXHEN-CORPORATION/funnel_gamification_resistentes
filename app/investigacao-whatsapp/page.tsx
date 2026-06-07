"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, AlertTriangle, FileText } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Sender = "investigator" | "user";

interface BaseMessage {
  id: string;
  sender: Sender;
  timestamp: string;
}

interface TextMessage extends BaseMessage {
  kind: "text";
  text: string;
}

interface EvidenceMessage extends BaseMessage {
  kind: "evidence";
  caseNumber: number;
  title: string;
  body: string;
}

interface QuestionMessage extends BaseMessage {
  kind: "question";
  text: string;
  options: string[];
}

interface CtaMessage extends BaseMessage {
  kind: "cta";
}

type Message = TextMessage | EvidenceMessage | QuestionMessage | CtaMessage;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

function getCurrentTime(): string {
  const d = new Date();
  return `${d.getHours()}:${String(d.getMinutes()).padStart(2, "0")}`;
}

let _uid = 0;
const uid = () => String(++_uid);

const FONT =
  '-apple-system, BlinkMacSystemFont, "Helvetica Neue", sans-serif';

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function InvestigacaoWhatsappPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isWaitingForChoice, setIsWaitingForChoice] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [headerStatus, setHeaderStatus] = useState<"online" | "digitando">(
    "online",
  );

  const scrollAnchor = useRef<HTMLDivElement | null>(null);
  const resolverRef = useRef<((ans: string) => void) | null>(null);
  const alive = useRef(true);
  const hasRun = useRef(false);

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  const scrollBottom = useCallback(() => {
    scrollAnchor.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const push = useCallback(
    (msg: Message) => {
      setMessages((p) => [...p, msg]);
      setTimeout(scrollBottom, 60);
    },
    [scrollBottom],
  );

  const showTyping = useCallback(async (ms = 1300) => {
    if (!alive.current) return;
    setHeaderStatus("digitando");
    setIsTyping(true);
    await sleep(ms);
    if (!alive.current) return;
    setIsTyping(false);
    setHeaderStatus("online");
  }, []);

  const txt = useCallback(
    async (text: string, typMs = 1200) => {
      await showTyping(typMs);
      if (!alive.current) return;
      push({
        id: uid(),
        sender: "investigator",
        kind: "text",
        text,
        timestamp: getCurrentTime(),
      });
      await sleep(300);
    },
    [showTyping, push],
  );

  const evi = useCallback(
    async (caseNumber: number, title: string, body: string) => {
      await showTyping(1800);
      if (!alive.current) return;
      push({
        id: uid(),
        sender: "investigator",
        kind: "evidence",
        caseNumber,
        title,
        body,
        timestamp: getCurrentTime(),
      });
      await sleep(600);
    },
    [showTyping, push],
  );

  const ask = useCallback(
    async (text: string, options: string[]): Promise<string> => {
      await showTyping(1000);
      if (!alive.current) return "";
      push({
        id: uid(),
        sender: "investigator",
        kind: "question",
        text,
        options,
        timestamp: getCurrentTime(),
      });
      setIsWaitingForChoice(true);
      setTimeout(scrollBottom, 100);
      return new Promise<string>((res) => {
        resolverRef.current = res;
      });
    },
    [showTyping, push, scrollBottom],
  );

  const handleChoice = useCallback(
    (option: string) => {
      if (!resolverRef.current) return;
      resolverRef.current(option);
      resolverRef.current = null;
      setIsWaitingForChoice(false);
      push({
        id: uid(),
        sender: "user",
        kind: "text",
        text: option,
        timestamp: getCurrentTime(),
      });
    },
    [push],
  );

  const handleOpenFiles = useCallback(() => {
    if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
    setIsTransitioning(true);
    setTimeout(() => router.push("/arquivos-secretos"), 2000);
  }, [router]);

  // ── Sequence ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const run = async () => {
      await sleep(700);
      if (!alive.current) return;

      await txt("A ligação caiu de propósito.", 900);
      await txt("Não dava para explicar tudo por voz.", 1200);
      await txt("Os arquivos estão organizados aqui.", 1000);
      await txt("Você não vai investigar crimes isolados.", 1300);
      await txt("Vai investigar uma pergunta.", 900);
      await txt(
        "Por que seres humanos continuam fazendo o mal mesmo quando sabem que é errado?",
        2200,
      );

      await sleep(400);

      // Case 1
      await evi(
        1,
        "Mentira cotidiana",
        "Uma pessoa mente para proteger a própria imagem.\nNão há ameaça.\nNão há necessidade.\nEla apenas prefere parecer inocente a ser verdadeira.",
      );
      await ask("Quem é o culpado?", [
        "A pessoa",
        "A pressão social",
        "O medo da consequência",
      ]);
      await txt("Talvez.", 700);
      await txt("Mas repare: ela sabia a verdade.", 1100);
      await txt("E mesmo assim escolheu distorcê-la.", 1200);

      // Case 2
      await evi(
        2,
        "Indiferença",
        `Alguém vê uma pessoa precisando de ajuda.\nTem tempo.\nTem condição.\nMas passa reto.\nDepois justifica: "não era problema meu".`,
      );
      await ask("Quem é o culpado?", [
        "O egoísmo",
        "A sociedade",
        "A falta de empatia",
      ]);
      await txt("Você está chegando perto.", 1000);
      await txt("Mas ainda estamos olhando para fora.", 1200);

      // Case 3
      await evi(
        3,
        "Crueldade",
        "Uma pessoa humilha outra porque pode.\nNão ganha nada com isso.\nApenas sente prazer em diminuir alguém.",
      );
      await ask("De onde vem isso?", ["Trauma", "Maldade", "Ambiente"]);
      await txt("Esse é o ponto.", 700);
      await txt("As explicações ajudam.", 900);
      await txt("Mas não encerram a pergunta.", 1000);

      // Case 4
      await evi(
        4,
        "Corrupção",
        "Alguém recebe poder.\nPromete justiça.\nMas usa a posição para benefício próprio.\nAntes dizia odiar os corruptos.\nAgora age como eles.",
      );
      await ask("O poder corrompe?", ["Sim", "Não", "Ele revela"]);
      await txt("Guarde essa resposta.", 800);
      await txt("Talvez o poder não crie o problema.", 1300);
      await txt("Talvez apenas revele o que já estava escondido.", 1500);

      // Case 5
      await evi(
        5,
        "Violência",
        "Uma pessoa destrói outra em nome de uma causa.\nAcredita estar fazendo justiça.\nMas no caminho se torna aquilo que dizia combater.",
      );
      await ask("Qual é a origem?", ["Ideologia", "Ódio", "Algo mais profundo"]);

      await txt("Agora você está pronto para os arquivos completos.", 1600);
      await txt("Não são teorias.", 800);
      await txt("São relatos.", 700);
      await txt("Áudios.", 600);
      await txt("Confissões.", 700);
      await txt("E todos apontam para a mesma direção.", 1500);

      await sleep(800);
      if (!alive.current) return;
      push({
        id: uid(),
        sender: "investigator",
        kind: "cta",
        timestamp: getCurrentTime(),
      });
      setTimeout(scrollBottom, 100);
    };

    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Active question options
  const activeOptions = (() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].kind === "question")
        return (messages[i] as QuestionMessage).options;
    }
    return [];
  })();

  return (
    <main
      className="w-full max-w-[100vw] overflow-x-hidden bg-black"
      style={{ height: "100dvh" }}
    >
      <div
        className="relative mx-auto flex w-full max-w-[430px] flex-col overflow-hidden"
        style={{ height: "100dvh", maxHeight: 920, fontFamily: FONT }}
      >
        {/* Chat wallpaper */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{ backgroundColor: "#E5DDD5" }}
          aria-hidden="true"
        />

        {/* ── Header ── */}
        <header
          className="relative z-10 flex flex-shrink-0 items-center gap-1 px-1 py-1.5"
          style={{ backgroundColor: "#075E54" }}
        >
          <button
            onClick={() => router.back()}
            aria-label="Voltar"
            className="flex min-h-[44px] min-w-[36px] items-center justify-center focus:outline-none"
          >
            <span style={{ fontSize: 26, color: "#FFFFFF", lineHeight: 1 }}>
              ‹
            </span>
          </button>

          {/* Avatar */}
          <div
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full"
            style={{ backgroundColor: "#B2DFDB" }}
            aria-hidden="true"
          >
            <span
              style={{ fontSize: 16, fontWeight: 700, color: "#004D40" }}
            >
              I
            </span>
          </div>

          {/* Name + status */}
          <div className="flex flex-1 flex-col justify-center overflow-hidden px-1">
            <span
              className="truncate"
              style={{ fontSize: 17, fontWeight: 600, color: "#FFFFFF" }}
            >
              Investigador
            </span>
            <span
              style={{ fontSize: 13, color: "rgba(255,255,255,0.78)" }}
              aria-live="polite"
            >
              {headerStatus === "digitando" ? "digitando..." : "online"}
            </span>
          </div>

          {/* Action buttons */}
          {[
            { label: "Ligar", glyph: "📞" },
            { label: "Chamada de vídeo", glyph: "📹" },
            { label: "Mais opções", glyph: "⋮" },
          ].map(({ label, glyph }) => (
            <button
              key={label}
              aria-label={label}
              className="flex min-h-[44px] min-w-[44px] items-center justify-center focus:outline-none"
              style={{ color: "#FFFFFF", fontSize: 18 }}
            >
              {glyph}
            </button>
          ))}
        </header>

        {/* ── Messages ── */}
        <div
          className="relative z-10 flex-1 overflow-y-auto overflow-x-hidden px-2 py-3"
          aria-live="polite"
          aria-label="Conversa com Investigador"
          style={{ WebkitOverflowScrolling: "touch" } as React.CSSProperties}
        >
          {/* Date separator */}
          <div className="mb-4 flex justify-center" role="separator">
            <span
              className="rounded-md px-3 py-[3px]"
              style={{
                backgroundColor: "#D9EAD3",
                fontSize: 12,
                color: "#667781",
                boxShadow: "0 1px 1px rgba(0,0,0,0.08)",
              }}
            >
              HOJE
            </span>
          </div>

          {/* Message list */}
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={`mb-1.5 flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.kind === "text" && (
                  <TxtBubble msg={msg as TextMessage} />
                )}
                {msg.kind === "evidence" && (
                  <EviCard msg={msg as EvidenceMessage} />
                )}
                {msg.kind === "question" && (
                  <QBubble msg={msg as QuestionMessage} />
                )}
                {msg.kind === "cta" && (
                  <CtaBubble
                    msg={msg as CtaMessage}
                    onOpen={handleOpenFiles}
                  />
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing indicator */}
          <AnimatePresence>
            {isTyping && (
              <motion.div
                key="typing"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                transition={{ duration: 0.15 }}
                className="mb-1.5 flex justify-start"
                aria-live="polite"
                aria-label="Investigador está digitando"
              >
                <div
                  className="flex items-center gap-[5px] px-3 py-[10px]"
                  style={{
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #E5E5EA",
                    borderRadius: "4px 12px 12px 12px",
                    boxShadow: "0 1px 1px rgba(0,0,0,0.06)",
                  }}
                >
                  {[0, 1, 2].map((i) => (
                    <motion.span
                      key={i}
                      className="block rounded-full"
                      style={{
                        width: 8,
                        height: 8,
                        backgroundColor: "#667781",
                      }}
                      animate={{
                        opacity: [0.35, 1, 0.35],
                        scale: [0.8, 1.05, 0.8],
                      }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        delay: i * 0.3,
                      }}
                      aria-hidden="true"
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={scrollAnchor} />
        </div>

        {/* ── Choice buttons ── */}
        <AnimatePresence>
          {isWaitingForChoice && (
            <motion.div
              key="choices"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.25 }}
              className="relative z-10 flex flex-wrap justify-end gap-2 px-3 py-2"
              style={{ backgroundColor: "rgba(229,221,213,0.96)" }}
              role="group"
              aria-label="Escolha uma resposta"
            >
              {activeOptions.map((opt) => (
                <button
                  key={opt}
                  onClick={() => handleChoice(opt)}
                  aria-label={`Responder: ${opt}`}
                  className="min-h-[44px] rounded-full px-4 font-medium text-white transition-opacity active:opacity-75 focus:outline-none focus:ring-2 focus:ring-[#128C7E] focus:ring-offset-2"
                  style={{
                    backgroundColor: "#128C7E",
                    fontSize: 14,
                    fontFamily: FONT,
                    boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                  }}
                >
                  {opt}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Input bar ── */}
        <div
          className="relative z-10 flex flex-shrink-0 items-center gap-2 px-2 py-2"
          style={{ backgroundColor: "#F0F0F0", minHeight: 60 }}
        >
          <button
            aria-label="Anexar arquivo"
            aria-disabled="true"
            tabIndex={-1}
            className="flex min-h-[44px] min-w-[44px] items-center justify-center focus:outline-none"
            style={{ color: "#8E8E93", fontSize: 20 }}
          >
            📎
          </button>
          <div
            className="flex flex-1 items-center rounded-full px-4"
            style={{
              backgroundColor: "#FFFFFF",
              minHeight: 40,
              border: "none",
            }}
            role="textbox"
            aria-label="Campo de mensagem"
            aria-disabled="true"
          >
            <span style={{ fontSize: 16, color: "#8E8E93", fontFamily: FONT }}>
              {isWaitingForChoice ? "Escolha uma opção acima..." : "Mensagem"}
            </span>
          </div>
          <button
            aria-label="Gravar áudio"
            aria-disabled="true"
            tabIndex={-1}
            className="flex min-h-[44px] min-w-[44px] items-center justify-center focus:outline-none"
            style={{ color: "#8E8E93", fontSize: 20 }}
          >
            🎙
          </button>
        </div>
      </div>

      {/* ── Transition overlay ── */}
      <AnimatePresence>
        {isTransitioning && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black"
            aria-live="assertive"
            aria-atomic="true"
            aria-label="Abrindo grupo criptografado"
          >
            <Lock
              className="mb-4"
              style={{ width: 56, height: 56, color: "#128C7E" }}
              aria-hidden="true"
            />
            <p
              className="mb-6 text-center"
              style={{ fontSize: 17, color: "rgba(255,255,255,0.8)", fontFamily: FONT }}
            >
              Abrindo grupo criptografado...
            </p>
            <div className="flex gap-2">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="rounded-full"
                  style={{ width: 8, height: 8, backgroundColor: "#128C7E" }}
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

// ─── Sub-components ───────────────────────────────────────────────────────────

function TxtBubble({ msg }: { msg: TextMessage }) {
  const isUser = msg.sender === "user";
  return (
    <div
      className="relative max-w-[80%] break-words px-3 py-2 hyphens-auto"
      style={{
        backgroundColor: isUser ? "#DCF8C6" : "#FFFFFF",
        border: "1px solid #E5E5EA",
        borderRadius: isUser ? "12px 4px 12px 12px" : "4px 12px 12px 12px",
        boxShadow: "0 1px 1px rgba(0,0,0,0.06)",
        fontFamily: FONT,
      }}
    >
      <p
        style={{
          fontSize: 16,
          fontWeight: 400,
          lineHeight: 1.4,
          color: "#000000",
        }}
      >
        {msg.text}
      </p>
      <div className="mt-0.5 flex items-center justify-end gap-1">
        <span style={{ fontSize: 11, color: "#667781" }}>{msg.timestamp}</span>
        {isUser && (
          <span
            style={{ fontSize: 13, color: "#34B7F1", lineHeight: 1 }}
            aria-hidden="true"
          >
            ✓✓
          </span>
        )}
      </div>
    </div>
  );
}

function EviCard({ msg }: { msg: EvidenceMessage }) {
  return (
    <div
      className="max-w-[85%] overflow-hidden"
      style={{
        backgroundColor: "#FFFFFF",
        border: "1px solid #E5E5EA",
        borderRadius: "4px 12px 12px 12px",
        boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
        fontFamily: FONT,
      }}
      role="article"
      aria-label={`Caso ${msg.caseNumber}: ${msg.title}`}
    >
      <div
        className="flex items-center gap-2 px-3 py-2"
        style={{ backgroundColor: "#075E54" }}
      >
        <AlertTriangle
          style={{ width: 14, height: 14, color: "rgba(255,255,255,0.85)" }}
          aria-hidden="true"
        />
        <span
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: "#FFFFFF",
            letterSpacing: "0.05em",
          }}
        >
          CASO {msg.caseNumber}
        </span>
        <Lock
          style={{
            width: 12,
            height: 12,
            color: "rgba(255,255,255,0.6)",
            marginLeft: "auto",
          }}
          aria-hidden="true"
        />
      </div>
      <div className="px-3 py-3">
        <h3
          style={{
            fontSize: 14,
            fontWeight: 700,
            color: "#075E54",
            marginBottom: 6,
          }}
        >
          {msg.title}
        </h3>
        <p
          className="whitespace-pre-line break-words hyphens-auto"
          style={{ fontSize: 14, lineHeight: 1.55, color: "#333333" }}
        >
          {msg.body}
        </p>
        <div className="mt-2 flex justify-end">
          <span style={{ fontSize: 11, color: "#667781" }}>
            {msg.timestamp}
          </span>
        </div>
      </div>
    </div>
  );
}

function QBubble({ msg }: { msg: QuestionMessage }) {
  return (
    <div
      className="max-w-[80%] break-words px-3 py-2 hyphens-auto"
      style={{
        backgroundColor: "#FFFFFF",
        border: "1px solid #E5E5EA",
        borderRadius: "4px 12px 12px 12px",
        boxShadow: "0 1px 1px rgba(0,0,0,0.06)",
        fontFamily: FONT,
      }}
    >
      <p
        style={{
          fontSize: 16,
          fontWeight: 500,
          lineHeight: 1.4,
          color: "#111111",
        }}
      >
        {msg.text}
      </p>
      <div className="mt-0.5 flex justify-end">
        <span style={{ fontSize: 11, color: "#667781" }}>{msg.timestamp}</span>
      </div>
    </div>
  );
}

function CtaBubble({
  msg,
  onOpen,
}: {
  msg: CtaMessage;
  onOpen: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-[85%] overflow-hidden"
      style={{
        backgroundColor: "#FFFFFF",
        border: "1px solid #E5E5EA",
        borderRadius: "4px 12px 12px 12px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.12)",
        fontFamily: FONT,
      }}
    >
      <div
        className="flex items-center gap-2 px-3 py-2"
        style={{ backgroundColor: "#128C7E" }}
      >
        <FileText
          style={{ width: 14, height: 14, color: "#FFFFFF" }}
          aria-hidden="true"
        />
        <span
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: "#FFFFFF",
            letterSpacing: "0.05em",
          }}
        >
          ARQUIVOS SECRETOS
        </span>
      </div>
      <div className="px-3 py-3">
        <p
          style={{
            fontSize: 14,
            color: "#333333",
            marginBottom: 12,
            lineHeight: 1.5,
          }}
        >
          Acesso liberado. Toque para abrir o grupo criptografado.
        </p>
        <button
          onClick={onOpen}
          aria-label="Abrir grupo de arquivos secretos"
          className="w-full min-h-[44px] rounded-lg font-semibold text-white transition-opacity active:opacity-80 focus:outline-none focus:ring-2 focus:ring-[#128C7E] focus:ring-offset-2"
          style={{
            backgroundColor: "#128C7E",
            fontSize: 15,
            fontFamily: FONT,
          }}
        >
          Abrir grupo de arquivos secretos
        </button>
        <div className="mt-2 flex justify-end">
          <span style={{ fontSize: 11, color: "#667781" }}>
            {msg.timestamp}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
