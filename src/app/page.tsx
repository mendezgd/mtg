"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-neutral-950 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))] text-white">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-neutral-950"></div>
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <div className="flex justify-center mb-8">
            <Image
              src="/images/pixelpox.jpg"
              alt="MTG Premodern Logo"
              width={120}
              height={120}
              className="rounded-full border-4 border-purple-500 shadow-2xl"
            />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent">
            MTG Premodern
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-gray-300 max-w-2xl mx-auto">
            Constructor de mazos, simulador de juego y torneos suizos para
            Magic: The Gathering Premodern
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <Link href="/deck-builder">
              <Button className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 text-lg rounded-lg transition-all duration-300 transform hover:scale-105">
                🃏 Constructor de Mazos
              </Button>
            </Link>
            <Link href="/game">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg rounded-lg transition-all duration-300 transform hover:scale-105">
                🎮 Simulador de Juego
              </Button>
            </Link>
            <Link href="/tournament">
              <Button className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 text-lg rounded-lg transition-all duration-300 transform hover:scale-105">
                🏆 Torneos Suizos
              </Button>
            </Link>
            <Link href="/life-counter">
              <Button className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 text-lg rounded-lg transition-all duration-300 transform hover:scale-105">
                ❤️ Contador de Vidas
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
            Características Principales
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800 hover:border-purple-500 transition-all duration-300">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-xl font-bold mb-3">Búsqueda Avanzada</h3>
              <p className="text-gray-300">
                Busca cartas por nombre, tipo, color y coste de maná. Filtros
                específicos para el formato Premodern.
              </p>
            </div>
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800 hover:border-blue-500 transition-all duration-300">
              <div className="text-4xl mb-4">🃏</div>
              <h3 className="text-xl font-bold mb-3">Constructor de Mazos</h3>
              <p className="text-gray-300">
                Construye y optimiza tus mazos con herramientas avanzadas.
                Soporte para sideboards y validación automática.
              </p>
            </div>
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800 hover:border-green-500 transition-all duration-300">
              <div className="text-4xl mb-4">🎮</div>
              <h3 className="text-xl font-bold mb-3">Simulador de Juego</h3>
              <p className="text-gray-300">
                Juega partidas completas con tus mazos. Interfaz intuitiva y
                todas las mecánicas del juego.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 px-4 bg-gray-900/30">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-8">
            Sobre MTG Premodern
          </h2>
          <p className="text-lg text-gray-300 mb-8 leading-relaxed">
            Premodern es un formato de Magic: The Gathering que incluye cartas
            desde la 4ª edición hasta Scourge (1995-2003). Nuestra plataforma te
            ofrece todas las herramientas necesarias para explorar este formato
            histórico y competitivo.
          </p>
          <div className="grid md:grid-cols-2 gap-8 mt-12">
            <div className="text-left">
              <h3 className="text-xl font-bold mb-4 text-purple-400">
                🎯 Formato Premodern
              </h3>
              <ul className="text-gray-300 space-y-2">
                <li>• Cartas de 4ª edición a Scourge</li>
                <li>• Lista de cartas prohibidas específica</li>
                <li>• Comunidad activa y competitiva</li>
                <li>• Eventos y torneos regulares</li>
              </ul>
            </div>
            <div className="text-left">
              <h3 className="text-xl font-bold mb-4 text-blue-400">
                🛠️ Herramientas
              </h3>
              <ul className="text-gray-300 space-y-2">
                <li>• Búsqueda de cartas en tiempo real</li>
                <li>• Constructor de mazos avanzado</li>
                <li>• Simulador de partidas</li>
                <li>• Gestión de torneos suizos</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            ¿Listo para empezar?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Únete a la comunidad de MTG Premodern y descubre un nuevo mundo de
            estrategias
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <Link href="/deck-builder">
              <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 text-lg rounded-lg transition-all duration-300 transform hover:scale-105">
                Comenzar Ahora
              </Button>
            </Link>
            <Link href="/tournament">
              <Button
                variant="outline"
                className="border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-white px-8 py-4 text-lg rounded-lg transition-all duration-300"
              >
                Ver Torneos
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-gray-800">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-gray-400 mb-4">
            © 2024 MTG Premodern. Desarrollado para la comunidad de Magic: The
            Gathering.
          </p>
          <div className="flex justify-center space-x-6 text-sm text-gray-500">
            <Link
              href="/deck-builder"
              className="hover:text-purple-400 transition-colors"
            >
              Constructor
            </Link>
            <Link
              href="/game"
              className="hover:text-blue-400 transition-colors"
            >
              Juego
            </Link>
            <Link
              href="/tournament"
              className="hover:text-green-400 transition-colors"
            >
              Torneos
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
