"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const App: React.FC = () => {
  return (
    <div className="relative flex flex-col h-screen w-screen bg-gray-800 text-white">
      {/* Fondo con imagen y overlay */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center opacity-50"
        style={{
          backgroundImage: "url('/images/background.webp')",
        }}
      />

      {/* Contenido */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full bg-black/30">
        <h1 className="text-8xl font-bold mb-8 text-center drop-shadow-lg">
          Premodern p0x Show
        </h1>
        <div className="flex flex-col md:flex-row gap-4">
          <Link href="/deck-builder">
            <Button
              variant="default"
              size="lg"
              className="text-lg bg-blue-600 hover:bg-blue-700 transition-transform duration-200 hover:scale-105"
            >
              Create Deck
            </Button>
          </Link>
          <Link href="/game">
            <Button
              variant="default"
              size="lg"
              className="text-lg bg-green-600 hover:bg-green-700 transition-transform duration-200 hover:scale-105"
            >
              Challenge Friend
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default App;
