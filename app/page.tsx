"use client";

import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  const handleClick = () => {
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(() => {});
    }
    router.push("/chamada-urgente");
  };

  return (
    <main
      className="flex w-full items-center justify-center bg-black"
      style={{ height: "100dvh" }}
    >
      <button
        onClick={handleClick}
        className="rounded-full bg-white px-8 py-4 text-base font-semibold text-black transition-opacity hover:opacity-80 active:opacity-60"
        style={{ cursor: "pointer" }}
      >
        Eu quero saber a verdade
      </button>
    </main>
  );
}
