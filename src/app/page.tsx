"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import SocialPills from "@/components/SocialPills";
import { useLanguage } from "@/contexts/LanguageContext";

export default function HomePage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-neutral-950 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))] text-white">
      {/* Hero Section */}
      <section className="relative h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-neutral-950"></div>
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <div className="flex justify-center mb-8">
            <img
              src="/images/pixelpox.webp"
              alt="MTG Premodern Logo"
              className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-purple-500 shadow-2xl"
            />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent">
            MTG Premodern
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-gray-300 max-w-2xl mx-auto">
            {t("home.description")}
          </p>
          <div className="flex flex-col md:flex-row gap-3 justify-center">
            <Link href="/deck-builder">
              <button className="relative cursor-pointer opacity-90 hover:opacity-100 transition-opacity p-[2px] bg-black rounded-[12px] bg-gradient-to-t from-[#8122b0] to-[#dc98fd] active:scale-95">
                <span className="w-full h-full flex items-center gap-2 px-6 py-3 bg-[#B931FC] text-white rounded-[10px] bg-gradient-to-t from-[#a62ce2] to-[#c045fc] text-base font-medium">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                  {t("navbar.deckBuilder")}
                </span>
              </button>
            </Link>
            <Link href="/game">
              <button className="relative cursor-pointer opacity-90 hover:opacity-100 transition-opacity p-[2px] bg-black rounded-[12px] bg-gradient-to-t from-[#1e40af] to-[#60a5fa] active:scale-95">
                <span className="w-full h-full flex items-center gap-2 px-6 py-3 bg-[#3B82F6] text-white rounded-[10px] bg-gradient-to-t from-[#2563eb] to-[#3b82f6] text-base font-medium relative">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                  >
                    <rect x="2" y="6" width="20" height="12" rx="2" ry="2" />
                    <line x1="6" y1="12" x2="10" y2="12" />
                    <line x1="8" y1="10" x2="8" y2="14" />
                    <line x1="14" y1="10" x2="18" y2="10" />
                    <line x1="14" y1="14" x2="18" y2="14" />
                    <line x1="16" y1="12" x2="16" y2="12" />
                  </svg>
                  {t("navbar.game")}
                  <span className="absolute -top-2 -right-2 bg-yellow-600 text-yellow-100 text-xs px-1.5 py-0.5 rounded-full font-medium">
                    🚧
                  </span>
                </span>
              </button>
            </Link>
            <Link href="/tournament">
              <button className="relative cursor-pointer opacity-90 hover:opacity-100 transition-opacity p-[2px] bg-black rounded-[12px] bg-gradient-to-t from-[#059669] to-[#34d399] active:scale-95">
                <span className="w-full h-full flex items-center gap-2 px-6 py-3 bg-[#10B981] text-white rounded-[10px] bg-gradient-to-t from-[#059669] to-[#10b981] text-base font-medium">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M8 21l8 0" />
                    <path d="M12 17l0 4" />
                    <path d="M7 4l10 0" />
                    <path d="M17 4v8a5 5 0 0 1 -10 0v-8" />
                    <path d="M5 9m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
                    <path d="M19 9m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
                  </svg>
                  {t("navbar.tournament")}
                </span>
              </button>
            </Link>
            <Link href="/life-counter">
              <button className="relative cursor-pointer opacity-90 hover:opacity-100 transition-opacity p-[2px] bg-black rounded-[12px] bg-gradient-to-t from-[#dc2626] to-[#fca5a5] active:scale-95">
                <span className="w-full h-full flex items-center gap-2 px-6 py-3 bg-[#EF4444] text-white rounded-[10px] bg-gradient-to-t from-[#dc2626] to-[#ef4444] text-base font-medium">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    className="w-4 h-4"
                    fill="currentColor"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="0"
                  >
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                  {t("navbar.lifeCounter")}
                </span>
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
            {t("home.subtitle")}
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800 hover:border-purple-500 transition-all duration-300">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-xl font-bold mb-3">
                {t("home.advancedSearch")}
              </h3>
              <p className="text-gray-300">
                {t("home.advancedSearchDescription")}
              </p>
            </div>
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800 hover:border-blue-500 transition-all duration-300">
              <div className="text-4xl mb-4">🃏</div>
              <h3 className="text-xl font-bold mb-3">
                {t("home.deckBuilder")}
              </h3>
              <p className="text-gray-300">
                {t("home.deckBuilderDescription")}
              </p>
            </div>
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800 hover:border-green-500 transition-all duration-300 relative">
              <div className="absolute top-4 right-4">
                <span className="bg-yellow-600 text-yellow-100 text-xs px-2 py-1 rounded-full font-medium">
                  {t("home.gameSimulatorInDevelopment")}
                </span>
              </div>
              <div className="text-4xl mb-4">🎮</div>
              <h3 className="text-xl font-bold mb-3">
                {t("home.gameSimulator")}
              </h3>
              <p className="text-gray-300 mb-3">
                {t("home.gameSimulatorDescription")}
              </p>
              <p className="text-yellow-400 text-sm font-medium">
                {t("home.gameSimulatorComingSoon")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 px-4 bg-gray-900/30">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-8">
            {t("home.aboutPremodern")}
          </h2>
          <p className="text-lg text-gray-300 mb-8 leading-relaxed">
            {t("home.aboutPremodernDescription")}
          </p>
          <div className="grid md:grid-cols-2 gap-8 mt-12">
            <div className="text-left">
              <h3 className="text-xl font-bold mb-4 text-purple-400">
                {t("home.formatPremodern")}
              </h3>
              <div className="text-gray-300 space-y-2 whitespace-pre-line">
                {t("home.formatPremodernDescription")}
              </div>
            </div>
            <div className="text-left">
              <h3 className="text-xl font-bold mb-4 text-blue-400">
                {t("home.tools")}
              </h3>
              <div className="text-gray-300 space-y-2 whitespace-pre-line">
                {t("home.toolsDescription")}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            {t("home.readyToStart")}
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            {t("home.joinCommunity")}
          </p>
          <div className="flex flex-col md:flex-row gap-3 justify-center">
            <Link href="/deck-builder">
              <button className="relative cursor-pointer opacity-90 hover:opacity-100 transition-opacity p-[2px] bg-black rounded-[12px] bg-gradient-to-t from-[#7c3aed] to-[#ec4899] active:scale-95">
                <span className="w-full h-full flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#8b5cf6] to-[#ec4899] text-white rounded-[10px] text-base font-medium">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                  {t("common.start")}
                </span>
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-gray-800">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-gray-400 mb-6">{t("common.copyright")}</p>

          {/* Social Pills */}
          <div className="mb-6">
            <p className="text-sm text-gray-500 mb-4">{t("common.followMe")}</p>
            <SocialPills />
          </div>

          <div className="flex justify-center space-x-6 text-sm text-gray-500">
            <Link
              href="/deck-builder"
              className="hover:text-purple-400 transition-colors"
            >
              {t("common.constructor")}
            </Link>
            <Link
              href="/game"
              className="hover:text-blue-400 transition-colors"
            >
              {t("common.game")}
            </Link>
            <Link
              href="/tournament"
              className="hover:text-green-400 transition-colors"
            >
              {t("common.tournaments")}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
