"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const App: React.FC = () => {
  return (
    <div className="relative flex flex-col h-screen w-screen bg-gray-800 text-white overflow-hidden">
      {/* Fondo optimizado para mobile */}
      <div
        className="absolute inset-0 z-0 bg-cover md:bg-contain opacity-50"
        style={{
          backgroundImage: "url('/images/pox.webp')",
          backgroundPosition: "center",
          filter: "blur(2px)",
        }}
      />

      {/* Contenido responsive */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full bg-black/30 px-4">
        <h1 className="text-4xl md:text-6xl lg:text-8xl font-bold mb-4 md:mb-8 text-center drop-shadow-lg px-2">
          Premodern p0x Show
        </h1>

        <div className="flex flex-col md:flex-row gap-2 md:gap-4 justify-center w-full max-w-xs md:max-w-md lg:max-w-xl">
          <Link href="/deck-builder" className="w-full md:w-auto">
            <Button
              variant="default"
              size="lg"
              className="w-full md:w-48 text-base md:text-lg py-4 md:py-6 bg-sky-600 hover:bg-sky-700 transition-all duration-200 hover:scale-105"
            >
              Create Deck
            </Button>
          </Link>

          <Link href="/game" className="w-full md:w-auto">
            <Button
              variant="default"
              size="lg"
              className="w-full md:w-48 text-base md:text-lg py-4 md:py-6 bg-green-600 hover:bg-green-700 transition-all duration-200 hover:scale-105"
            >
              Challenge (pronto)
            </Button>
          </Link>

          <Link href="/tournament" className="w-full md:w-auto">
            <Button
              variant="default"
              size="lg"
              className="w-full md:w-48 text-base md:text-lg py-4 md:py-6 bg-purple-600 hover:bg-purple-700 transition-all duration-200 hover:scale-105"
            >
              Tournament
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default App;
