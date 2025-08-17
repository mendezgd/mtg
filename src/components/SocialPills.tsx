"use client";

import {
  Youtube,
  Instagram,
  Twitter,
  Twitch,
  ExternalLink,
} from "lucide-react";

interface SocialPillsProps {
  className?: string;
}

export default function SocialPills({ className = "" }: SocialPillsProps) {
  const handleSocialClick = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className={`flex justify-center space-x-4 ${className}`}>
      {/* YouTube */}
      <button
        onClick={() => handleSocialClick("https://www.youtube.com/@fattiepox")}
        className="group flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-full transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
        aria-label="Sígueme en YouTube"
      >
        <Youtube className="w-4 h-4" />
        <span className="text-sm font-medium hidden sm:inline">YouTube</span>
      </button>

      {/* Instagram */}
      <button
        onClick={() =>
          handleSocialClick("https://www.instagram.com/bondiagalera/")
        }
        className="group flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-full transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
        aria-label="Sígueme en Instagram"
      >
        <Instagram className="w-4 h-4" />
        <span className="text-sm font-medium hidden sm:inline">Instagram</span>
      </button>

      {/* X (Twitter) */}
      <button
        onClick={() => handleSocialClick("https://x.com/poxshow")}
        className="group flex items-center gap-2 px-4 py-2 bg-black dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-200 text-white dark:text-black rounded-full transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
        aria-label="Sígueme en X"
      >
        <Twitter className="w-4 h-4" />
        <span className="text-sm font-medium hidden sm:inline">X</span>
      </button>

      {/* Twitch */}
      <button
        onClick={() => handleSocialClick("https://www.twitch.tv/fattiepox")}
        className="group flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-full transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
        aria-label="Sígueme en Twitch"
      >
        <Twitch className="w-4 h-4" />
        <span className="text-sm font-medium hidden sm:inline">Twitch</span>
      </button>

      {/* Kick (placeholder - puedes agregar el icono cuando esté disponible) */}
      <button
        onClick={() => handleSocialClick("https://kick.com/fattiepox")}
        className="group flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-full transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
        aria-label="Sígueme en Kick"
      >
        <div className="w-4 h-4 flex items-center justify-center">
          <span className="text-xs font-bold">K</span>
        </div>
        <span className="text-sm font-medium hidden sm:inline">Kick</span>
      </button>
    </div>
  );
}
