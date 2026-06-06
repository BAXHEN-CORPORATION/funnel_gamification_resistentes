"use client";

import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <main
      className="flex w-full items-center justify-center bg-black"
      style={{ height: "100dvh" }}
    >
      <button
        onClick={() => router.push("/chamada-urgente")}
        className="rounded-full bg-white px-8 py-4 text-base font-semibold text-black transition-opacity hover:opacity-80 active:opacity-60"
        style={{ cursor: "pointer" }}
      >
        Eu quero saber a verdade
      </button>
    </main>
  );
}
