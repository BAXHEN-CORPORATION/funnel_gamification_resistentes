import Link from "next/link";

export default function WhatsappPage() {
  return (
    <main
      className="flex w-full flex-col items-center justify-center gap-4 bg-black text-sm"
      style={{ height: "100dvh" }}
    >
      <span className="text-white/40">Em desenvolvimento</span>
      <Link href="/" className="text-white/25 underline underline-offset-4 hover:text-white/50 transition-colors">
        Voltar ao início
      </Link>
    </main>
  );
}
